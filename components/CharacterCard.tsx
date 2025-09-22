"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, User } from 'lucide-react';
import type { Character } from '@/lib/types';

interface CharacterCardProps {
  character: Character;
  onClick: () => void;
}

export default function CharacterCard({ character, onClick }: CharacterCardProps) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 bg-white/10 backdrop-blur-md border-white/20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <CardHeader className="relative z-10 pb-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="relative">
                <Avatar className="w-16 h-16 border-2 border-purple-300 group-hover:border-purple-400 transition-colors">
                  <AvatarImage 
                    src={character.avatar} 
                    alt={character.name}
                    className="group-hover:scale-110 transition-transform duration-300"
                  />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                    <User className="w-8 h-8" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
              </div>
              <div>
                <CardTitle className="text-white group-hover:text-purple-200 transition-colors">
                  {character.name}
                </CardTitle>
                <Badge variant="secondary" className="mt-1 bg-purple-100/20 text-purple-200 text-xs">
                  {character.category}
                </Badge>
              </div>
            </div>
            <CardDescription className="text-gray-300 text-sm leading-relaxed">
              {character.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="relative z-10 pt-0">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1">
                {character.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs bg-white/5 border-white/20 text-white/80 hover:bg-white/10 transition-colors"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              <Button
                onClick={onClick}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 group-hover:shadow-lg transition-all duration-300"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                开始对话
              </Button>
            </div>
          </CardContent>
        </Card>
      </HoverCardTrigger>
      
      <HoverCardContent className="w-80 bg-white/10 backdrop-blur-md border-white/20 text-white">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={character.avatar} alt={character.name} />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                <User className="w-6 h-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold">{character.name}</h4>
              <p className="text-sm text-gray-300">{character.category}</p>
            </div>
          </div>
          
          <Separator className="bg-white/20" />
          
          <div className="space-y-2">
            <div>
              <h5 className="text-sm font-medium text-purple-200">性格特点</h5>
              <p className="text-xs text-gray-300">{character.personality}</p>
            </div>
            <div>
              <h5 className="text-sm font-medium text-purple-200">说话风格</h5>
              <p className="text-xs text-gray-300">{character.speakingStyle}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {character.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs bg-white/5 border-white/20 text-white/80"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}