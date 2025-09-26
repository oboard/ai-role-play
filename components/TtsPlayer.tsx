'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, Loader2, Gauge } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

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
  const { t } = useTranslation();
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
      setError(t('pleaseEnterText'));
      return;
    }

    if (!voiceType) {
      setError(t('pleaseSelectVoice'));
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
        setError(result.error || t('ttsConversionFailed'));
      }
    } catch (err) {
      setError(t('networkError'));
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
        setError(t('audioPlaybackFailed'));
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
      <h3 className="text-lg font-semibold text-gray-900">{t('ttsTitle')}</h3>

      {/* 文字输入 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">{t('inputText')}</label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('inputTextPlaceholder')}
          className="min-h-[100px]"
        />
      </div>

      {/* 音色选择 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">{t('selectVoice')}</label>
        <Select value={voiceType} onValueChange={setVoiceType} disabled={voiceLoading}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={voiceLoading ? t('loadingVoices') : t('selectVoicePlaceholder')} />
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
          <label className="text-sm font-medium text-gray-700">{t('speedAdjustment')}</label>
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
              <span>{t('converting')}</span>
            </>
          ) : (
            <>
              <Volume2 className="h-4 w-4" />
              <span>{t('startConversion')}</span>
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
                  <span>{t('pause')}</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span>{t('play')}</span>
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
            <p>{t('audioDuration')}: {Math.round(parseInt(duration) / 1000)} {t('seconds')}</p>
            <p>{t('voice')}: {voiceList.find(v => v.voice_type === voiceType)?.voice_name}</p>
            <p>{t('speed')}: {speedRatio[0].toFixed(1)}x</p>
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
