const { test } = require('node:test');
const assert = require('node:assert/strict');
const session = require('express-session');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const createApp = require('../app');

test('login cookie, protected pages, session identity, origin checks and logout', async () => {
  const original = User.findOne;
  const password = 'test-only-password';
  const hash = await bcrypt.hash(password, 4);
  User.findOne = async ({ email }) => email === 'session-test@example.com' ? { _id: 'test-id', name: 'Session Test', email, password: hash } : null;
  const store = new session.MemoryStore();
  const server = createApp({ store, secret: 'test-secret-used-only-by-isolated-tests' }).listen(0);
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = (path, data, headers = {}) => fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(data) });
  try {
    assert.equal((await fetch(base + '/api/auth/me')).status, 401);
    assert.equal((await fetch(base + '/api/exercises')).status, 401);
    const blocked = await fetch(base + '/public/index.html', { redirect: 'manual' });
    assert.equal(blocked.status, 302);
    assert.equal(blocked.headers.get('set-cookie'), null);
    assert.equal((await post('/api/auth/login', { email: 'session-test@example.com', password: 'wrong' })).status, 401);
    assert.equal((await post('/api/auth/login', { email: {}, password: {} })).status, 400);
    assert.equal((await post('/api/auth/login', {}, { Origin: 'https://other.example' })).status, 403);
    const login = await post('/api/auth/login', { email: ' SESSION-TEST@EXAMPLE.COM ', password });
    assert.equal(login.status, 200);
    const header = login.headers.get('set-cookie');
    assert.match(header, /HttpOnly/); assert.match(header, /SameSite=Lax/);
    const cookie = header.split(';')[0];
    const headers = { Cookie: cookie };
    const me = await fetch(base + '/api/auth/me', { headers });
    assert.equal(me.status, 200);
    assert.equal((await me.json()).user.id, 'test-id');
    const page = await fetch(base + '/public/index.html', { headers });
    assert.equal(page.status, 200); assert.equal(page.headers.get('cache-control'), 'no-store');
    assert.equal((await post('/api/auth/logout', {}, { ...headers, Origin: 'https://other.example' })).status, 403);
    assert.equal((await post('/api/auth/logout', {}, headers)).status, 200);
    assert.equal((await fetch(base + '/api/auth/me', { headers })).status, 401);
    assert.equal((await fetch(base + '/public/index.html', { headers, redirect: 'manual' })).status, 302);
  } finally {
    User.findOne = original;
    await new Promise(resolve => server.close(resolve));
  }
});
