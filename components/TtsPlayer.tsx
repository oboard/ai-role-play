'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, Loader2, Gauge } from 'lucide-react';

interface VoiceItem {
  voice_name: string;
  voice_type: string;
  url: string;
  category: string;
  updatetime: number;
}

interface TtsPlayerProps {
  className?: string;
}

export default function TtsPlayer({ className = "" }: TtsPlayerProps) {
  const [text, setText] = useState('你好，世界！这是一个文字转语音的示例。');
  const [voiceType, setVoiceType] = useState('');
  const [speedRatio, setSpeedRatio] = useState([1.0]); // 使用数组以兼容 Slider 组件
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<string>('0');
  const [error, setError] = useState<string | null>(null);
  const [voiceList, setVoiceList] = useState<VoiceItem[]>([]);
  const [voiceLoading, setVoiceLoading] = useState(false);

  // 获取音色列表
  const fetchVoiceList = async () => {
    setVoiceLoading(true);
    try {
      const response = await fetch('/api/voice/list');
      const result = await response.json();
      
      if (result.success) {
        setVoiceList(result.data);
        // 设置默认音色为第一个
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

  const handleTts = async () => {
    if (!text.trim()) {
      setError('请输入要转换的文字');
      return;
    }

    if (!voiceType) {
      setError('请选择音色');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAudioUrl(null);

    try {
      const response = await fetch('/api/voice/tts', {
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

      const result = await response.json();

      if (result.success) {
        setAudioUrl(result.data.audioUrl);
        setDuration(result.data.duration);
        setIsPlaying(true);
      } else {
        setError(result.error || '文字转语音失败');
      }
    } catch (err) {
      setError('网络错误，请重试');
      console.error('TTS error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlay = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        console.error('Audio play error:', error);
        setError('音频播放失败');
      });
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
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
      <h3 className="text-lg font-semibold text-gray-900">文字转语音示例</h3>
      
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
        <Select value={voiceType} onValueChange={setVoiceType} disabled={voiceLoading}>
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
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.5x</span>
            <span className="font-medium text-blue-600">{speedRatio[0].toFixed(1)}x</span>
            <span>2.0x</span>
          </div>
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="flex items-center space-x-2">
        <Button
          onClick={handleTts}
          disabled={isLoading || !text.trim() || !voiceType || voiceLoading}
          className="flex items-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>转换中...</span>
            </>
          ) : (
            <>
              <Volume2 className="h-4 w-4" />
              <span>开始转换</span>
            </>
          )}
        </Button>

        {audioUrl && (
          <>
            <Button
              onClick={isPlaying ? handlePause : handlePlay}
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
          </>
        )}
      </div>

      {/* 音频信息 */}
      {audioUrl && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            <p>音频时长: {Math.round(parseInt(duration) / 1000)} 秒</p>
            <p>音色: {voiceList.find(v => v.voice_type === voiceType)?.voice_name}</p>
            <p>语速: {speedRatio[0].toFixed(1)}x</p>
          </div>
          <audio
            src={audioUrl}
            controls
            className="w-full mt-2"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          />
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
