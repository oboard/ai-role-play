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
  private isInitialized = false;
  private permissionGranted = false;

  constructor() {
    // Only fetch token in browser environment, don't initialize microphone yet
    if (typeof window !== 'undefined') {
      this.fetchToken();
    }
  }

  private async initializeMediaRecorder() {
    try {
      // Check if we're in browser environment and APIs are available
      if (typeof window === 'undefined' || !navigator.mediaDevices) {
        return;
      }

      // Check if already initialized and permission granted
      if (this.permissionGranted && this.mediaRecorder) {
        return;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.permissionGranted = true;
      
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
      this.permissionGranted = false;
      throw error; // Re-throw to let caller handle the error
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

  async startRecording() {
    // Initialize microphone on first use
    if (!this.isInitialized) {
      await this.initializeMediaRecorder();
      this.isInitialized = true;
    }

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
    if (this.audioChunks.length === 0 || typeof window === 'undefined') {
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
      
      // 处理ASR API响应格式: { code: 1, message: "成功", result: { text: "...", wordInfoDTOList: [...] } }
      if (result && result.code === 1 && result.message === "成功") {
        // API调用成功
        if (result.result && result.result.text) {
          // 有识别结果
          const recognizedText = result.result.text;
          if (this.onResultCallback) {
            this.onResultCallback(recognizedText);
          }
        } else {
          // 没有识别到文字，但API调用成功
          console.log('No speech detected');
          if (this.onResultCallback) {
            this.onResultCallback(''); // 返回空字符串表示没有识别到内容
          }
        }
      } else {
        // API调用失败或其他错误情况
        console.error('ASR API returned error:', result);
        if (this.onResultCallback) {
          this.onResultCallback(''); // 错误时返回空字符串
        }
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