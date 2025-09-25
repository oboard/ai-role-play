import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text, voice_type, speed_ratio = 1.0 } = await req.json();

    if (!text || !voice_type) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: text and voice_type' },
        { status: 400 }
      );
    }

    const response = await fetch(`${process.env.OPENAI_API_BASE_URL}/voice/tts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        audio: {
          voice_type: voice_type,
          encoding: "mp3",
          speed_ratio: speed_ratio
        },
        request: {
          text: text
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('TTS API error:', response.status, errorData);
      return NextResponse.json(
        { success: false, error: `TTS API error: ${response.status}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    
    // 将 base64 数据转换为音频 URL
    const audioData = result.data;
    const audioUrl = `data:audio/mp3;base64,${audioData}`;

    return NextResponse.json({
      success: true,
      data: {
        audioUrl: audioUrl,
        duration: result.addition?.duration || '0',
        reqid: result.reqid
      }
    });

  } catch (error) {
    console.error('TTS error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
