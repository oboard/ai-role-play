class TtsService {
  private audioContext: AudioContext | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private isEnabled = true; // 默认开启
  private voiceType = '';
  private speedRatio = 1.0;
  private textBuffer = '';
  private bufferTimer: NodeJS.Timeout | null = null;
  private lastProcessedLength = 0; // 记录已处理的文本长度
  private isProcessing = false; // 防止重复处理

  constructor() {
    // Only initialize in browser environment
    if (typeof window !== 'undefined') {
      this.initializeAudioContext();
    }
  }

  private async initializeAudioContext() {
    try {
      // Check if we're in browser environment
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

  private stopCurrentAudio() {
    if (this.sourceNode) {
      this.sourceNode.stop();
      this.sourceNode = null;
    }
  }

  // 重置状态
  reset() {
    this.textBuffer = '';
    this.lastProcessedLength = 0;
    this.isProcessing = false;
    if (this.bufferTimer) {
      clearTimeout(this.bufferTimer);
      this.bufferTimer = null;
    }
  }

  // 过滤掉动作描述的括号，保留对话内容
  private filterActionBrackets(text: string): string {
    // 先保护双引号内的内容
    const protectedText = text.replace(/"([^"]*)"/g, (match, content) => {
      return `__QUOTE_START__${content}__QUOTE_END__`;
    });

    // 移除各种动作描述的括号
    let filteredText = protectedText
      .replace(/（[^）]*）/g, '') // 移除 （）
      .replace(/\([^)]*\)/g, '') // 移除 ()
      .replace(/\[[^\]]*\]/g, '') // 移除 []
      .replace(/\{[^}]*\}/g, '') // 移除 {}
      .replace(/【[^】]*】/g, ''); // 移除 【】

    // 恢复双引号
    filteredText = filteredText
      .replace(/__QUOTE_START__/g, '"')
      .replace(/__QUOTE_END__/g, '"')
      .replace(/\s+/g, ' ') // 将多个空格合并为一个
      .trim();

    return filteredText;
  }

  // 添加文本到缓冲区（流式过程中只收集，不处理）
  addText(text: string) {
    if (!this.isEnabled || !this.voiceType) {
      return;
    }

    // 过滤掉动作描述的括号
    const filteredText = this.filterActionBrackets(text);

    if (!filteredText.trim()) {
      return; // 如果过滤后没有内容，不处理
    }

    // 只收集新增的文本，不立即处理
    if (filteredText.length > this.lastProcessedLength) {
      const newText = filteredText.slice(this.lastProcessedLength);
      this.textBuffer += newText;
    }
  }

  // 处理完整的文本（在流式结束后调用）
  processCompleteText() {
    if (!this.isEnabled || !this.voiceType || !this.textBuffer.trim() || this.isProcessing) {
      return;
    }

    const textToProcess = this.textBuffer.trim();
    this.textBuffer = '';
    this.lastProcessedLength = 0;

    this.processTextBuffer(textToProcess);
  }

  private async processTextBuffer(textToProcess: string) {
    if (!textToProcess.trim() || !this.voiceType || this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      // 使用实时转换接口
      const response = await fetch('/api/voice/tts-ws-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textToProcess,
          voice_type: this.voiceType,
          speed_ratio: this.speedRatio
        }),
      });

      if (!response.ok) {
        throw new Error(`Realtime TTS API error: ${response.status}`);
      }

      // 处理流式音频数据
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

      // 合并所有音频数据
      const audioData = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        audioData.set(chunk, offset);
        offset += chunk.length;
      }

      // 解码音频数据
      if (this.audioContext) {
        const audioBuffer = await this.audioContext.decodeAudioData(audioData.buffer);
        await this.playAudioBuffer(audioBuffer);
      }

    } catch (error) {
      console.error('Realtime TTS conversion error:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async playAudioBuffer(audioBuffer: AudioBuffer) {
    if (!this.audioContext) {
      return;
    }

    try {
      // 停止当前播放
      this.stopCurrentAudio();

      // 创建音频源
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);

      source.onended = () => {
        this.sourceNode = null;
      };

      source.start();
      this.sourceNode = source;
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  }

  // 立即处理当前缓冲区
  flush() {
    this.processCompleteText();
  }
}

export const ttsService = new TtsService();