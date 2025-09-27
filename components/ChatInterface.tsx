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
import { CopyIcon, MicIcon, RefreshCcwIcon, Volume2Icon, VolumeXIcon, PlayIcon, PauseIcon, StopCircleIcon } from 'lucide-react';
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
import { realtimeTtsService } from '@/lib/realtimeTtsService';
import VoiceInput from './VoiceInput';
import SkillButtons from './SkillButtons';

const ChatInterface = (props: {
  character: Character;
}) => {
  const [input, setInput] = useState('');
  const [isTtsEnabled, setIsTtsEnabled] = useState<boolean>(true);
  const [ttsStatus, setTtsStatus] = useState({ isStreaming: false, isPlaying: false });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastAssistantMessageRef = useRef<string>('');
  const lastMessageCountRef = useRef<number>(0);
  const isStreamingStartedRef = useRef<boolean>(false);

  // 从localStorage加载初始消息
  const initialMessages = chatStorage.loadMessages(props.character.id);

  // 根据角色设置默认语音
  useEffect(() => {
    if (props.character.voice) {
      realtimeTtsService.setVoice(props.character.voice.voice_type);
    }

    // 设置状态变化回调
    realtimeTtsService.setStatusChangeCallback(setTtsStatus);
  }, [props.character]);

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
        isStreamingStartedRef.current = false;
        realtimeTtsService.reset(); // 重置 TTS 服务状态
      }

      if (lastMessage.role === 'assistant' && status === 'streaming' && isTtsEnabled) {
        // 获取最新的文本内容
        const currentText = lastMessage.parts
          .filter((part: any) => part.type === 'text')
          .map((part: any) => part.text)
          .join('');

        // 开始实时流式处理
        if (!isStreamingStartedRef.current && currentText.trim()) {
          realtimeTtsService.startRealtimeStream(currentText);
          isStreamingStartedRef.current = true;
          lastAssistantMessageRef.current = currentText;
        } else if (currentText.length > lastAssistantMessageRef.current.length) {
          // 添加新的流式文本
          const newText = currentText.slice(lastAssistantMessageRef.current.length);
          realtimeTtsService.addStreamText(newText);
          lastAssistantMessageRef.current = currentText;
        }
      } else if (status !== 'streaming' && lastMessage.role === 'assistant' && isTtsEnabled && isStreamingStartedRef.current) {
        // 流式结束，完成处理
        realtimeTtsService.finishStream();
        isStreamingStartedRef.current = false;
        lastAssistantMessageRef.current = '';
      }
    }
  }, [messages, status, isTtsEnabled]);

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

  const handleTtsToggle = () => {
    if (isTtsEnabled) {
      // 如果当前启用，则禁用并停止播放
      realtimeTtsService.disable();
      setIsTtsEnabled(false);
    } else {
      // 如果当前禁用，则启用
      realtimeTtsService.enable();
      setIsTtsEnabled(true);
    }
  };

  const handleAudioPlay = () => {
    realtimeTtsService.resume();
  };

  const handleAudioPause = () => {
    realtimeTtsService.pause();
  };

  const handleAudioStop = () => {
    realtimeTtsService.stop();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 relative size-full h-full">
      {/* TTS 开关按钮 - 右上角 */}
      <button
        onClick={handleTtsToggle}
        className={`absolute top-4 right-4 z-10 p-2 rounded-full transition-colors ${isTtsEnabled
          ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
          : 'bg-muted hover:bg-muted/80 text-muted-foreground'
          }`}
        title={isTtsEnabled ? '关闭语音播放' : '开启语音播放'}
      >
        {isTtsEnabled ? (
          <Volume2Icon size={20} />
        ) : (
          <VolumeXIcon size={20} />
        )}
      </button>

      <div className="flex flex-col gap-2 h-full">
        {/* 对话区域 */}
        <Conversation className="h-1 flex-1">
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
                    {message.parts.filter((part) => part.type === 'source-url').map((part, i) => {
                      // TypeScript类型断言：已通过filter确保part是SourceUrlUIPart类型
                      const sourcePart = part as { type: 'source-url'; url: string; title?: string };
                      return (
                        <SourcesContent key={`${message.id}-${i}`}>
                          <Source
                            key={`${message.id}-${i}`}
                            href={sourcePart.url}
                            title={sourcePart.title || sourcePart.url}
                          />
                        </SourcesContent>
                      );
                    })}
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


        {/* AI技能按钮区域 */}
        <div className="flex-shrink-0">
          <SkillButtons
            character={props.character}
            onSkillSelect={(prompt) => setInput(prompt)}
          />
        </div>

        {/* 输入框区域 - 固定在底部 */}
        <div className="flex-shrink-0">
          <PromptInput onSubmit={handleSubmit} globalDrop multiple>
            <PromptInputBody>
              {/* <PromptInputAttachments>
                {(attachment) => <PromptInputAttachment data={attachment} />}
              </PromptInputAttachments> */}
              <PromptInputTextarea
                onChange={(e) => setInput(e.target.value)}
                value={input}
              />
            </PromptInputBody>
            <PromptInputToolbar>
              <PromptInputTools>
                <VoiceInput
                  onTextRecognized={handleVoiceText}
                  className="mb-2"
                />

                {/* TTS 控制按钮组 */}
                <div className="flex items-center gap-1 mb-2">
                  <PromptInputButton
                    onClick={handleTtsToggle}
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    title={isTtsEnabled ? "关闭语音播放" : "开启语音播放"}
                  >
                    {isTtsEnabled ? <Volume2Icon className="size-4" /> : <VolumeXIcon className="size-4" />}
                  </PromptInputButton>

                  {isTtsEnabled && (
                    <>
                      {ttsStatus.isPlaying ? (
                        <PromptInputButton
                          onClick={handleAudioPause}
                          variant="ghost"
                          size="sm"
                          className="p-2"
                          title="暂停播放"
                        >
                          <PauseIcon className="size-4" />
                        </PromptInputButton>
                      ) : (
                        <PromptInputButton
                          onClick={handleAudioPlay}
                          variant="ghost"
                          size="sm"
                          className="p-2"
                          title="继续播放"
                          disabled={!ttsStatus.isStreaming}
                        >
                          <PlayIcon className="size-4" />
                        </PromptInputButton>
                      )}

                      <PromptInputButton
                        onClick={handleAudioStop}
                        variant="ghost"
                        size="sm"
                        className="p-2"
                        title="停止播放"
                        disabled={!ttsStatus.isStreaming && !ttsStatus.isPlaying}
                      >
                        <StopCircleIcon className="size-4" />
                      </PromptInputButton>
                    </>
                  )}
                </div>
              </PromptInputTools>

              <PromptInputSubmit disabled={!input && !status} status={status} />
            </PromptInputToolbar>
          </PromptInput>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;