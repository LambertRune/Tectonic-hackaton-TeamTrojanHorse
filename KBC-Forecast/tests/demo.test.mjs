import assert from 'node:assert/strict';
import test from 'node:test';

import { createSnapshot, demoDate, getSnapshot, initialChoices, PERSONAS } from '../src/data/demo.ts';

const request = (personaId, choices = {}, step = 0) => ({ personaId, step, choices: { ...initialChoices(), ...choices } });

test('every persona has fourteen consecutive days and consistent current balances', () => {
  for (const { id } of PERSONAS) {
    for (const step of [0, 1]) {
      const snapshot = createSnapshot(request(id, {}, step));
      assert.equal(snapshot.forecast.length, 14);
      assert.equal(snapshot.today, snapshot.forecast[0].date);
      assert.equal(snapshot.accounts[0].balance, snapshot.forecast[0].balance);
      for (let index = 1; index < snapshot.forecast.length; index++) {
        assert.equal(Date.parse(snapshot.forecast[index].date) - Date.parse(snapshot.forecast[index - 1].date), 86400000);
        assert.ok(Number.isFinite(snapshot.forecast[index].balance));
      }
    }
  }
});

test('Lotte’s what-if affects Friday onwards without spending current money', () => {
  const baseline = createSnapshot(request('lotte'));
  const scenario = createSnapshot(request('lotte', { nightOut: true }));
  assert.deepEqual(scenario.accounts, baseline.accounts);
  assert.deepEqual(scenario.transactions, baseline.transactions);
  for (let index = 0; index < 14; index++) {
    assert.equal(scenario.forecast[index].balance, Math.round((baseline.forecast[index].balance - (index >= 4 ? 60 : 0)) * 100) / 100);
  }
  assert.deepEqual(scenario.forecast.slice(4, 7).map(day => day.weather), ['thunder', 'cloud', 'sun']);
  assert.deepEqual(createSnapshot(request('lotte')), baseline);
});

test('advancing to Saturday records the night out once and keeps its recovery story', () => {
  const scenario = request('lotte', { nightOut: true }, 1);
  const saturday = createSnapshot(scenario);
  assert.equal(saturday.today, demoDate(5));
  assert.equal(saturday.transactions.filter(item => item.id === 'night-out').length, 1);
  assert.equal(saturday.forecast[0].weather, 'cloud');
  assert.equal(saturday.forecast[1].weather, 'sun');
  assert.equal(saturday.notices[0].id, 'recovery');
  assert.equal(saturday.accounts[0].balance, createSnapshot(request('lotte', { nightOut: true })).forecast[5].balance);
  assert.deepEqual(createSnapshot(scenario), saturday);
});

test('Peeters confirms the life event before receiving its playbook', () => {
  const pending = createSnapshot(request('peeters', {}, 1));
  assert.equal(pending.accounts[0].balance, 1990);
  assert.equal(pending.season, undefined);
  assert.equal(pending.notices[0].action, 'moment');
  assert.ok(!pending.notices.some(notice => notice.action === 'policy'));
  const confirmed = createSnapshot(request('peeters', { kotResponse: 'confirmed' }, 1));
  assert.equal(confirmed.season, 'Kind op kot');
  assert.ok(confirmed.notices.some(notice => notice.action === 'policy'));
  const dismissed = createSnapshot(request('peeters', { kotResponse: 'dismissed' }, 1));
  assert.equal(dismissed.season, undefined);
  assert.ok(!dismissed.notices.some(notice => ['buffer', 'policy'].includes(notice.action)));
  assert.deepEqual(dismissed.forecast, pending.forecast);
});

test('the temporary buffer is repaid when salary arrives; policy cancellation removes one charge', () => {
  const baseline = createSnapshot(request('peeters', { kotResponse: 'confirmed' }, 1));
  const buffered = createSnapshot(request('peeters', { kotResponse: 'confirmed', bufferAccepted: true }, 1));
  assert.equal(buffered.accounts[0].balance - baseline.accounts[0].balance, 500);
  assert.equal(buffered.forecast.find(day => day.dayIndex === 3).weather, 'rain');
  for (const day of buffered.forecast.filter(day => day.dayIndex >= 6)) {
    assert.equal(day.balance, baseline.forecast.find(item => item.date === day.date).balance);
  }
  const cancelled = createSnapshot(request('peeters', { kotResponse: 'confirmed', policyCancelled: true }, 1));
  assert.equal(cancelled.accounts[0].balance, baseline.accounts[0].balance);
  assert.equal(cancelled.forecast.find(day => day.dayIndex === 4).balance - baseline.forecast.find(day => day.dayIndex === 4).balance, 14);
  assert.ok(!cancelled.forecast.flatMap(day => day.signals).some(signal => signal.label === 'Extra KBC-polis'));
});

test('a held or cancelled fraudulent transfer never reduces Jos’s money', () => {
  const normal = createSnapshot(request('jos'));
  const held = createSnapshot(request('jos', {}, 1));
  const cancelled = createSnapshot(request('jos', { paymentCancelled: true, helpRequested: true }, 1));
  assert.equal(held.accounts[0].balance, normal.accounts[0].balance);
  assert.deepEqual(held.accounts, cancelled.accounts);
  assert.deepEqual(held.forecast, cancelled.forecast);
  assert.equal(held.transactions[0].status, 'held');
  assert.equal(cancelled.transactions[0].status, 'cancelled');
  assert.ok(!cancelled.notices.some(notice => notice.tone === 'danger'));
});

test('service responses are isolated from the request and other persona sessions', async () => {
  const input = request('lotte', { nightOut: true });
  const expected = structuredClone(input);
  const first = await getSnapshot(input);
  first.choices.nightOut = false;
  first.accounts[0].balance = 0;
  await getSnapshot(request('peeters', { bufferAccepted: true, kotResponse: 'confirmed' }, 1));
  assert.deepEqual(input, expected);
  assert.deepEqual(await getSnapshot(input), createSnapshot(expected));
  assert.deepEqual(await getSnapshot(request('lotte')), createSnapshot(request('lotte')));
});
