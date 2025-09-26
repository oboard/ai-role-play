'use client';

import { useState, useMemo } from 'react';
import { Search, User, Crown, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Character } from '@/types/game';

interface CharacterSearchProps {
  onSelectCharacter: (character: Character) => void;
}

// 预定义的角色数据
const PREDEFINED_CHARACTERS: Character[] = [
  {
    id: 'socrates',
    name: '苏格拉底',
    description: '古希腊哲学家，被誉为西方哲学的奠基人之一',
    personality: '睿智、好奇、善于提问，喜欢通过对话启发他人思考',
    background: '公元前469-399年，雅典人，以"苏格拉底式问答法"闻名，主张"认识你自己"',
    category: 'historical'
  },
  {
    id: 'harry-potter',
    name: '哈利·波特',
    description: '霍格沃茨魔法学校的学生，被称为"大难不死的男孩"',
    personality: '勇敢、忠诚、有正义感，有时会冲动但内心善良',
    background: '魔法世界的传奇人物，在婴儿时期就击败了黑魔王伏地魔',
    category: 'fictional'
  },
  {
    id: 'leonardo-da-vinci',
    name: '列奥纳多·达·芬奇',
    description: '文艺复兴时期的博学者，画家、发明家、科学家',
    personality: '充满好奇心、创造力无限、追求完美，对一切事物都有浓厚兴趣',
    background: '1452-1519年，意大利人，创作了《蒙娜丽莎》和《最后的晚餐》等传世名作',
    category: 'historical'
  },
  {
    id: 'sherlock-holmes',
    name: '夏洛克·福尔摩斯',
    description: '世界著名的咨询侦探，居住在贝克街221B',
    personality: '观察力敏锐、逻辑思维缜密、有些傲慢但正义感强烈',
    background: '阿瑟·柯南·道尔笔下的虚构侦探，以演绎推理法解决各种疑难案件',
    category: 'fictional'
  },
  {
    id: 'confucius',
    name: '孔子',
    description: '中国古代思想家、教育家，儒家学派创始人',
    personality: '温和、睿智、重视教育和道德修养，主张仁爱和礼制',
    background: '公元前551-479年，春秋时期鲁国人，其思想影响中华文明数千年',
    category: 'historical'
  },
  {
    id: 'hermione-granger',
    name: '赫敏·格兰杰',
    description: '霍格沃茨魔法学校格兰芬多学院的优秀学生',
    personality: '聪明、勤奋、有原则，热爱学习但也勇敢无畏',
    background: '麻瓜出身的女巫，哈利·波特的好友，以学识渊博著称',
    category: 'fictional'
  }
];

export default function CharacterSearch({ onSelectCharacter }: CharacterSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'historical' | 'fictional'>('all');

  const filteredCharacters = useMemo(() => {
    return PREDEFINED_CHARACTERS.filter(character => {
      const matchesSearch = character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           character.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || character.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const getCategoryIcon = (category: Character['category']) => {
    switch (category) {
      case 'historical':
        return <Crown className="w-4 h-4" />;
      case 'fictional':
        return <BookOpen className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: Character['category']) => {
    switch (category) {
      case 'historical':
        return 'bg-amber-100 text-amber-800';
      case 'fictional':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">AI 角色扮演</h1>
        <p className="text-xl text-slate-300">选择一个角色开始对话</p>
      </div>

      {/* 搜索和筛选 */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input
            placeholder="搜索角色名称或描述..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-600 text-white placeholder-slate-400"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setSelectedCategory('historical')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              selectedCategory === 'historical'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Crown className="w-4 h-4" />
            历史人物
          </button>
          <button
            onClick={() => setSelectedCategory('fictional')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              selectedCategory === 'fictional'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            虚构角色
          </button>
        </div>
      </div>

      {/* 角色列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCharacters.map((character) => (
          <Card
            key={character.id}
            className="bg-slate-800 border-slate-600 hover:border-slate-500 transition-colors cursor-pointer"
            onClick={() => onSelectCharacter(character)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">{character.name}</CardTitle>
                <Badge className={getCategoryColor(character.category)}>
                  <div className="flex items-center gap-1">
                    {getCategoryIcon(character.category)}
                    <span className="text-xs">
                      {character.category === 'historical' ? '历史' : '虚构'}
                    </span>
                  </div>
                </Badge>
              </div>
              <CardDescription className="text-slate-300">
                {character.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-slate-400 line-clamp-2">
                {character.background}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCharacters.length === 0 && (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">没有找到匹配的角色</p>
          <p className="text-slate-500">尝试调整搜索条件</p>
        </div>
      )}
    </div>
  );
}