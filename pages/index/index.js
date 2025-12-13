const app = getApp();
const { getModelOptions, buildPayload, mockFortune } = require('../../utils/llmAdapter');

function requestAsync(options) {
  return new Promise((resolve, reject) => {
    wx.request({
      ...options,
      success: resolve,
      fail: reject
    });
  });
}

Page({
  data: {
    models: getModelOptions(),
    selectedModel: 'chatgpt',
    question: '',
    result: '',
    loading: false,
    useMockResponse: app.globalData.useMockResponse
  },

  onSelectModel(event) {
    const key = event.currentTarget.dataset.key;
    this.setData({ selectedModel: key });
  },

  onInput(event) {
    this.setData({ question: event.detail.value });
  },

  onToggleMock(event) {
    this.setData({ useMockResponse: event.detail.value });
  },

  async onSubmit() {
    if (!this.data.question.trim()) {
      wx.showToast({ title: '请输入求测内容', icon: 'none' });
      return;
    }

    this.setData({ loading: true, result: '' });

    try {
      if (this.data.useMockResponse || !app.globalData.apiBase) {
        const mock = mockFortune(this.data.selectedModel, this.data.question);
        this.setData({ result: mock });
        return;
      }

      const payload = buildPayload(this.data.selectedModel, this.data.question);
      const base = app.globalData.apiBase.replace(/\/$/, '');
      const url = `${base}/api/fortune/${this.data.selectedModel}`;
      const response = await requestAsync({
        url,
        method: 'POST',
        data: payload,
        timeout: 15000
      });

      if (response.statusCode >= 200 && response.statusCode < 300) {
        const text = response.data?.result || response.data?.choices?.[0]?.message?.content;
        this.setData({ result: text || '未获得结果，请检查后端响应。' });
      } else {
        throw new Error('服务异常：' + response.statusCode);
      }
    } catch (error) {
      console.error('请求失败', error);
      wx.showToast({ title: '请求失败：' + error.message, icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  }
});
