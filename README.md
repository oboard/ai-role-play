# AI角色扮演聊天应用

一个基于Next.js的智能角色扮演聊天应用，支持语音交互、实时TTS和多种AI技能。

## 🎯 项目特色

### 核心功能
- **智能角色扮演**: 与苏格拉底、哈利波特、达芬奇等经典角色对话
- **语音交互**: 支持语音输入(ASR)和语音输出(TTS)
- **AI技能系统**: 知识问答、创意写作、逻辑推理三大技能
- **自定义角色**: 用户可创建个性化AI角色
- **多语言支持**: 中英文界面切换

### 技术亮点
- **实时语音合成**: 流式TTS，边生成边播放
- **智能语音识别**: 集成第三方ASR服务
- **响应式设计**: 适配桌面和移动端
- **本地存储**: 聊天记录和自定义角色本地保存

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装运行
```bash
# 克隆项目
git clone <repository-url>
cd ai-role-play

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问应用
open http://localhost:3000
```

### 环境配置
创建 `.env.local` 文件：
```env
# OpenAI API配置
OPENAI_API_KEY=your_openai_api_key

# 其他AI服务配置（可选）
ANTHROPIC_API_KEY=your_anthropic_key
```

## 📱 用户故事

### 故事1: 学生的哲学启蒙
> "我是一名大学生，对哲学很感兴趣但不知道从哪里开始。我选择了苏格拉底角色，点击'知识问答'技能，问他'什么是真正的智慧？'。苏格拉底用他经典的反问法引导我思考，让我明白了'知道自己无知'的深刻含义。"

### 故事2: 作家的创意伙伴  
> "作为一名小说作家，我经常遇到创作瓶颈。我创建了一个'创意导师'角色，专门帮助我构思情节。通过'创意写作'技能，我输入故事背景，AI帮我生成了多个有趣的情节转折，大大提升了我的创作效率。"

### 故事3: 孩子的魔法世界
> "我7岁的女儿是哈利波特迷。她用语音功能和哈利对话，问关于霍格沃茨的问题。TTS功能让哈利'亲口'回答她，她兴奋得不得了，仿佛真的在和哈利聊天。"

## 🏗️ 技术架构

### 前端架构
```
├── app/                    # Next.js 15 App Router
│   ├── api/               # API路由
│   ├── chat/              # 聊天页面
│   └── add-character/     # 添加角色页面
├── components/            # React组件
│   ├── ai-elements/       # AI交互组件
│   ├── ui/               # 基础UI组件
│   ├── ChatInterface.tsx  # 聊天界面
│   ├── SkillButtons.tsx   # AI技能按钮
│   └── VoiceInput.tsx     # 语音输入
├── lib/                   # 工具库
│   ├── asrService.ts      # 语音识别服务
│   ├── realtimeTtsService.ts # 实时TTS服务
│   └── chatStorage.ts     # 聊天存储
└── types/                 # TypeScript类型定义
```

### 核心技术栈
- **框架**: Next.js 15 + React 18
- **样式**: Tailwind CSS + shadcn/ui
- **AI集成**: Vercel AI SDK
- **语音**: Web Audio API + 第三方ASR
- **状态管理**: React Hooks
- **存储**: localStorage
- **类型**: TypeScript

### 数据流设计
```
用户输入 → ChatInterface → AI API → 响应处理 → TTS → 音频播放
    ↓           ↓              ↓         ↓        ↓
语音识别 → 文本转换 → 消息发送 → 流式响应 → 实时合成
```

## 🔧 Linus式技术思考

### 【代码品味评估】
**评分**: 🟡 凑合 - 功能完整但复杂度需要控制

### 【核心问题】
1. **数据结构混乱**: 音频服务类承担了太多职责
2. **特殊情况泛滥**: 嵌套if判断过多，缺乏统一的状态机
3. **复杂度爆炸**: ChatInterface组件过于庞大

### 【改进建议】
```typescript
// 当前设计问题
class RealtimeTtsService {
  // 混合了API调用、状态管理、音频处理
}

// 建议的简化设计
interface AudioPlayer {
  play(audio: ArrayBuffer): void;
  pause(): void;
  stop(): void;
}

interface TtsApi {
  synthesize(text: string): Promise<ArrayBuffer>;
}
```

### 【设计哲学】
- **"好品味"优先**: 消除特殊情况，让代码自然流畅
- **实用主义**: 解决真实问题，不追求理论完美
- **简洁执念**: 每个函数只做一件事，做好一件事
- **向后兼容**: 任何重构都不能破坏用户体验

## 🎨 AI技能系统

### 技能类型
1. **知识问答**: 基于角色背景的专业问答
2. **创意写作**: 协助用户进行创意创作
3. **逻辑推理**: 帮助用户分析和解决问题

### 实现原理
```typescript
// 技能提示词生成
const generateSkillPrompt = (skill: string, character: Character) => {
  const basePrompt = skillPrompts[skill];
  const characterContext = `作为${character.name}，${character.description}`;
  return `${characterContext}\n\n${basePrompt}`;
};
```

### 扩展性设计
- 技能配置化，易于添加新技能
- 角色特定的技能定制
- 支持用户自定义技能提示词

## 🔊 语音交互系统

### ASR (语音识别)
- **服务**: 第三方云端ASR API
- **格式**: 支持多种音频格式
- **实时性**: 流式识别，边说边转文字

### TTS (语音合成)
- **技术**: 实时流式合成
- **优化**: 边生成边播放，减少延迟
- **控制**: 支持播放、暂停、停止

### 音频处理流程
```
麦克风 → 录音 → 格式转换 → Base64编码 → API调用 → 文本返回
文本 → TTS API → 音频流 → 解码 → Web Audio → 扬声器播放
```

## 📊 性能优化

### 前端优化
- **代码分割**: 按路由和组件分割
- **懒加载**: 非关键组件延迟加载
- **缓存策略**: 角色数据和聊天记录本地缓存

### 音频优化
- **流式处理**: TTS边生成边播放
- **缓冲管理**: 智能音频缓冲区管理
- **格式优化**: 选择最适合的音频格式

## 🔮 未来规划

### 短期目标 (v1.1)
- [ ] 重构音频服务，拆分职责
- [ ] 优化ChatInterface组件结构
- [ ] 添加更多预设角色

### 中期目标 (v1.5)
- [ ] 支持图像生成和识别
- [ ] 多轮对话上下文优化
- [ ] 角色情感状态系统

### 长期愿景 (v2.0)
- [ ] 3D虚拟角色渲染
- [ ] 实时语音克隆
- [ ] 多人角色扮演房间

## 🤝 贡献指南

### 开发原则
1. **简洁优先**: 代码要简洁明了，避免过度设计
2. **用户体验**: 任何改动都要考虑用户体验
3. **向后兼容**: 不破坏现有功能
4. **测试覆盖**: 新功能要有对应测试

### 提交规范
```bash
# 功能开发
git commit -m "feat: 添加新的AI技能"

# 问题修复  
git commit -m "fix: 修复TTS播放异常"

# 性能优化
git commit -m "perf: 优化音频处理性能"
```

## 分工
杨仕馀：
1. 语音交互功能的实现（ars和tts的接入）
2. 自定义角色功能实现
3. 国际化

罗宇航：
1. 音频优化（流式处理 缓冲管理 格式优化）
2. 丰富角色的技能
3. 智能角色扮演
4. 主体切换功能


## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- OpenAI 提供强大的AI能力
- Vercel 提供优秀的开发框架
- shadcn/ui 提供精美的UI组件
- 所有为开源社区贡献的开发者们

---

**"Talk is cheap. Show me the code."** - Linus Torvalds

这个项目不是为了展示理论，而是为了解决真实的问题：让人们能够与AI角色进行自然、有趣的对话。代码可能不完美，但它能工作，能为用户创造价值。这就够了。
