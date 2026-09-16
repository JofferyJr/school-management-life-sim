import test from 'node:test';
import assert from 'node:assert/strict';
import { recordTransaction, calculateDailyFinance } from '../src/management/financeService.js';

test('recordTransaction updates cash and ledger immutably', () => {
  const finance = { cash:1000, ledger:[] };
  const next = recordTransaction(finance, { id:'t1', day:1, category:'funding', amount:250, description:'Grant' });
  assert.equal(next.cash, 1250);
  assert.equal(next.ledger.length, 1);
  assert.equal(finance.cash, 1000);
});

test('daily finance includes salary expenses for hired staff', () => {
  const state = {
    school:{ ownership:'public' },
    people:{ students:[], staff:[{ id:'s1', salary:3000 }] },
    finance:{ cash:10000, ledger:[] },
    clock:{ day:1 }
  };
  assert.ok(calculateDailyFinance(state).some(tx => tx.category === 'salary'));
});
