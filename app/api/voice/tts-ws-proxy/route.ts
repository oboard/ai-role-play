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

    // 创建到七牛云的 WebSocket 连接
    const wsUrl = `wss://openai.qiniu.com/v1/voice/tts`;
    const ws = new WebSocket(wsUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'VoiceType': voice_type,
      }
    });

    // 创建 ReadableStream 来处理流式数据
    const stream = new ReadableStream({
      start(controller) {
        let isClosed = false;
        let hasStarted = false;

        const closeController = () => {
          if (!isClosed) {
            isClosed = true;
            controller.close();
          }
        };

        ws.on('open', () => {
          console.log('WebSocket connected to Qiniu');
          
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
          hasStarted = true;
        });

        ws.on('message', (data) => {
          try {
            const response = JSON.parse(data.toString());
            console.log('Received from Qiniu:', response);
            
            if (response.data) {
              // 解码 base64 音频数据
              const audioBuffer = Buffer.from(response.data, 'base64');
              controller.enqueue(audioBuffer);
            }
            
            // 检查是否完成
            if (response.sequence < 0) {
              console.log('TTS completed');
              closeController();
              // 不关闭 WebSocket，保持连接
            }
          } catch (error) {
            console.error('Error processing WebSocket message:', error);
          }
        });

        ws.on('error', (error) => {
          console.error('WebSocket error:', error);
          closeController();
        });

        ws.on('close', () => {
          console.log('WebSocket closed by server');
          closeController();
        });

        // 设置超时，防止连接一直保持
        setTimeout(() => {
          if (!isClosed) {
            console.log('WebSocket timeout, closing');
            closeController();
          }
        }, 30000); // 30秒超时
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('TTS WS Proxy error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 