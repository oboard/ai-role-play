class RealtimeTtsService {
  private audioContext: AudioContext | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private isEnabled = true;
  private voiceType = '';
  private speedRatio = 1.0;
  private textBuffer = '';
  private isStreaming = false;
  private isPlaying = false;
  private audioQueue: AudioBuffer[] = [];
  private currentPlayingIndex = 0;
  private onStatusChange?: (status: { isStreaming: boolean; isPlaying: boolean }) => void;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeAudioContext();
    }
  }

  private async initializeAudioContext() {
    try {
      if (typeof window === 'undefined') {
        return;
      }

      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  setVoice(voiceType: string) {
    this.voiceType = voiceType;
  }

  setSpeed(speedRatio: number) {
    this.speedRatio = speedRatio;
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
    this.stopCurrentAudio();
  }

  setStatusChangeCallback(callback: (status: { isStreaming: boolean; isPlaying: boolean }) => void) {
    this.onStatusChange = callback;
  }

  private updateStatus() {
    if (this.onStatusChange) {
      this.onStatusChange({
        isStreaming: this.isStreaming,
        isPlaying: this.isPlaying
      });
    }
  }

  private stopCurrentAudio() {
    if (this.sourceNode) {
      this.sourceNode.stop();
      this.sourceNode = null;
    }
    this.isPlaying = false;
    this.updateStatus();
  }

  // 重置状态
  reset() {
    this.textBuffer = '';
    this.isStreaming = false;
    this.audioQueue = [];
    this.currentPlayingIndex = 0;
    this.stopCurrentAudio();
    this.updateStatus();
  }

  // 过滤掉动作描述的括号，保留对话内容
  private filterActionBrackets(text: string): string {
    const protectedText = text.replace(/"([^"]*)"/g, (match, content) => {
      return `__QUOTE_START__${content}__QUOTE_END__`;
    });

    let filteredText = protectedText
      .replace(/（[^）]*）/g, '')
      .replace(/\([^)]*\)/g, '')
      .replace(/\[[^\]]*\]/g, '')
      .replace(/\{[^}]*\}/g, '')
      .replace(/【[^】]*】/g, '');

    filteredText = filteredText
      .replace(/__QUOTE_START__/g, '"')
      .replace(/__QUOTE_END__/g, '"')
      .replace(/\s+/g, ' ')
      .trim();

    return filteredText;
  }

  // 开始实时TTS流式处理
  async startRealtimeStream(initialText: string = '') {
    if (!this.isEnabled || !this.voiceType) {
      return;
    }

    this.reset();
    this.isStreaming = true;
    this.textBuffer = this.filterActionBrackets(initialText);
    this.updateStatus();

    // 如果有初始文本，立即开始处理
    if (this.textBuffer.trim()) {
      this.processTextChunk(this.textBuffer);
    }
  }

  // 添加流式文本
  addStreamText(newText: string) {
    if (!this.isEnabled || !this.voiceType || !this.isStreaming) {
      return;
    }

    const filteredText = this.filterActionBrackets(newText);
    if (!filteredText.trim()) {
      return;
    }

    this.textBuffer += filteredText;

    // 检查是否有完整的句子可以处理
    this.checkAndProcessSentences();
  }

  // 检查并处理完整的句子
  private checkAndProcessSentences() {
    const sentences = this.textBuffer.match(/[^。！？.!?]*[。！？.!?]/g);

    if (sentences && sentences.length > 0) {
      // 处理完整的句子
      const completeSentences = sentences.join('');
      this.processTextChunk(completeSentences);

      // 从缓冲区移除已处理的句子
      this.textBuffer = this.textBuffer.slice(completeSentences.length);
    }
  }

  // 结束流式处理
  finishStream() {
    if (!this.isStreaming) {
      return;
    }

    // 处理剩余的文本
    if (this.textBuffer.trim()) {
      this.processTextChunk(this.textBuffer);
      this.textBuffer = '';
    }

    this.isStreaming = false;
    this.updateStatus();
  }

  // 处理文本块
  private async processTextChunk(text: string) {
    if (!text.trim() || !this.voiceType) {
      return;
    }

    try {
      const response = await fetch('/api/voice/tts-ws-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          voice_type: this.voiceType,
          speed_ratio: this.speedRatio
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      let totalLength = 0;
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        chunks.push(value);
        totalLength += value.length;
      }

      if (totalLength === 0) {
        return;
      }

      // 合并音频数据
      const audioData = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        audioData.set(chunk, offset);
        offset += chunk.length;
      }

      // 解码音频数据
      if (this.audioContext) {
        const audioBuffer = await this.audioContext.decodeAudioData(audioData.buffer);
        this.audioQueue.push(audioBuffer);

        // 如果当前没有播放，开始播放
        if (!this.isPlaying) {
          this.playNextAudio();
        }
      }

    } catch (error) {
      console.error('Realtime TTS conversion error:', error);
    }
  }

  // 播放下一个音频
  private async playNextAudio() {
    if (this.currentPlayingIndex >= this.audioQueue.length || !this.audioContext) {
      this.isPlaying = false;
      this.updateStatus();
      return;
    }

    const audioBuffer = this.audioQueue[this.currentPlayingIndex];
    this.currentPlayingIndex++;

    try {
      this.stopCurrentAudio();

      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);

      source.onended = () => {
        this.sourceNode = null;
        // 播放下一个音频
        this.playNextAudio();
      };

      source.start();
      this.sourceNode = source;
      this.isPlaying = true;
      this.updateStatus();

    } catch (error) {
      console.error('Audio playback error:', error);
      this.isPlaying = false;
      this.updateStatus();
    }
  }

  // 暂停播放
  pause() {
    this.stopCurrentAudio();
  }

  // 恢复播放
  resume() {
    if (!this.isPlaying && this.currentPlayingIndex < this.audioQueue.length) {
      this.playNextAudio();
    }
  }

  // 停止所有播放
  stop() {
    this.stopCurrentAudio();
    this.currentPlayingIndex = this.audioQueue.length; // 跳过所有剩余音频
  }

  // 获取当前状态
  getStatus() {
    return {
      isEnabled: this.isEnabled,
      isStreaming: this.isStreaming,
      isPlaying: this.isPlaying,
      voiceType: this.voiceType,
      speedRatio: this.speedRatio
    };
  }
}

export const realtimeTtsService = new RealtimeTtsService();