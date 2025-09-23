import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
// Allow streaming responses up to 30 secondsd
export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
  }: { 
    messages: UIMessage[];
  } = await req.json();

  const result = streamText({
    model: createOpenAICompatible({
      name: process.env.OPENAI_API_MODEL ?? "doubao-seed-1.6-flash",
      apiKey: process.env.OPENAI_API_KEY ?? "guest",
      baseURL: process.env.OPENAI_API_BASE_URL ?? "https://openai.qiniu.com/v1",
    })(process.env.OPENAI_API_MODEL ?? "doubao-seed-1.6-flash"),
    messages: convertToModelMessages(messages),
    system:
      'You are a helpful assistant that can answer questions and help with tasks',
  });

  // send sources and reasoning back to the client
  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}