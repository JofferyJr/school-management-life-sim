export function recordTransaction(finance, tx) {
  return {
    ...finance,
    cash: finance.cash + tx.amount,
    ledger: [...finance.ledger, tx]
  };
}

function tx(day, category, amount, description) {
  return { id: crypto.randomUUID(), day, category, amount, description };
}

export function calculateDailyFinance(state) {
  const day = state.clock?.day ?? 1;
  const transactions = [];
  for (const staff of state.people?.staff ?? []) {
    transactions.push(tx(day, 'salary', -(staff.salary / 30), `Daily salary: ${staff.name ?? staff.id}`));
  }
  const boardingCount = (state.people?.students ?? []).filter(student => student.housingType === 'boarding').length;
  if (boardingCount) transactions.push(tx(day, 'boarding', -(boardingCount * 8), `Boarding food & utilities (${boardingCount})`));

  const studentCount = (state.people?.students ?? []).length;
  const ownership = state.school?.ownership;
  if (ownership === 'public') {
    transactions.push(tx(day, 'funding', Math.max(200, studentCount * 15), 'Daily government funding'));
  } else if (['private','international','independent'].includes(ownership)) {
    const dailyRate = ownership === 'international' ? 55 : ownership === 'private' ? 35 : 25;
    if (studentCount) transactions.push(tx(day, 'tuition', studentCount * dailyRate, 'Prorated daily tuition'));
  }
  return transactions;
}

export function applyDailyFinance(state) {
  let finance = state.finance;
  for (const transaction of calculateDailyFinance(state)) finance = recordTransaction(finance, transaction);
  return { ...state, finance };
}
