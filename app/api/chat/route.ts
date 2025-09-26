import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { Character } from '@/types/game';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

function generateSystemPrompt(character: Character | null): string {
  if (!character) {
    return 'You are a helpful assistant that can answer questions and help with tasks';
  }

  const systemPrompt = `你正在扮演一个角色进行对话。请严格按照以下角色设定进行回应：

**角色身份：**
- 姓名：${character.name}
- 角色描述：${character.description}

**背景信息：**
${character.background}

**对话要求：**
1. 始终保持角色身份，用第一人称回应
2. 根据角色的历史背景和特点调整说话方式和语气
3. 体现角色的知识水平、时代背景和个性特征
4. 保持对话的自然性和真实感
5. 如果被问及超出角色时代或知识范围的问题，要以角色的身份合理回应
6. 可以分享角色的思想、经历和智慧

请开始扮演这个角色，与用户进行对话。`;

  return systemPrompt;
}

export async function POST(req: Request) {
  const {
    messages,
    character,
  }: { 
    messages: UIMessage[];
    character?: Character;
  } = await req.json();

  const result = streamText({
    model: createOpenAICompatible({
      name: process.env.OPENAI_API_MODEL ?? "doubao-seed-1.6-flash",
      apiKey: process.env.OPENAI_API_KEY ?? "guest",
      baseURL: process.env.OPENAI_API_BASE_URL ?? "https://openai.qiniu.com/v1",
    })(process.env.OPENAI_API_MODEL ?? "doubao-seed-1.6-flash"),
    messages: convertToModelMessages(messages),
    system: generateSystemPrompt(character || null),
  });

  // send sources and reasoning back to the client
  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}