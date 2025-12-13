// app.js
App({
  globalData: {
    // 可以在这里放置一些全局配置，例如后端域名或是否启用mock模式
    apiBase: '',
    useMockResponse: true
  },
  onLaunch() {
    console.log('算命小程序启动');
  }
});
