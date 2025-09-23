import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
// Allow streaming responses up to 30 secondsd
export const maxDuration = 30;

interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  personality: string;
  knowledge: string[];
  secrets?: string[];
}

function generateSystemPrompt(character: Character | null): string {
  if (!character) {
    return 'You are a helpful assistant that can answer questions and help with tasks';
  }

  const systemPrompt = `你正在扮演一个角色进行对话。请严格按照以下角色设定进行回应：

**角色身份：**
- 姓名：${character.name}
- 职业/身份：${character.role}
- 角色描述：${character.description}

**性格特征：**
${character.personality}

**已知信息：**
${character.knowledge.map((k, i) => `${i + 1}. ${k}`).join('\n')}

${character.secrets && character.secrets.length > 0 ? `
**秘密信息（只有在合适的时机才会透露）：**
${character.secrets.map((s, i) => `${i + 1}. ${s}`).join('\n')}
` : ''}

**对话要求：**
1. 始终保持角色身份，用第一人称回应
2. 根据角色性格特征调整说话方式和语气
3. 只分享角色应该知道的信息
4. 秘密信息需要在对话中逐渐透露，不要一次性全部说出
5. 保持对话的自然性和真实感
6. 如果被问及不符合角色设定的问题，要以角色的身份合理回避

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