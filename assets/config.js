/* ============================================================
   小征 · 接口配置
   只有这一处需要改：把 DeepSeek 的 key 填进下面的引号里。
   形如：key:'sk-1234567890abcdef'
   填完保存，刷新页面即生效。
   ============================================================ */
window.XZ={
  key:'',
  endpoint:'https://api.deepseek.com/v1/chat/completions',
  proxy:'',
  model:'deepseek-chat',
  temperature:0.5,
  maxTokens:420,
  timeout:9000
};