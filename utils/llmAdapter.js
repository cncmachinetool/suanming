const MODEL_OPTIONS = [
  {
    key: 'chatgpt',
    name: 'ChatGPT',
    provider: 'OpenAI',
    defaultModel: 'gpt-4o-mini'
  },
  {
    key: 'gemini',
    name: 'Gemini',
    provider: 'Google',
    defaultModel: 'gemini-1.5-flash'
  },
  {
    key: 'deepseek',
    name: 'DeepSeek',
    provider: 'DeepSeek',
    defaultModel: 'deepseek-chat'
  },
  {
    key: 'doubao',
    name: '豆包',
    provider: '字节跳动',
    defaultModel: 'doubao-pro-32k'
  }
];

function getModelOptions() {
  return MODEL_OPTIONS;
}

function buildPayload(modelKey, question) {
  const target = MODEL_OPTIONS.find((item) => item.key === modelKey);
  if (!target) {
    throw new Error('未知的模型：' + modelKey);
  }
  return {
    model: target.defaultModel,
    messages: [
      {
        role: 'system',
        content:
          '你是一名温暖而理性的命理助手，请基于用户提供的信息给出有启发性的建议，避免迷信话术。'
      },
      {
        role: 'user',
        content: question
      }
    ]
  };
}

function mockFortune(modelKey, question) {
  const prefix = MODEL_OPTIONS.find((item) => item.key === modelKey)?.name || 'AI';
  const hints = [
    '今日贵人运旺，保持平常心，善待身边人。',
    '近期宜专注学习与输入，少做高风险决策。',
    '情绪管理是关键，先理清需求再行动。',
    '调整作息与饮食，身体状态会带来好消息。'
  ];
  const luck = hints[Math.floor(Math.random() * hints.length)];
  return `${prefix} 给你的提示：\n${luck}\n\n问题：${question}`;
}

module.exports = {
  getModelOptions,
  buildPayload,
  mockFortune
};
