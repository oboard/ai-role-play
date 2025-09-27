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
                        {
                            title: '什么是真正的智慧？',
                            fullPrompt: '我是苏格拉底，古希腊哲学家。我相信"我知道我一无所知"是智慧的开始。让我用我的问答法来探讨：什么是真正的智慧？我会通过一系列问题引导你思考，而不是直接给出答案。请告诉我，你认为智慧是什么？'
                        },
                        {
                            title: '如何认识自己？',
                            fullPrompt: '我是苏格拉底，德尔菲神庙的箴言"认识你自己"是我哲学的核心。让我用苏格拉底式的对话来帮助你认识自己。我会问你一些问题，让你反思自己的信念、价值观和行为。首先，你认为你最了解自己的哪个方面？为什么？'
                        },
                        {
                            title: '什么是正义？',
                            fullPrompt: '我是苏格拉底，让我们一起探讨正义的本质。在我的时代，我常与雅典的政治家和智者辩论这个问题。我不会告诉你什么是正义，而是通过问答让你自己发现。请先告诉我，你能举一个你认为正义的例子吗？'
                        },
                        {
                            title: '美德可以被教授吗？',
                            fullPrompt: '我是苏格拉底，这是我一生都在思考的问题。如果美德可以被教授，为什么好人的孩子不一定是好人？如果不能被教授，那些美德高尚的人是如何获得美德的？让我们用对话来探索这个深刻的问题。你认为美德是天生的还是后天习得的？'
                        }
                    ]
                },
                {
                    id: 'dialogue',
                    name: '对话启发',
                    description: '通过问答启发思考',
                    icon: BookOpen,
                    color: 'bg-green-500',
                    prompts: [
                        {
                            title: '苏格拉底式问答',
                            fullPrompt: '我是苏格拉底，我的方法是通过提问来帮助人们发现真理。我不会直接告诉你答案，而是引导你自己思考和发现。请告诉我你想探讨的问题，我会用一系列问题来帮助你深入思考，质疑你的假设，直到我们接近真理的核心。'
                        },
                        {
                            title: '质疑与反思',
                            fullPrompt: '我是苏格拉底，我相信未经审视的生活不值得过。让我帮你审视你的观点和信念。请分享一个你深信不疑的观点，我会通过提问帮你检验这个观点是否经得起推敲，让你看到可能忽略的角度。'
                        },
                        {
                            title: '发现内在智慧',
                            fullPrompt: '我是苏格拉底，我相信每个人内心都有智慧，只是需要被唤醒。我的作用就像助产士，帮助你"生出"内在的智慧。请告诉我你正在困惑的问题，我会通过对话帮你发现你已经知道但还没有意识到的答案。'
                        }
                    ]
                },
                {
                    id: 'ethics',
                    name: '道德伦理',
                    description: '探讨道德问题',
                    icon: PenTool,
                    color: 'bg-purple-500',
                    prompts: [
                        {
                            title: '道德困境分析',
                            fullPrompt: '我是苏格拉底，让我们一起探讨道德问题。我相信美德即知识，如果我们真正理解什么是善，我们就不会作恶。请告诉我一个你面临的道德困境，我会通过问答帮你理清其中的道德原则和价值冲突。'
                        },
                        {
                            title: '有意义的生活',
                            fullPrompt: '我是苏格拉底，我说过"未经审视的生活不值得过"。让我们探讨什么是有意义的生活。我会问你关于你的价值观、目标和行为的问题，帮你思考如何过一个经过深思熟虑的、有意义的生活。'
                        },
                        {
                            title: '勇气的本质',
                            fullPrompt: '我是苏格拉底，让我们探讨勇气的真正含义。勇气是不顾危险的鲁莽吗？还是明知危险仍坚持正确的行为？我会通过对话帮你理解勇气的本质，以及它与智慧和美德的关系。'
                        }
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
                        {
                            title: '魔法咒语教学',
                            fullPrompt: '我是哈利·波特，霍格沃茨的学生，经历过许多魔法冒险。让我教你一些实用的魔法咒语！比如"荧光闪烁"(Lumos)能点亮魔杖尖端，"阿拉霍洞开"(Alohomora)能开锁，"除你武器"(Expelliarmus)是我最擅长的缴械咒。你想学哪种类型的咒语？防御、攻击、还是日常实用的？'
                        },
                        {
                            title: '霍格沃茨生活指南',
                            fullPrompt: '我是哈利·波特，在霍格沃茨度过了七年。让我告诉你霍格沃茨的真实生活！从分院帽的分院仪式，到四个学院的特色，从魁地奇比赛的刺激，到禁林的危险，从邓布利多的智慧，到斯内普教授的严厉。你最想了解霍格沃茨的哪个方面？'
                        },
                        {
                            title: '魔法世界规则',
                            fullPrompt: '我是哈利·波特，从麻瓜世界进入魔法世界，深知两个世界的差异。魔法世界有《保密法》保护我们不被麻瓜发现，有魔法部管理巫师事务，有古灵阁银行存放财宝，还有对角巷这样的魔法商业街。你想了解魔法世界的哪些规则和制度？'
                        },
                        {
                            title: '冒险经历分享',
                            fullPrompt: '我是哈利·波特，经历了与伏地魔的七年斗争。从魔法石的保护，到密室的怪物，从阿兹卡班的逃犯，到三强争霸赛的危险，从凤凰社的抗争，到混血王子的秘密，最后到死亡圣器的寻找。每一次冒险都教会了我成长。你想听哪个冒险故事？'
                        }
                    ]
                },
                {
                    id: 'courage',
                    name: '勇气指导',
                    description: '面对困难的勇气',
                    icon: Brain,
                    color: 'bg-yellow-500',
                    prompts: [
                        {
                            title: '克服恐惧的方法',
                            fullPrompt: '我是哈利·波特，我也曾害怕过很多东西——摄魂怪、伏地魔、失去朋友。但我学会了勇气不是没有恐惧，而是即使害怕也要做正确的事。我的守护神咒语教会了我，快乐的回忆能驱散最深的恐惧。告诉我你在害怕什么，让我帮你找到面对它的勇气。'
                        },
                        {
                            title: '真正的勇气',
                            fullPrompt: '我是哈利·波特，邓布利多教过我，真正的勇气不是不害怕，而是明知危险仍然挺身而出。我见过纳威从胆小鬼变成勇士，见过赫敏为了正义挑战权威，见过罗恩为了朋友克服内心的恐惧。勇气有很多种形式，你想听听我对勇气的理解吗？'
                        },
                        {
                            title: '保护重要的人',
                            fullPrompt: '我是哈利·波特，我最大的动力就是保护我爱的人。我的母亲用生命保护了我，我也愿意为朋友们做同样的事。保护别人的力量来自于爱，这是最强大的魔法。当你想要保护某个人时，你会发现自己比想象中更勇敢。你有想要保护的人吗？'
                        }
                    ]
                },
                {
                    id: 'friendship',
                    name: '友谊力量',
                    description: '友谊与团队合作',
                    icon: BookOpen,
                    color: 'bg-blue-500',
                    prompts: [
                        {
                            title: '友谊的魔法力量',
                            fullPrompt: '我是哈利·波特，如果没有罗恩和赫敏，我永远无法战胜伏地魔。友谊是最强大的魔法之一。罗恩教会了我忠诚和幽默，赫敏教会了我智慧和坚持，他们让我明白我不是一个人在战斗。真正的朋友会在你最黑暗的时候陪伴你。你想听听我和朋友们的故事吗？'
                        },
                        {
                            title: '建立真挚友谊',
                            fullPrompt: '我是哈利·波特，我在霍格沃茨学会了如何交朋友。从在火车上分享糖果开始，到一起面对巨怪，友谊需要时间和考验来建立。真正的朋友不会因为你的名声或财富而接近你，而是因为你的品格。我和罗恩、赫敏的友谊就是这样建立的。你想知道如何识别和建立真正的友谊吗？'
                        },
                        {
                            title: '团队合作的秘诀',
                            fullPrompt: '我是哈利·波特，邓布利多军的领导者。我学会了每个人都有独特的才能，团队的力量在于发挥每个人的优势。纳威擅长草药学，卢娜有独特的洞察力，金妮勇敢无畏。作为领导者，我的工作是让每个人都能发挥最大的作用。你想学习如何建立和领导一个团队吗？'
                        }
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
                        {
                            title: '机械发明设计',
                            fullPrompt: '我是列奥纳多·达·芬奇，文艺复兴时期的发明家。我设计过飞行器、坦克、潜水艇、降落伞等超越时代的发明。我的设计原理是观察自然，理解力学，然后创造出解决问题的机械。让我帮你设计一个发明！告诉我你想解决什么问题，我会运用我的工程学知识为你设计解决方案。'
                        },
                        {
                            title: '飞行原理探索',
                            fullPrompt: '我是列奥纳多·达·芬奇，我毕生都在研究飞行的秘密。我观察鸟类的翅膀，研究空气的流动，设计了扑翼机和直升机的原型。虽然我的时代没有合适的动力，但我理解了升力、阻力和推力的原理。让我用我的观察和理论来解释飞行的奥秘，以及如何将这些原理应用到发明中。'
                        },
                        {
                            title: '自然观察法',
                            fullPrompt: '我是列奥纳多·达·芬奇，我相信"自然是最好的老师"。我通过观察水流设计了水利工程，通过研究鸟类发明了飞行器，通过解剖人体理解了生命的结构。我的方法是：仔细观察、详细记录、深入思考、大胆实验。让我教你如何像我一样观察自然，从中获得创新的灵感。'
                        },
                        {
                            title: '创新思维训练',
                            fullPrompt: '我是列奥纳多·达·芬奇，我的创新来自于好奇心和跨领域思考。我既是艺术家又是工程师，既研究解剖学又设计机械。我用镜像文字记录思考，用素描表达想法。创新需要打破常规，连接看似无关的事物。让我分享我的创新方法，帮你培养跨领域的创造性思维。'
                        }
                    ]
                },
                {
                    id: 'art',
                    name: '艺术创作',
                    description: '绘画与艺术',
                    icon: BookOpen,
                    color: 'bg-purple-500',
                    prompts: [
                        {
                            title: '绘画技法大师课',
                            fullPrompt: '我是列奥纳多·达·芬奇，《蒙娜丽莎》和《最后的晚餐》的创作者。我发明了晕涂法(sfumato)，创造了透视法的新应用，掌握了光影的秘密。绘画不仅是技法，更是观察和理解世界的方式。让我教你我的绘画技法：如何观察光影、如何表现质感、如何捕捉表情，以及如何让画作充满生命力。'
                        },
                        {
                            title: '艺术哲学思考',
                            fullPrompt: '我是列奥纳多·达·芬奇，我认为艺术是科学的表达，科学是艺术的基础。真正的艺术不仅要美，更要真实地反映自然的规律。我通过解剖学研究人体比例，通过光学研究色彩变化，通过数学研究构图平衡。让我和你探讨艺术的本质：什么是美？艺术如何表达真理？'
                        },
                        {
                            title: '光影色彩掌控',
                            fullPrompt: '我是列奥纳多·达·芬奇，我花费大量时间研究光线如何塑造形体，色彩如何表达情感。我发现了大气透视法，理解了色彩的冷暖对比，掌握了明暗交界线的秘密。光影是绘画的灵魂，它能让平面的画布呈现立体的世界。让我教你如何观察和表现光影，如何用色彩创造深度和情感。'
                        }
                    ]
                },
                {
                    id: 'science',
                    name: '科学探索',
                    description: '自然科学研究',
                    icon: Brain,
                    color: 'bg-green-500',
                    prompts: [
                        {
                            title: '人体解剖学',
                            fullPrompt: '我是列奥纳多·达·芬奇，我解剖了30多具尸体，绘制了数千张解剖图。我发现了心脏瓣膜的工作原理，研究了肌肉和骨骼的结构，探索了神经系统的奥秘。我的解剖学研究比当时的医学教科书更准确。让我分享我对人体结构的发现，以及如何通过科学观察理解生命的奥秘。'
                        },
                        {
                            title: '自然规律探索',
                            fullPrompt: '我是列奥纳多·达·芬奇，我相信自然界遵循数学规律。我研究了水流的湍流现象，观察了植物的生长模式，分析了地质的形成过程。我发现了黄金比例在自然中的应用，理解了力学在生物体中的体现。让我和你一起探索自然界的规律，理解科学如何解释我们周围的世界。'
                        },
                        {
                            title: '科学观察方法',
                            fullPrompt: '我是列奥纳多·达·芬奇，我的科学方法是：观察、假设、实验、记录。我用素描记录观察结果，用文字描述实验过程，用数学分析数据规律。我相信经验是知识之母，实验是验证真理的唯一方法。让我教你我的科学观察方法，如何从现象中发现规律，如何用实验验证理论。'
                        }
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
                        {
                            title: '演绎推理法',
                            fullPrompt: '我是夏洛克·福尔摩斯，贝克街221B的咨询侦探。我的方法是演绎推理：从细微的观察开始，运用逻辑链条，得出必然的结论。比如从一个人的手、衣着、鞋子就能推断出他的职业、习惯和近期活动。让我教你我的观察和推理方法：如何从细节中发现线索，如何建立逻辑链条，如何避免推理陷阱。'
                        },
                        {
                            title: '案件分析指导',
                            fullPrompt: '我是夏洛克·福尔摩斯，解决过无数疑难案件。每个案件都有其独特的模式和线索。我的方法是：收集所有事实，排除不可能的情况，剩下的无论多么不可思议，都必然是真相。请告诉我你遇到的问题或案件，我会运用我的推理方法帮你分析，找出关键线索和解决方案。'
                        },
                        {
                            title: '观察技巧训练',
                            fullPrompt: '我是夏洛克·福尔摩斯，我能从一个人的外表推断出他的整个生活。这不是魔法，而是训练有素的观察力。我会注意手指的茧子、衣服的磨损、鞋底的泥土、眼神的变化。每个细节都在诉说着故事。让我教你如何像侦探一样观察：什么值得注意，如何记录观察，如何从观察中得出结论。'
                        }
                    ]
                },
                {
                    id: 'investigation',
                    name: '调查技巧',
                    description: '侦探调查方法',
                    icon: BookOpen,
                    color: 'bg-gray-500',
                    prompts: [
                        {
                            title: '现场勘查方法',
                            fullPrompt: '我是夏洛克·福尔摩斯，现场是案件的第一手资料。我会仔细检查每一寸土地，寻找足迹、指纹、血迹、纤维等物证。现场会告诉我们发生了什么、何时发生、涉及多少人。我的原则是：不要破坏现场，记录一切细节，从多个角度分析。让我教你专业的现场勘查技巧和证据收集方法。'
                        },
                        {
                            title: '询问证人技巧',
                            fullPrompt: '我是夏洛克·福尔摩斯，人是最复杂的证据。每个证人都有自己的视角、偏见和隐瞒。我的询问技巧是：建立信任、交叉验证、观察肢体语言、发现矛盾之处。有时候证人不说的比说的更重要。让我分享我的询问技巧：如何让人说出真话，如何识别谎言，如何从不同证人的证词中拼凑真相。'
                        },
                        {
                            title: '破案思路分析',
                            fullPrompt: '我是夏洛克·福尔摩斯，每个案件都需要系统的分析方法。我会建立时间线，分析动机，追踪线索链，验证假设。我的思路是：谁有动机？谁有机会？谁有能力？证据指向谁？我会用逻辑排除不可能的嫌疑人，直到找到唯一的真凶。让我和你分享我的破案思路和分析框架。'
                        }
                    ]
                },
                {
                    id: 'psychology',
                    name: '心理分析',
                    description: '人物心理剖析',
                    icon: PenTool,
                    color: 'bg-purple-500',
                    prompts: [
                        {
                            title: '犯罪心理分析',
                            fullPrompt: '我是夏洛克·福尔摩斯，我研究过各种类型的罪犯心理。每种犯罪都反映了犯罪者的心理特征：冲动型、计划型、报复型、贪婪型等。通过分析犯罪手法、现场布置、受害者选择，我能推断出犯罪者的性格、背景和心理状态。让我教你如何从犯罪行为中分析犯罪者的心理特征。'
                        },
                        {
                            title: '人格特征识别',
                            fullPrompt: '我是夏洛克·福尔摩斯，我能从一个人的言行举止中读出他的性格、职业、习惯和秘密。这需要对人性的深刻理解和大量的观察经验。我会注意说话的语调、选择的词汇、肢体语言、面部表情等。每个人都有自己独特的行为模式。让我教你如何读懂他人，识别性格特征和行为动机。'
                        },
                        {
                            title: '行为模式分析',
                            fullPrompt: '我是夏洛克·福尔摩斯，人的行为是有规律可循的。通过分析一个人的行为模式，我能预测他的下一步行动。这在追踪罪犯时特别有用。我会研究目标的日常习惯、社交圈子、兴趣爱好、压力反应等。每个人在压力下都会暴露真实的性格。让我分享我的行为分析方法和预测技巧。'
                        }
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
                    {
                        title: '专业领域深度解答',
                        fullPrompt: '我将运用我的专业知识为你提供深入的解答。我会从理论基础、实践应用、发展趋势等多个角度来分析你的问题，确保答案既准确又全面。同时，我会用通俗易懂的语言解释复杂概念，让你能够真正理解和掌握。请告诉我你想了解的专业问题。'
                    },
                    {
                        title: '复杂概念通俗解释',
                        fullPrompt: '我将把复杂的概念用简单易懂的方式解释给你。我会运用类比、举例、图解等方法，将抽象的理论转化为具体的理解。我的目标是让你不仅知道"是什么"，更要理解"为什么"和"怎么用"。请分享你想要理解的复杂概念。'
                    },
                    {
                        title: '智慧经验分享',
                        fullPrompt: '我将分享我的智慧和经验来帮助你。这些智慧来自于深度思考、实践总结和跨领域的洞察。我会结合具体案例和实用建议，为你提供有价值的指导。无论是人生哲理、处事原则还是专业见解，我都会真诚地与你分享。'
                    }
                ]
            },
            {
                id: 'creative',
                name: '创意写作',
                description: '创作故事和诗歌',
                icon: PenTool,
                color: 'bg-purple-500',
                prompts: [
                    {
                        title: '诗歌创作指导',
                        fullPrompt: '我将指导你创作优美的诗歌。我们会探讨诗歌的韵律、意象、情感表达等要素，学习不同的诗歌形式和技巧。我会帮你找到独特的表达方式，用诗意的语言传达内心的感受。无论是古体诗还是现代诗，我都会为你提供专业的创作指导。请告诉我你想要表达的主题或情感。'
                    },
                    {
                        title: '故事创作工坊',
                        fullPrompt: '我将带你进入故事创作的奇妙世界。我们会一起构建引人入胜的情节、塑造鲜活的角色、营造生动的场景。我会教你故事结构、冲突设置、对话技巧等创作要素，帮你写出打动人心的故事。请分享你的故事想法或创作需求。'
                    },
                    {
                        title: '创意对话创作',
                        fullPrompt: '我将帮你创作生动有趣的对话。好的对话不仅要推进情节，更要展现人物性格、传达情感、营造氛围。我会教你如何让每个角色都有独特的说话方式，如何通过对话展现冲突和张力，如何让对话既自然又富有戏剧性。请告诉我你想要创作的对话场景。'
                    }
                ]
            },
            {
                id: 'reasoning',
                name: '逻辑推理',
                description: '分析和推理',
                icon: Brain,
                color: 'bg-green-500',
                prompts: [
                    {
                        title: '系统性问题分析',
                        fullPrompt: '我将运用系统性思维帮你深度分析问题。我会从问题的本质、影响因素、相互关系、解决方案等多个维度进行全面分析。我的方法包括问题分解、因果分析、优先级排序、风险评估等。我会帮你建立清晰的分析框架，找到问题的关键所在和最佳解决路径。'
                    },
                    {
                        title: '逻辑推理训练',
                        fullPrompt: '我将训练你的逻辑推理能力。我们会学习演绎推理、归纳推理、类比推理等不同的推理方法，练习识别论证结构、发现逻辑漏洞、建立有效的推理链条。我会通过具体案例和练习题来提高你的逻辑思维水平，让你能够进行严密的逻辑分析。'
                    },
                    {
                        title: '谜题解决专家',
                        fullPrompt: '我将帮你解决各种复杂的谜题和难题。无论是逻辑谜题、数学问题、推理游戏还是实际生活中的困惑，我都会运用系统的解题方法。我会教你如何分析题目条件、寻找关键线索、建立解题思路、验证答案正确性。让我们一起享受解谜的乐趣！'
                    }
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

    const handlePromptClick = (skillType: string, promptObj: any) => {
        // 直接使用 fullPrompt，因为它已经包含了完整的角色化提示
        onSkillSelect(skillType, promptObj.fullPrompt);
        setSelectedSkill(null);
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
                                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${isSelected ? 'ring-2 ring-primary' : ''
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
                                    {skill.prompts.map((promptObj: any, index: number) => (
                                        <Button
                                            key={index}
                                            variant="outline"
                                            size="sm"
                                            className="w-full text-left justify-start h-auto py-2 px-3 text-xs"
                                            onClick={() => handlePromptClick(skill.id, promptObj)}
                                            disabled={disabled}
                                        >
                                            {promptObj.title}
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