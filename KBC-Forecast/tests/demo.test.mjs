import assert from 'node:assert/strict';
import test from 'node:test';

import { BALANCE, DAYS, dayText, eur, forecast, goalText, GSM_DAY, headline, initialChoices, spendOn } from '../src/data/demo.ts';

const choose = patch => ({ ...initialChoices(), ...patch });

test('baseline month is sunny with rain on 6 and 7 October', () => {
  const choices = initialChoices();
  const model = forecast(choices);
  assert.equal(model.path.length, DAYS + 1);
  assert.equal(model.path[0], BALANCE);
  assert.equal(eur(model.perDay), '€ 24');
  assert.equal(model.redDay, -1);
  assert.deepEqual(model.weather.slice(0, 7), ['sun', 'sun', 'sun', 'sun', 'rain', 'rain', 'sun']);
  assert.equal(headline(model, choices), 'Een zonnige maand, met wat regen op 6 en 7 oktober.');
});

test('going out tonight: thunder, then clouds, then clearing up', () => {
  const choices = choose({ uitgaan: true });
  const model = forecast(choices);
  assert.deepEqual(model.weather.slice(0, 3), ['thunder', 'cloud', 'rainbow']);
  assert.equal(Math.round(model.perDay) - Math.round(forecast(initialChoices()).perDay), -2);
  assert.match(headline(model, choices), /na regen komt zonneschijn/);
  assert.equal(dayText(model, 1).title, 'Zaterdag 3/10 · Bewolkt');
});

test('buying the phone turns Saturday 10/10 into a storm and the month red', () => {
  const choices = choose({ gsm: true });
  const model = forecast(choices);
  assert.equal(model.weather[GSM_DAY], 'storm');
  assert.ok(model.low < 0);
  assert.ok(model.redDay > GSM_DAY);
  assert.match(headline(model, choices), /^Storm op zaterdag 10\/10/);
  assert.equal(spendOn(model.events[GSM_DAY]), 299);
});

test('savings are not spending and drive the goal date', () => {
  const withSaving = forecast(initialChoices());
  const without = forecast(choose({ sparen: false }));
  assert.equal(spendOn(withSaving.events[7]), 0);
  assert.ok(without.perDay > withSaving.perDay);
  assert.equal(goalText(withSaving), 'Met € 25 per week haal je het rond december.');
  assert.equal(goalText(without), 'Zonder vaste spaarbooster haal je het niet voor de zomer.');
});

test('euro formatting matches the mockup', () => {
  assert.equal(eur(1120), '€ 1.120');
  assert.equal(eur(-68.6), '€ -69');
});
