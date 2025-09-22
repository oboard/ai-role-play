import type { Character, Message } from './types';

const API_URL = 'https://openai.qiniu.com/v1/chat/completions';
const API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || 'your-api-key-here';

export async function chatWithCharacter(
  userMessage: string,
  character: Character,
  conversationHistory: Message[]
): Promise<string> {
  try {
    // 构建角色提示词
    const systemPrompt = `你现在要扮演${character.name}这个角色。

角色信息：
- 姓名：${character.name}
- 分类：${character.category}
- 描述：${character.description}
- 性格：${character.personality}
- 背景：${character.background}
- 说话风格：${character.speakingStyle}

重要要求：
1. 完全沉浸在角色中，始终以第一人称回应
2. 保持角色的性格特点和说话风格
3. 结合角色的背景知识和经历来回答
4. 回答要自然流畅，像真人对话一样
5. 如果用户问到角色不知道的现代事物，要以角色的视角和时代背景来理解和回应
6. 保持对话的连贯性和趣味性
7. 回答长度适中，不要过长或过短

请记住，你就是${character.name}，不是AI助手。`;

    // 构建对话历史
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: userMessage }
    ];

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 500,
        temperature: 0.8,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('API返回数据格式错误');
    }

    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('AI服务调用失败:', error);
    
    // 返回角色特色的错误回复
    const fallbackResponses = {
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