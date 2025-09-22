import type { Character, Message } from './types';

// 流式响应回调函数类型
export type StreamCallback = (chunk: string) => void;
export type StreamCompleteCallback = (fullContent: string) => void;
export type StreamErrorCallback = (error: Error) => void;

// 流式聊天函数
export async function chatWithCharacterStream(
  userMessage: string,
  character: Character,
  conversationHistory: Message[],
  onChunk: StreamCallback,
  onComplete: StreamCompleteCallback,
  onError: StreamErrorCallback
): Promise<void> {
  let fullContent = '';
  let retryCount = 0;
  const maxRetries = 2;

  const attemptStream = async (): Promise<void> => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage,
          character,
          conversationHistory,
          stream: true
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法获取响应流');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let hasReceivedData = false;

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          if (!hasReceivedData) {
            throw new Error('未收到有效响应数据');
          }
          onComplete(fullContent);
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data.trim() === '') continue;
            if (data.trim() === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.content || parsed.delta?.content || parsed.choices?.[0]?.delta?.content;

              if (content) {
                hasReceivedData = true;
                fullContent += content;
                onChunk(content);
              }
            } catch (e) {
              console.error('解析SSE数据失败:', e);
              continue;
            }
          }
        }
      }
    } catch (error) {
      console.error(`流式聊天失败 (尝试 ${retryCount + 1}/${maxRetries + 1}):`, error);

      if (retryCount < maxRetries) {
        retryCount++;
        // 指数退避重试
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        return attemptStream();
      }

      // 最终失败，返回角色特色的错误回复
      const fallbackResponses: Record<Character['id'], string> = {
        'harry-potter': '抱歉，我的魔法似乎出了点问题，请稍后再试。',
        'socrates': '我的思考被打断了，让我们稍后再继续这场对话。',
        'einstein': '看起来时空连续体出现了扭曲，请给我一点时间。',
        'sherlock-holmes': '线索暂时中断了，华生，我们稍后再继续推理。',
        'leonardo-da-vinci': '我的思维机器需要一点维修时间。',
        'confucius': '子曰：知之为知之，不知为不知。现在我需要思考一下。',
        'elizabeth-bennet': '我的思绪有些混乱，请允许我整理一下。',
        'gandalf': '黑暗力量在干扰我们的交流，请稍等片刻。'
      };

      const fallbackMessage = fallbackResponses[character.id] || '抱歉，我现在无法回应，请稍后再试。';
      onError(new Error(fallbackMessage));
    }
  };

  await attemptStream();
}