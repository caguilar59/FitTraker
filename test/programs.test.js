const { test } = require('node:test');
const assert = require('node:assert/strict');
const session = require('express-session');
const Program = require('../models/program');
const createApp = require('../app');

test('programs require login, validate input, and scope every operation to the current account', async () => {
  const originals = { find: Program.find, create: Program.create, deleteOne: Program.deleteOne };
  const owner = '507f1f77bcf86cd799439011';
  let saved;
  let deleteFilter;
  Program.find = filter => {
    assert.deepEqual(filter, { owner });
    return { select: () => ({ sort: () => ({ lean: async () => saved ? [saved] : [] }) }) };
  };
  Program.create = async input => { saved = { ...input, _id: '507f1f77bcf86cd799439012' }; return saved; };
  Program.deleteOne = async filter => { deleteFilter = filter; return { deletedCount: filter._id === saved?._id ? 1 : 0 }; };
  const store = new session.MemoryStore();
  const productionApp = createApp({ store, secret: 'isolated-program-test-secret' });
  await new Promise((resolve, reject) => store.set('test-session', { cookie: { originalMaxAge: 60000, expires: new Date(Date.now() + 60000), httpOnly: true, path: '/' }, user: { id: owner } }, e => e ? reject(e) : resolve()));
  const signature = require('cookie-signature');
  const cookie = 'fittraker.sid=' + encodeURIComponent('s:' + signature.sign('test-session', 'isolated-program-test-secret'));
  const server = productionApp.listen(0);
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/programs`;
  const request = (method, suffix = '', body, authenticated = true) => fetch(base + suffix, { method, headers: { 'Content-Type': 'application/json', ...(authenticated ? { Cookie: cookie } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  try {
    for (const method of ['GET', 'POST', 'DELETE']) assert.equal((await request(method, method === 'DELETE' ? '/507f1f77bcf86cd799439012' : '', undefined, false)).status, 401);
    assert.equal((await request('GET')).status, 200);
    const valid = { date: '2026-10-21', category: 'Push', supersetCount: 2 };
    for (const change of [{ date: '2026-02-30' }, { date: {} }, { category: '<script>' }, { supersetCount: -1 }, { supersetCount: 1.5 }, { supersetCount: 21 }]) assert.equal((await request('POST', '', { ...valid, ...change })).status, 400);
    assert.equal((await request('POST', '', { ...valid, owner: 'attacker-supplied-owner' })).status, 201);
    assert.equal(saved.owner, owner);
    const list = await request('GET');
    assert.equal(list.headers.get('cache-control'), 'no-store');
    assert.equal((await list.json()).programs.length, 1);
    assert.equal((await request('DELETE', '/bad-id')).status, 400);
    assert.equal((await request('DELETE', '/507f1f77bcf86cd799439013')).status, 404);
    assert.equal(deleteFilter.owner, owner);
    assert.equal((await request('DELETE', '/' + saved._id)).status, 204);
    assert.deepEqual(deleteFilter, { _id: saved._id, owner });
    const denied = await fetch(base, { method: 'POST', headers: { Cookie: cookie, Origin: 'https://other.example', 'Content-Type': 'application/json' }, body: JSON.stringify(valid) });
    assert.equal(denied.status, 403);
    Program.find = () => { throw new Error('private database details'); };
    const failed = await request('GET');
    assert.equal(failed.status, 500);
    assert.doesNotMatch(await failed.text(), /private database details/);
  } finally {
    Object.assign(Program, originals);
    await new Promise(resolve => server.close(resolve));
  }
});
