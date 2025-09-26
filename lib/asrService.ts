import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { audio_url, format = 'mp3' } = await req.json();

    if (!audio_url) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: audio_url' },
        { status: 400 }
      );
    }

    const response = await fetch(`${process.env.OPENAI_API_BASE_URL}/voice/asr`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'asr',
        audio: {
          format: format,
          url: audio_url
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { success: false, error: `ASR API error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('ASR API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

class AsrService {
  private isEnabled = false;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private onResultCallback: ((text: string) => void) | null = null;
  private token: string | null = null;

  constructor() {
    this.initializeMediaRecorder();
    this.fetchToken();
  }

  private async initializeMediaRecorder() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.processAudio();
      };
    } catch (error) {
      console.error('Failed to initialize media recorder:', error);
    }
  }

  private async fetchToken() {
    try {
      const response = await fetch('https://u.oboard.eu.org/api/token');
      if (response.ok) {
        this.token = await response.text();
      }
    } catch (error) {
      console.error('Failed to fetch token:', error);
    }
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  setOnResult(callback: (text: string) => void) {
    this.onResultCallback = callback;
  }

  startRecording() {
    if (!this.mediaRecorder || this.mediaRecorder.state === 'recording') {
      return;
    }

    this.audioChunks = [];
    this.mediaRecorder.start();
  }

  stopRecording() {
    if (!this.mediaRecorder || this.mediaRecorder.state !== 'recording') {
      return;
    }

    this.mediaRecorder.stop();
  }

  private async processAudio() {
    if (this.audioChunks.length === 0) {
      return;
    }

    const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
    
    try {
      // 如果没有 token，先获取
      if (!this.token) {
        await this.fetchToken();
      }

      // 转换为 base64
      const audioBase64 = await this.blobToBase64(audioBlob);
      
      // 调用第三方 ASR API
      const response = await fetch('https://cloudsearchapi.ulearning.cn/asr', {
        method: 'POST',
        headers: {
          'Authorization': this.token || '',
          'Connection': 'keep-alive',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          audioBase64: audioBase64,
          assistantId: 6
        })
      });

      const result = await response.json();
      
      // 处理不同的返回格式
      if (result && result.text) {
        // 有识别结果
        const recognizedText = result.text;
        if (this.onResultCallback) {
          this.onResultCallback(recognizedText);
        }
      } else if (result && result.code === 1 && result.message === "成功") {
        // 没有识别到文字，但没有错误
        console.log('No speech detected');
        if (this.onResultCallback) {
          this.onResultCallback(''); // 返回空字符串表示没有识别到内容
        }
      } else {
        // 其他错误情况
        console.error('ASR API returned unexpected result:', result);
      }
    } catch (error) {
      console.error('ASR processing error:', error);
    }
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // 移除 data:audio/wav;base64, 前缀
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }
}

export const asrService = new AsrService(); 