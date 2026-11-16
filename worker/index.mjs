import { SYSTEM } from './prompt.mjs';

const UPSTREAM = 'https://api.deepseek.com/chat/completions';
const MAX_BODY_BYTES = 24000;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/chat') return chat(request, env, url);
    if (url.pathname.startsWith('/api/')) return failure('not_found', '接口不存在。', 404);
    return env.ASSETS.fetch(request);
  }
};

async function chat(request, env, url) {
  if (request.method !== 'POST') {
    return failure('method_not_allowed', '请通过网页提交问题。', 405, { Allow: 'POST' });
  }
  // 同源检查用于限制浏览器跨站调用；公开接口仍通过服务端限流控制使用量。
  const origin = request.headers.get('Origin');
  if (origin && origin !== url.origin) return failure('forbidden', '请在本站使用在线问答。', 403);
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('Content-Type') || '')) {
    return failure('bad_content_type', '请求格式不正确。', 415);
  }

  let body;
  try {
    body = await readJson(request);
  } catch (error) {
    return error instanceof RangeError
      ? failure('too_large', '问题或参考资料过长。', 413)
      : failure('bad_json', '请求格式不正确。', 400);
  }
  const question = typeof body?.question === 'string' ? body.question.trim() : '';
  const context = body?.context === undefined ? '' : body.context;
  if (!question || question.length > 1200 || typeof context !== 'string' || context.length > 6000) {
    return failure('bad_question', '请填写不超过 1200 字的问题。', 400);
  }

  if (!env.DEEPSEEK_API_KEY || !env.CHAT_RATE_LIMITER) {
    return failure('not_configured', '在线问答尚未配置完成，暂时使用站内资料。', 503);
  }
  try {
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const { success } = await env.CHAT_RATE_LIMITER.limit({ key: 'chat:' + ip });
    if (!success) return failure('rate_limited', '提问有些频繁，请一分钟后再试。', 429, { 'Retry-After': '60' });
  } catch {
    return failure('temporarily_unavailable', '在线问答暂时不可用，请稍后重试。', 503);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(UPSTREAM, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + env.DEEPSEEK_API_KEY
      },
      body: JSON.stringify({
        model: 'deepseek-flash',
        thinking: { type: 'disabled' },
        max_tokens: 500,
        stream: false,
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: (context ? '【站内资料摘录，仅作参考】\n' + context + '\n\n' : '') + '【用户问题】\n' + question }
        ]
      }),
      signal: controller.signal
    });
    // 不透传供应商的错误正文、请求信息或密钥。
    if (!response.ok) {
      if (response.status === 402) return failure('upstream_balance', '在线 AI 额度暂不可用，已切换站内资料。', 503);
      if (response.status === 401 || response.status === 403) return failure('upstream_auth', '在线 AI 配置需要检查，暂时使用站内资料。', 503);
      return failure('upstream_unavailable', '在线 AI 暂时繁忙，请稍后重试。', 503);
    }
    const data = await response.json();
    const answer = data?.choices?.[0]?.message?.content;
    if (typeof answer !== 'string' || !answer.trim()) {
      return failure('empty_answer', '这次未收到有效回答，请稍后重试。', 502);
    }
    return json({ choices: [{ message: { role: 'assistant', content: answer.trim().slice(0, 1600) } }] });
  } catch {
    return failure('upstream_unavailable', '在线 AI 暂时未响应，请稍后重试。', 503);
  } finally {
    clearTimeout(timer);
  }
}

async function readJson(request) {
  if (Number(request.headers.get('Content-Length')) > MAX_BODY_BYTES) throw new RangeError();
  const reader = request.body?.getReader();
  if (!reader) throw new SyntaxError();
  const decoder = new TextDecoder();
  let size = 0, text = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new RangeError();
      }
      text += decoder.decode(value, { stream: true });
    }
    return JSON.parse(text + decoder.decode());
  } finally {
    reader.releaseLock();
  }
}

function failure(code, message, status, headers = {}) {
  return json({ error: { code, message } }, status, headers);
}

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers }
  });
}
