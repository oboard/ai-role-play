'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, Loader2, Gauge, Mic, Square } from 'lucide-react';

interface VoiceItem {
  voice_name: string;
  voice_type: string;
  url: string;
  category: string;
  updatetime: number;
}

interface RealtimeTtsPlayerProps {
  className?: string;
}

export default function RealtimeTtsPlayer({ className = "" }: RealtimeTtsPlayerProps) {
  const [text, setText] = useState('你好，世界！这是一个实时文字转语音的示例。');
  const [voiceType, setVoiceType] = useState('');
  const [speedRatio, setSpeedRatio] = useState([1.0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceList, setVoiceList] = useState<VoiceItem[]>([]);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const chunksRef = useRef<Uint8Array[]>([]);

  // 获取音色列表
  const fetchVoiceList = async () => {
    setVoiceLoading(true);
    try {
      const response = await fetch('/api/voice/list');
      const result = await response.json();
      
      if (result.success) {
        setVoiceList(result.data);
        if (result.data.length > 0) {
          setVoiceType(result.data[0].voice_type);
        }
      } else {
        setError(result.error || 'Failed to fetch voice list');
      }
    } catch (err) {
      setError('Failed to fetch voice list');
      console.error('Error fetching voice list:', err);
    } finally {
      setVoiceLoading(false);
    }
  };

  useEffect(() => {
    fetchVoiceList();
  }, []);

  const handleRealtimeTts = async () => {
    if (!text.trim()) {
      setError('请输入要转换的文字');
      return;
    }

    if (!voiceType) {
      setError('请选择音色');
      return;
    }

    setIsStreaming(true);
    setError(null);
    setProgress(0);
    chunksRef.current = [];

    try {
      // 初始化音频上下文
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // 使用代理 API 进行流式 TTS
      const response = await fetch('/api/voice/tts-ws-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          voice_type: voiceType,
          speed_ratio: speedRatio[0]
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      let totalLength = 0;
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        chunksRef.current.push(value);
        totalLength += value.length;
        
        // 更新进度（简单估算）
        setProgress(Math.min(95, (totalLength / 10000) * 100));
      }

      // 合并所有音频数据
      const audioData = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        audioData.set(chunk, offset);
        offset += chunk.length;
      }

      // 解码音频数据
      const audioBuffer = await audioContextRef.current.decodeAudioData(audioData.buffer);
      audioBufferRef.current = audioBuffer;
      
      setProgress(100);
      setIsStreaming(false);
      setIsPlaying(true);
      
      // 自动播放
      playAudio();

    } catch (err) {
      setError(`实时转换失败: ${err instanceof Error ? err.message : '未知错误'}`);
      console.error('Realtime TTS error:', err);
      setIsStreaming(false);
    }
  };

  const playAudio = () => {
    if (!audioContextRef.current || !audioBufferRef.current) return;

    // 停止当前播放
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
    }

    // 创建新的音频源
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBufferRef.current;
    source.connect(audioContextRef.current.destination);
    
    source.onended = () => {
      setIsPlaying(false);
    };

    source.start();
    sourceNodeRef.current = source;
    setIsPlaying(true);
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  const stopStreaming = () => {
    setIsStreaming(false);
    setProgress(0);
  };

  // 按分类分组音色
  const groupedVoices = voiceList.reduce((acc, voice) => {
    if (!acc[voice.category]) {
      acc[voice.category] = [];
    }
    acc[voice.category].push(voice);
    return acc;
  }, {} as Record<string, VoiceItem[]>);

  return (
    <div className={`space-y-4 p-4 bg-white rounded-lg border ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900">实时文字转语音</h3>
      
      {/* 文字输入 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">输入文字</label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="请输入要转换的文字..."
          className="min-h-[100px]"
        />
      </div>

      {/* 音色选择 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">选择音色</label>
        <Select value={voiceType} onValueChange={setVoiceType} disabled={voiceLoading || isStreaming}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={voiceLoading ? "加载中..." : "选择音色"} />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(groupedVoices).map(([category, voices]) => (
              <div key={category}>
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50">
                  {category}
                </div>
                {voices.map((voice) => (
                  <SelectItem key={voice.voice_type} value={voice.voice_type}>
                    <div className="flex flex-col">
                      <span className="font-medium">{voice.voice_name}</span>
                      <span className="text-xs text-gray-500">{voice.voice_type}</span>
                    </div>
                  </SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 语速调整 */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Gauge className="h-4 w-4 text-gray-600" />
          <label className="text-sm font-medium text-gray-700">语速调整</label>
        </div>
        <div className="px-2">
          <Slider
            value={speedRatio}
            onValueChange={setSpeedRatio}
            min={0.5}
            max={2.0}
            step={0.1}
            className="w-full"
            disabled={isStreaming}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.5x</span>
            <span className="font-medium text-blue-600">{speedRatio[0].toFixed(1)}x</span>
            <span>2.0x</span>
          </div>
        </div>
      </div>

      {/* 进度条 */}
      {isStreaming && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm text-gray-600">实时转换中...</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* 控制按钮 */}
      <div className="flex items-center space-x-2">
        {!isStreaming ? (
          <Button
            onClick={handleRealtimeTts}
            disabled={!text.trim() || !voiceType || voiceLoading}
            className="flex items-center space-x-2"
          >
            <Mic className="h-4 w-4" />
            <span>开始实时转换</span>
          </Button>
        ) : (
          <Button
            onClick={stopStreaming}
            variant="destructive"
            className="flex items-center space-x-2"
          >
            <Square className="h-4 w-4" />
            <span>停止转换</span>
          </Button>
        )}

        {audioBufferRef.current && !isStreaming && (
          <Button
            onClick={isPlaying ? stopAudio : playAudio}
            variant="outline"
            className="flex items-center space-x-2"
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4" />
                <span>暂停</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>播放</span>
              </>
            )}
          </Button>
        )}
      </div>

      {/* 状态信息 */}
      {audioBufferRef.current && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            <p>音色: {voiceList.find(v => v.voice_type === voiceType)?.voice_name}</p>
            <p>语速: {speedRatio[0].toFixed(1)}x</p>
            <p>状态: {isPlaying ? '播放中' : '已就绪'}</p>
          </div>
        </div>
      )}

      {/* 错误信息 */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
} 