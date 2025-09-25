import { NextRequest } from 'next/server';
import { WebSocket } from 'ws';

export async function POST(req: NextRequest) {
  try {
    const { text, voice_type, speed_ratio = 1.0 } = await req.json();

    if (!text || !voice_type) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required parameters: text and voice_type' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 创建 WebSocket 连接
    const wsUrl = `wss://${process.env.OPENAI_API_BASE_URL?.replace('https://', '')}/v1/voice/tts`;
    const ws = new WebSocket(wsUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'VoiceType': voice_type,
      }
    });

    // 创建 ReadableStream 来处理流式数据
    const stream = new ReadableStream({
      start(controller) {
        ws.on('open', () => {
          // 发送 TTS 请求
          const request = {
            audio: {
              voice_type: voice_type,
              encoding: "mp3",
              speed_ratio: speed_ratio
            },
            request: {
              text: text
            }
          };
          
          ws.send(JSON.stringify(request));
        });

        ws.on('message', (data) => {
          try {
            const response = JSON.parse(data.toString());
            
            if (response.data) {
              // 解码 base64 音频数据
              const audioBuffer = Buffer.from(response.data, 'base64');
              controller.enqueue(audioBuffer);
            }
            
            // 检查是否完成
            if (response.sequence < 0) {
              controller.close();
              ws.close();
            }
          } catch (error) {
            console.error('Error processing WebSocket message:', error);
          }
        });

        ws.on('error', (error) => {
          console.error('WebSocket error:', error);
          controller.error(error);
        });

        ws.on('close', () => {
          controller.close();
        });
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (error) {
    console.error('TTS Stream error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 