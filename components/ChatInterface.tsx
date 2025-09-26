'use client';

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import {
  Action,
  Actions
} from '@/components/ai-elements/actions';
import { Fragment, useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Response } from '@/components/ai-elements/response';
import { CopyIcon, MicIcon, RefreshCcwIcon } from 'lucide-react';
import { chatStorage } from '@/lib/chatStorage';
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@/components/ai-elements/sources';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning';
import { Loader } from '@/components/ai-elements/loader';
import { Character } from '@/types/game';
import { ttsService } from '@/lib/ttsService';
import VoiceInput from './VoiceInput';

const ChatInterface = (props: {
  character: Character;
}) => {
  const [input, setInput] = useState('');
  const [useMicrophone, setUseMicrophone] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastAssistantMessageRef = useRef<string>('');
  const lastMessageCountRef = useRef<number>(0);
  
  // 从localStorage加载初始消息
  const initialMessages = chatStorage.loadMessages(props.character.id);
  
  const { messages, sendMessage, status, regenerate } = useChat({
    messages: initialMessages, // 设置初始消息
    transport: new DefaultChatTransport({
      api: '/api/chat'
    })
  });

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 持久化消息 - 每当消息变化时自动保存
  useEffect(() => {
    if (messages.length > 0) {
      chatStorage.saveMessages(props.character.id, messages);
    }
  }, [messages, props.character.id]);

  // 监听流式文本变化
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      // 检查是否是新消息
      if (messages.length > lastMessageCountRef.current) {
        lastMessageCountRef.current = messages.length;
        lastAssistantMessageRef.current = '';
        ttsService.reset(); // 重置 TTS 服务状态
      }
      
      if (lastMessage.role === 'assistant' && status === 'streaming') {
        // 获取最新的文本内容
        const currentText = lastMessage.parts
          .filter(part => part.type === 'text')
          .map(part => part.text)
          .join('');
        
        // 只收集文本，不立即处理
        if (currentText.length > lastAssistantMessageRef.current.length) {
          const newText = currentText.slice(lastAssistantMessageRef.current.length);
          ttsService.addText(newText);
          lastAssistantMessageRef.current = currentText;
        }
      } else if (status !== 'streaming' && lastMessage.role === 'assistant') {
        // 流式结束，处理完整的文本
        ttsService.processCompleteText();
        lastAssistantMessageRef.current = '';
      }
    }
  }, [messages, status]);

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    sendMessage(
      {
        text: message.text || 'Sent with attachments',
        files: message.files
      },
      {
        body: {
          character: props.character
        }
      }
    );
    setInput('');
  };

  const handleVoiceText = (text: string) => {
    // 将识别到的文本添加到输入框
    setInput(text);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 relative size-full h-full">
      <div className="flex flex-col h-full">
        <Conversation className="h-full">
          <ConversationContent>
            {messages.map((message) => (
              <div key={message.id}>
                {message.role === 'assistant' && message.parts.filter((part) => part.type === 'source-url').length > 0 && (
                  <Sources>
                    <SourcesTrigger
                      count={
                        message.parts.filter(
                          (part) => part.type === 'source-url',
                        ).length
                      }
                    />
                    {message.parts.filter((part) => part.type === 'source-url').map((part, i) => (
                      <SourcesContent key={`${message.id}-${i}`}>
                        <Source
                          key={`${message.id}-${i}`}
                          href={part.url}
                          title={part.url}
                        />
                      </SourcesContent>
                    ))}
                  </Sources>
                )}
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case 'text':
                      return (
                        <Fragment key={`${message.id}-${i}`}>
                          <Message from={message.role}>
                            <MessageContent>
                              <Response>
                                {part.text}
                              </Response>
                            </MessageContent>
                          </Message>
                          {message.role === 'assistant' && i === messages.length - 1 && (
                            <Actions className="mt-2">
                              <Action
                                onClick={() => regenerate()}
                                label="Retry"
                              >
                                <RefreshCcwIcon className="size-3" />
                              </Action>
                              <Action
                                onClick={() =>
                                  navigator.clipboard.writeText(part.text)
                                }
                                label="Copy"
                              >
                                <CopyIcon className="size-3" />
                              </Action>
                            </Actions>
                          )}
                        </Fragment>
                      );
                    case 'reasoning':
                      return (
                        <Reasoning
                          key={`${message.id}-${i}`}
                          className="w-full"
                          isStreaming={status === 'streaming' && i === message.parts.length - 1 && message.id === messages.at(-1)?.id}
                        >
                          <ReasoningTrigger />
                          <ReasoningContent>{part.text}</ReasoningContent>
                        </Reasoning>
                      );
                    default:
                      return null;
                  }
                })}
              </div>
            ))}
            {status === 'submitted' && <Loader />}
            <div ref={messagesEndRef} />
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <PromptInput onSubmit={handleSubmit} className="mt-4" globalDrop multiple>
          <PromptInputBody>
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
              value={input}
            />
          </PromptInputBody>
          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputButton
                onClick={() => setUseMicrophone(!useMicrophone)}
                variant={useMicrophone ? 'default' : 'ghost'}
              >
                <MicIcon size={16} />
                <span className="sr-only">Microphone</span>
              </PromptInputButton>
            </PromptInputTools>
            <VoiceInput 
              onTextRecognized={handleVoiceText}
              className="mb-2"
            />
            <PromptInputSubmit disabled={!input && !status} status={status} />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
};

export default ChatInterface;