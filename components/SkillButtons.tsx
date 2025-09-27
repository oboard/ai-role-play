'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, PenTool, Brain, Sparkles } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { Character } from '@/types/game';

interface SkillButtonsProps {
  character: Character;
  onSkillSelect: (skillType: string, prompt: string) => void;
  disabled?: boolean;
}

export default function SkillButtons({ character, onSkillSelect, disabled = false }: SkillButtonsProps) {
  const { t } = useTranslation();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const getCharacterSkills = (character: Character) => {
    const characterId = character.id;
    
    // 为不同角色定制专属技能
    const characterSkills: Record<string, any[]> = {
      'socrates': [
        {
          id: 'philosophy',
          name: '哲学思辨',
          description: '苏格拉底式问答',
          icon: Brain,
          color: 'bg-blue-500',
          prompts: [
            '什么是真正的智慧？',
            '如何认识自己？',
            '什么是正义？',
            '美德可以被教授吗？'
          ]
        },
        {
          id: 'dialogue',
          name: '对话启发',
          description: '通过问答启发思考',
          icon: BookOpen,
          color: 'bg-green-500',
          prompts: [
            '请用问答法帮我思考这个问题',
            '引导我发现问题的本质',
            '帮我质疑我的假设',
            '让我重新审视这个观点'
          ]
        },
        {
          id: 'ethics',
          name: '道德伦理',
          description: '探讨道德问题',
          icon: PenTool,
          color: 'bg-purple-500',
          prompts: [
            '这样做是对的吗？',
            '如何过有意义的生活？',
            '什么是勇气？',
            '友谊的真谛是什么？'
          ]
        }
      ],
      'harry-potter': [
        {
          id: 'magic',
          name: '魔法知识',
          description: '霍格沃茨的魔法',
          icon: Sparkles,
          color: 'bg-red-500',
          prompts: [
            '教我一个魔法咒语',
            '介绍霍格沃茨的生活',
            '讲讲魔法世界的规则',
            '分享冒险经历'
          ]
        },
        {
          id: 'courage',
          name: '勇气指导',
          description: '面对困难的勇气',
          icon: Brain,
          color: 'bg-yellow-500',
          prompts: [
            '如何克服恐惧？',
            '什么是真正的勇气？',
            '如何保护朋友？',
            '面对黑暗势力怎么办？'
          ]
        },
        {
          id: 'friendship',
          name: '友谊力量',
          description: '友谊与团队合作',
          icon: BookOpen,
          color: 'bg-blue-500',
          prompts: [
            '友谊为什么重要？',
            '如何建立真正的友谊？',
            '团队合作的秘诀',
            '如何帮助朋友？'
          ]
        }
      ],
      'leonardo': [
        {
          id: 'invention',
          name: '发明创造',
          description: '设计与发明',
          icon: PenTool,
          color: 'bg-orange-500',
          prompts: [
            '设计一个新发明',
            '解释飞行的原理',
            '如何观察自然？',
            '创新的灵感从哪来？'
          ]
        },
        {
          id: 'art',
          name: '艺术创作',
          description: '绘画与艺术',
          icon: BookOpen,
          color: 'bg-purple-500',
          prompts: [
            '如何画出完美的作品？',
            '艺术的本质是什么？',
            '如何捕捉光影？',
            '创作的技巧分享'
          ]
        },
        {
          id: 'science',
          name: '科学探索',
          description: '自然科学研究',
          icon: Brain,
          color: 'bg-green-500',
          prompts: [
            '解释人体的奥秘',
            '自然界的规律',
            '如何进行科学观察？',
            '知识的获取方法'
          ]
        }
      ],
      'sherlock': [
        {
          id: 'deduction',
          name: '推理分析',
          description: '逻辑推理与观察',
          icon: Brain,
          color: 'bg-blue-500',
          prompts: [
            '帮我分析这个案件',
            '如何进行逻辑推理？',
            '观察细节的技巧',
            '推理方法教学'
          ]
        },
        {
          id: 'investigation',
          name: '调查技巧',
          description: '侦探调查方法',
          icon: BookOpen,
          color: 'bg-gray-500',
          prompts: [
            '如何收集证据？',
            '询问证人的技巧',
            '现场勘查要点',
            '破案思路分享'
          ]
        },
        {
          id: 'psychology',
          name: '心理分析',
          description: '人物心理剖析',
          icon: PenTool,
          color: 'bg-purple-500',
          prompts: [
            '分析这个人的性格',
            '犯罪心理学',
            '如何读懂他人？',
            '行为模式分析'
          ]
        }
      ]
    };

    // 如果没有专门的技能配置，返回通用技能
    return characterSkills[characterId] || [
      {
        id: 'knowledge',
        name: '知识问答',
        description: '询问专业问题',
        icon: BookOpen,
        color: 'bg-blue-500',
        prompts: [
          '询问你的专业领域',
          '解释复杂概念',
          '分享你的智慧',
          '讨论相关话题'
        ]
      },
      {
        id: 'creative',
        name: '创意写作',
        description: '创作故事和诗歌',
        icon: PenTool,
        color: 'bg-purple-500',
        prompts: [
          '写一首诗',
          '创作短篇故事',
          '创作对话',
          '描述场景'
        ]
      },
      {
        id: 'reasoning',
        name: '逻辑推理',
        description: '分析和推理',
        icon: Brain,
        color: 'bg-green-500',
        prompts: [
          '分析这个问题',
          '进行逻辑推理',
          '解决谜题',
          '评估论证'
        ]
      }
    ];
  };

  const skills = getCharacterSkills(character);

  const handleSkillClick = (skill: any) => {
    if (selectedSkill === skill.id) {
      setSelectedSkill(null);
    } else {
      setSelectedSkill(skill.id);
    }
  };

  const handlePromptClick = (skillType: string, prompt: string) => {
    const enhancedPrompt = generateSkillPrompt(skillType, prompt, character);
    onSkillSelect(skillType, enhancedPrompt);
    setSelectedSkill(null);
  };

  const generateSkillPrompt = (skillType: string, basePrompt: string, character: Character): string => {
    const skillInstructions = {
      knowledge: `作为${character.name}，请运用你的专业知识和经验来回答：${basePrompt}。请结合你的历史背景和专业领域，提供深入而有见地的回答。`,
      creative: `作为${character.name}，请发挥你的创造力：${basePrompt}。请保持你独特的风格和时代特色，创作出符合你身份的作品。`,
      reasoning: `作为${character.name}，请运用你的逻辑思维：${basePrompt}。请展示你的分析能力和推理过程，给出有条理的思考。`
    };

    return skillInstructions[skillType as keyof typeof skillInstructions] || basePrompt;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-semibold text-foreground">AI 技能</h3>
        <Badge variant="secondary" className="text-xs">
          {character.name} 特殊能力
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {skills.map((skill) => {
          const Icon = skill.icon;
          const isSelected = selectedSkill === skill.id;
          
          return (
            <div key={skill.id} className="space-y-2">
              <Card 
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isSelected ? 'ring-2 ring-primary' : ''
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !disabled && handleSkillClick(skill)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${skill.color} text-white`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium">{skill.name}</CardTitle>
                      <CardDescription className="text-xs">{skill.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {isSelected && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                  {skill.prompts.map((prompt: string, index: number) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full text-left justify-start h-auto py-2 px-3 text-xs"
                      onClick={() => handlePromptClick(skill.id, prompt)}
                      disabled={disabled}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedSkill && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            选择上面的提示开始
          </p>
        </div>
      )}
    </div>
  );
}