'use client';

import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { ttsService } from '@/lib/ttsService';

interface VoiceItem {
  voice_name: string;
  voice_type: string;
  url: string;
  category: string;
  updatetime: number;
}

interface VoiceListResponse {
  success: boolean;
  data: VoiceItem[];
  error?: string;
}

interface VoiceSelectorProps {
  onVoiceSelect?: (voice: VoiceItem) => void;
  selectedVoice?: VoiceItem | null;
  className?: string;
}

export default function TtsList({ 
  onVoiceSelect, 
  selectedVoice, 
  className = "" 
}: VoiceSelectorProps) {
  const [voiceList, setVoiceList] = useState<VoiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [internalSelectedVoice, setInternalSelectedVoice] = useState<VoiceItem | null>(selectedVoice || null);
  const [hoveredVoice, setHoveredVoice] = useState<VoiceItem | null>(null);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  const fetchVoiceList = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/voice/list');
      const result: VoiceListResponse = await response.json();
      
      if (result.success) {
        setVoiceList(result.data);
        // 设置默认音色
        if (result.data.length > 0 && !internalSelectedVoice) {
          const defaultVoice = result.data[0];
          setInternalSelectedVoice(defaultVoice);
          ttsService.setVoice(defaultVoice.voice_type);
        }
      } else {
        setError(result.error || 'Failed to fetch voice list');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoiceList();
  }, []);

  // 同步外部传入的选中状态
  useEffect(() => {
    if (selectedVoice) {
      setInternalSelectedVoice(selectedVoice);
      ttsService.setVoice(selectedVoice.voice_type);
    }
  }, [selectedVoice]);

  // 处理悬浮播放
  useEffect(() => {
    if (hoveredVoice && hoveredVoice.url) {
      // 停止当前播放的音频
      if (audioRef) {
        audioRef.pause();
        audioRef.currentTime = 0;
      }
      
      // 创建新的音频元素并播放
      const audio = new Audio(hoveredVoice.url);
      audio.volume = 0.5; // 设置音量
      audio.play().catch((error) => {
        // 忽略 AbortError，这是正常的打断行为
        if (error.name !== 'AbortError') {
          console.error('Audio play error:', error);
        }
      });
      setAudioRef(audio);
    } else if (audioRef) {
      // 鼠标离开时停止播放
      audioRef.pause();
      audioRef.currentTime = 0;
    }
  }, [hoveredVoice]);

  // 组件卸载时清理音频
  useEffect(() => {
    return () => {
      if (audioRef) {
        audioRef.pause();
        audioRef.currentTime = 0;
      }
    };
  }, [audioRef]);

  const handleVoiceChange = (voiceType: string) => {
    const selectedVoice = voiceList.find(voice => voice.voice_type === voiceType);
    if (selectedVoice) {
      setInternalSelectedVoice(selectedVoice);
      // 更新 TTS 服务的音色
      ttsService.setVoice(selectedVoice.voice_type);
      if (onVoiceSelect) {
        onVoiceSelect(selectedVoice);
      }
    }
  };

  const handleMouseEnter = (voice: VoiceItem) => {
    setHoveredVoice(voice);
  };

  const handleMouseLeave = () => {
    setHoveredVoice(null);
  };

  // 按分类分组音色
  const groupedVoices = voiceList.reduce((acc, voice) => {
    if (!acc[voice.category]) {
      acc[voice.category] = [];
    }
    acc[voice.category].push(voice);
    return acc;
  }, {} as Record<string, VoiceItem[]>);

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span>加载音色列表中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="text-red-600 text-sm">加载失败: {error}</div>
        <Button 
          onClick={fetchVoiceList}
          variant="outline"
          size="sm"
        >
          重试
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Select 
        value={internalSelectedVoice?.voice_type || ""} 
        onValueChange={handleVoiceChange}
      >
        <SelectTrigger className="w-full h-16">
          <SelectValue placeholder="请选择音色" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(groupedVoices).map(([category, voices]) => (
            <div key={category}>
              <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50">
                {category}
              </div>
              {voices.map((voice) => (
                <SelectItem 
                  key={voice.voice_type} 
                  value={voice.voice_type}
                  onMouseEnter={() => handleMouseEnter(voice)}
                  onMouseLeave={handleMouseLeave}
                  className="cursor-pointer hover:bg-blue-50 transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{voice.voice_name}</span>
                    <span className="text-xs text-gray-500">{voice.voice_type}</span>
                    {hoveredVoice?.voice_type === voice.voice_type && (
                      <span className="text-xs text-blue-500 mt-1">试 听中...</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </div>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
