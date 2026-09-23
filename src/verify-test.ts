import { INITIAL_FAMILIES, INITIAL_PAYMENTS, INITIAL_SETTINGS } from '../src/lib/mock-data';
import {
  calculateFamilyStatus,
  calculateWeeklyGrid,
  getWeeksDue,
  formatCurrency,
} from '../src/lib/calculations';

console.log('--- 1. VERIFYING SEED TOTALS ---');
const totals: Record<string, number> = {};
INITIAL_FAMILIES.forEach((f) => {
  const sum = INITIAL_PAYMENTS.filter((p) => p.family_id === f.id).reduce(
    (acc, p) => acc + p.amount,
    0
  );
  totals[f.name] = sum;
  console.log(`${f.name}: Rs. ${sum.toLocaleString()}`);
});

const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);
console.log(`Grand Total: Rs. ${grandTotal.toLocaleString()}`);

// Assertions
if (totals['Mr. Nooman'] !== 15000) throw new Error('Nooman total mismatch');
if (totals['Mr. Rikaz'] !== 10500) throw new Error('Rikaz total mismatch');
if (totals['Mr. Haneef'] !== 15000) throw new Error('Haneef total mismatch');
if (totals['Mr. Hamas'] !== 15000) throw new Error('Hamas total mismatch');
if (grandTotal !== 55500) throw new Error('Grand total mismatch');
console.log('✅ Seed totals match perfectly: 15k, 10.5k, 15k, 15k = 55.5k!');

console.log('\n--- 2. VERIFYING WEEKS DUE CALCULATION ---');
// Start date: 2026-05-29
console.log('On Start Date (2026-05-29): Week', getWeeksDue('2026-05-29', '2026-05-29'));
console.log('On Day 6 (2026-06-04): Week', getWeeksDue('2026-05-29', '2026-06-04'));
console.log('On Week 2 Start (2026-06-05): Week', getWeeksDue('2026-05-29', '2026-06-05'));
console.log('On W10 (2026-07-31): Week', getWeeksDue('2026-05-29', '2026-07-31'));

console.log('\n--- 3. VERIFYING GRID WATERFALL ALLOCATION ---');
const grid = calculateWeeklyGrid(INITIAL_FAMILIES, INITIAL_PAYMENTS, INITIAL_SETTINGS, '2026-07-31');
console.log(`Calculated ${grid.rows.length} rows. Grand total in grid: ${grid.grandTotal}`);

// W6 Rikaz should be Paid (500 + 1000 = 1500)
const w6Rikaz = grid.rows[5].family_cells['fam-rikaz'];
console.log('Week 6 Rikaz status:', w6Rikaz.status, w6Rikaz.label, 'allocated:', w6Rikaz.allocated_amount);
if (w6Rikaz.allocated_amount !== 1500) throw new Error('Rikaz W6 should have 1500 allocated');

// W8 Rikaz should be Not Paid (Rikaz only paid through W7 = 10,500 = 7 weeks)
const w8Rikaz = grid.rows[7].family_cells['fam-rikaz'];
console.log('Week 8 Rikaz status:', w8Rikaz.status, w8Rikaz.label, 'allocated:', w8Rikaz.allocated_amount);
if (w8Rikaz.allocated_amount !== 0) throw new Error('Rikaz W8 should have 0 allocated');

console.log('\nALL VERIFICATION TESTS PASSED SUCCESSFULLY! 🎯');
