import type { Character, Message } from './types';

export async function chatWithCharacter(
  userMessage: string,
  character: Character,
  conversationHistory: Message[]
): Promise<string> {
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
      }),
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();

    if (!data.content) {
      throw new Error('API返回数据格式错误');
    }

    return data.content;
  } catch (error) {
    console.error('AI服务调用失败:', error);

    // 返回角色特色的错误回复
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

    return fallbackResponses[character.id] || '抱歉，我现在无法回应，请稍后再试。';
  }
}