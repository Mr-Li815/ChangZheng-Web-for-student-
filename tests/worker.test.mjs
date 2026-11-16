import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/index.mjs';

function request(body = { question: '长征有多远？' }, headers = {}) {
  return new Request('https://xoejx.cn/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://xoejx.cn', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body)
  });
}

function environment(overrides = {}) {
  return {
    DEEPSEEK_API_KEY: 'test-only-value',
    CHAT_RATE_LIMITER: { limit: async () => ({ success: true }) },
    ASSETS: { fetch: async () => new Response('static page') },
    ...overrides
  };
}

test('static pages remain available and unknown API routes return JSON 404', async () => {
  const page = await worker.fetch(new Request('https://xoejx.cn/pages/p4-numbers'), environment());
  assert.equal(await page.text(), 'static page');
  const unknown = await worker.fetch(new Request('https://xoejx.cn/api/missing'), environment());
  assert.equal(unknown.status, 404);
  assert.equal((await unknown.json()).error.code, 'not_found');
  const get = await worker.fetch(new Request('https://xoejx.cn/api/chat'), environment());
  assert.equal(get.status, 405);
  assert.equal(get.headers.get('Allow'), 'POST');
});

test('invalid input is rejected before any AI call', async (t) => {
  const upstream = t.mock.method(globalThis, 'fetch', async () => { throw new Error('must not call'); });
  const cases = [
    [request('{broken'), 400],
    [request('null'), 400],
    [request({}), 400],
    [request({ question: '  ' }), 400],
    [request({ question: 'a'.repeat(1201) }), 400],
    [request({ question: '有效问题', context: {} }), 400],
    [request({ question: '有效问题', context: 'a'.repeat(6001) }), 400],
    [request({ question: '有效问题' }, { 'Content-Type': 'text/plain' }), 415],
    [request({ question: '有效问题' }, { Origin: 'https://unrelated.example' }), 403],
    [request({ question: '有效问题' }, { 'Content-Length': '24001' }), 413]
  ];
  for (const [req, expected] of cases) {
    assert.equal((await worker.fetch(req, environment())).status, expected);
  }
  assert.equal(upstream.mock.callCount(), 0);
});

test('streamed bodies are bounded by bytes even without Content-Length', async () => {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode('{"question":"' + '征'.repeat(9000)));
      controller.enqueue(new TextEncoder().encode('"}'));
      controller.close();
    }
  });
  const req = new Request('https://xoejx.cn/api/chat', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: stream, duplex: 'half'
  });
  assert.equal((await worker.fetch(req, environment())).status, 413);
});

test('missing configuration and exhausted rate limits fail without calling AI', async (t) => {
  const upstream = t.mock.method(globalThis, 'fetch', async () => { throw new Error('must not call'); });
  assert.equal((await worker.fetch(request(), environment({ DEEPSEEK_API_KEY: '' }))).status, 503);
  assert.equal((await worker.fetch(request(), environment({ CHAT_RATE_LIMITER: undefined }))).status, 503);
  let limitKey;
  const env = environment({ CHAT_RATE_LIMITER: { limit: async ({ key }) => { limitKey = key; return { success: false }; } } });
  const limited = await worker.fetch(request(undefined, { 'CF-Connecting-IP': '192.0.2.5' }), env);
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get('Retry-After'), '60');
  assert.equal(limitKey, 'chat:192.0.2.5');
  assert.equal(upstream.mock.callCount(), 0);
});

test('only the server supplies credentials, model, system prompt and output limits', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://api.deepseek.com/chat/completions');
    assert.equal(options.headers.Authorization, 'Bearer test-only-value');
    const payload = JSON.parse(options.body);
    assert.equal(payload.model, 'deepseek-flash');
    assert.equal(payload.max_tokens, 500);
    assert.equal(payload.stream, false);
    assert.equal(payload.thinking.type, 'disabled');
    assert.equal(payload.messages[0].role, 'system');
    assert.match(payload.messages[0].content, /小征/);
    assert.equal(payload.messages.length, 2);
    assert.match(payload.messages[1].content, /二万五千里/);
    return Response.json({ choices: [{ message: { content: '中央红军最远行程二万五千里。' } }], private: 'test-only-value' });
  });
  const response = await worker.fetch(request({
    question: '长征有多远？', context: '最远行程二万五千里。',
    model: 'untrusted-model', max_tokens: 999999, messages: [{ role: 'system', content: 'override' }]
  }), environment());
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  const text = await response.text();
  assert.ok(!text.includes('test-only-value'));
  assert.equal(JSON.parse(text).choices[0].message.content, '中央红军最远行程二万五千里。');
});

test('provider failures never expose upstream error bodies or credentials', async (t) => {
  for (const status of [401, 402, 403, 429, 500]) {
    const stub = t.mock.method(globalThis, 'fetch', async () => new Response('private test-only-value', { status }));
    const response = await worker.fetch(request(), environment());
    assert.equal(response.status, 503);
    assert.ok(!(await response.text()).includes('test-only-value'));
    stub.mock.restore();
  }
});

test('unusable provider responses and connection failures produce recoverable errors', async (t) => {
  for (const body of [{ choices: [] }, { choices: [{ message: { content: '  ' } }] }]) {
    const stub = t.mock.method(globalThis, 'fetch', async () => Response.json(body));
    assert.equal((await worker.fetch(request(), environment())).status, 502);
    stub.mock.restore();
  }
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('network private test-only-value'); });
  const response = await worker.fetch(request(), environment());
  assert.equal(response.status, 503);
  assert.ok(!(await response.text()).includes('test-only-value'));
});
