import {
  Family,
  Payment,
  AppSettings,
  FamilyFinancialStatus,
  WeekGridRow,
  WeekGridCell,
  WeekCellStatus,
} from '@/types';

/**
 * Formats a numeric amount in Sri Lankan Rupees, e.g. "Rs. 1,500"
 */
export function formatCurrency(amount: number): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat('en-LK', {
    maximumFractionDigits: 0,
  }).format(absAmount);

  return isNegative ? `-Rs. ${formatted}` : `Rs. ${formatted}`;
}

/**
 * Returns the current date in Sri Lanka Time (Asia/Colombo) as a Date object or YYYY-MM-DD string
 */
export function getColomboDate(dateInput?: Date | string): Date {
  const base = dateInput ? new Date(dateInput) : new Date();
  // Format into Asia/Colombo string and reconstruct to avoid local timezone drift
  const colomboString = base.toLocaleString('en-US', { timeZone: 'Asia/Colombo' });
  return new Date(colomboString);
}

/**
 * Formats a Date or date string to YYYY-MM-DD
 */
export function formatDateISO(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a date string to a human readable format: "29 May 2026"
 */
export function formatDisplayDate(dateInput: Date | string): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput + 'T00:00:00') : dateInput;
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Computes the date for a given week number (1-indexed).
 * Week 1 = start_date. Each subsequent week is +7 days.
 */
export function getWeekDate(startDateStr: string, weekNumber: number): Date {
  const start = new Date(startDateStr + 'T00:00:00');
  const daysToAdd = (weekNumber - 1) * 7;
  const targetDate = new Date(start);
  targetDate.setDate(targetDate.getDate() + daysToAdd);
  return targetDate;
}

/**
 * Calculates how many weeks are due up to the asOfDate.
 * Week 1 counts on the start date itself.
 */
export function getWeeksDue(
  startDateStr: string,
  asOfDateInput?: Date | string,
  totalWeeks = 51
): number {
  const asOf = asOfDateInput
    ? getColomboDate(asOfDateInput)
    : getColomboDate();

  const start = new Date(startDateStr + 'T00:00:00');

  // Set times to midnight for accurate day comparison
  const asOfMidnight = new Date(asOf.getFullYear(), asOf.getMonth(), asOf.getDate());
  const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate());

  const diffTime = asOfMidnight.getTime() - startMidnight.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 0; // Not started yet
  }

  // Day 0 (start date) is week 1, day 7 is week 2, etc.
  const weeks = Math.floor(diffDays / 7) + 1;
  return Math.min(weeks, totalWeeks);
}

/**
 * Calculates financial status for a single family.
 * Shared function used everywhere: Dashboard, Payments, Weekly Card, and SMS.
 */
export function calculateFamilyStatus(
  family: Family,
  payments: Payment[],
  settings: AppSettings,
  asOfDateInput?: Date | string
): FamilyFinancialStatus {
  const familyPayments = payments
    .filter((p) => p.family_id === family.id)
    .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());

  const total_paid = familyPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const weeks_due = getWeeksDue(settings.start_date, asOfDateInput, settings.total_weeks);
  const expected_amount = weeks_due * settings.weekly_amount;
  const balance = total_paid - expected_amount;

  let status: 'advance' | 'ok' | 'due' = 'ok';
  let status_label = 'Up to date';
  let weeks_behind = 0;
  let weeks_ahead = 0;

  if (balance > 0) {
    status = 'advance';
    const numWeeksAhead = balance / settings.weekly_amount;
    weeks_ahead = Number(numWeeksAhead.toFixed(1));
    const isWhole = numWeeksAhead % 1 === 0;
    status_label = `${isWhole ? numWeeksAhead : numWeeksAhead.toFixed(1)} ${
      numWeeksAhead === 1 ? 'week' : 'weeks'
    } ahead (+${formatCurrency(balance)})`;
  } else if (balance < 0) {
    status = 'due';
    const amountDue = Math.abs(balance);
    const numWeeksBehind = Math.ceil(amountDue / settings.weekly_amount);
    weeks_behind = numWeeksBehind;
    status_label = `${formatCurrency(amountDue)} due · ${numWeeksBehind} ${
      numWeeksBehind === 1 ? 'week' : 'weeks'
    } behind`;
  } else {
    status = 'ok';
    status_label = 'Up to date ✅';
  }

  const latestPayment = familyPayments[0] || null;

  return {
    family_id: family.id,
    family_name: family.name,
    total_paid,
    weeks_due,
    expected_amount,
    balance,
    status,
    status_label,
    weeks_behind,
    weeks_ahead,
    last_payment_date: latestPayment ? latestPayment.payment_date : null,
    last_payment_amount: latestPayment ? latestPayment.amount : null,
    last_paid_by: latestPayment ? latestPayment.paid_by : null,
  };
}

/**
 * Calculates financial status for all families.
 */
export function calculateAllFamiliesStatus(
  families: Family[],
  payments: Payment[],
  settings: AppSettings,
  asOfDateInput?: Date | string
): FamilyFinancialStatus[] {
  return families.map((f) => calculateFamilyStatus(f, payments, settings, asOfDateInput));
}

/**
 * Calculates the weekly grid (51 weeks x 4 families).
 * Uses oldest-first FIFO allocation of payments to fill weeks.
 */
export function calculateWeeklyGrid(
  families: Family[],
  payments: Payment[],
  settings: AppSettings,
  asOfDateInput?: Date | string
): {
  rows: WeekGridRow[];
  familyTotals: Record<string, number>;
  grandTotal: number;
  totalTarget: number;
} {
  const currentWeek = getWeeksDue(settings.start_date, asOfDateInput, settings.total_weeks);
  const rows: WeekGridRow[] = [];

  // Calculate total paid per family
  const familyPaidMap: Record<string, number> = {};
  families.forEach((f) => {
    familyPaidMap[f.id] = payments
      .filter((p) => p.family_id === f.id)
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  });

  const weeklyAmount = settings.weekly_amount;
  const totalWeeks = settings.total_weeks || 51;

  for (let w = 1; w <= totalWeeks; w++) {
    const weekDate = getWeekDate(settings.start_date, w);
    const dateStr = formatDateISO(weekDate);
    const formattedDate = formatDisplayDate(weekDate);
    const isPastOrCurrent = w <= currentWeek;

    const family_cells: Record<string, WeekGridCell> = {};
    let rowTotal = 0;

    families.forEach((fam) => {
      const totalPaid = familyPaidMap[fam.id] || 0;
      const priorThreshold = (w - 1) * weeklyAmount;
      const allocatedAmount = Math.max(0, Math.min(weeklyAmount, totalPaid - priorThreshold));

      rowTotal += allocatedAmount;

      let cellStatus: WeekCellStatus = 'unpaid';
      let label = 'Not paid';

      if (allocatedAmount >= weeklyAmount) {
        if (w > currentWeek) {
          cellStatus = 'advance';
          label = 'Advance';
        } else {
          cellStatus = 'paid';
          label = 'Paid';
        }
      } else if (allocatedAmount > 0) {
        if (w > currentWeek) {
          cellStatus = 'advance';
          label = `Adv (Rs. ${allocatedAmount})`;
        } else {
          cellStatus = 'part';
          label = `Part (${formatCurrency(allocatedAmount)})`;
        }
      } else {
        cellStatus = 'unpaid';
        label = w > currentWeek ? '—' : 'Not paid';
      }

      family_cells[fam.id] = {
        family_id: fam.id,
        status: cellStatus,
        allocated_amount: allocatedAmount,
        target_amount: weeklyAmount,
        label,
      };
    });

    rows.push({
      week_number: w,
      week_date: dateStr,
      formatted_date: formattedDate,
      is_past_or_current: isPastOrCurrent,
      family_cells,
      row_total: rowTotal,
      row_target: families.length * weeklyAmount,
    });
  }

  const grandTotal = Object.values(familyPaidMap).reduce((a, b) => a + b, 0);
  const totalTarget = settings.target_amount || families.length * weeklyAmount * totalWeeks;

  return {
    rows,
    familyTotals: familyPaidMap,
    grandTotal,
    totalTarget,
  };
}

/**
 * Live preview calculation: returns how the family's balance and status
 * will change after adding a specific payment amount.
 */
export function previewPaymentImpact(
  family: Family,
  payments: Payment[],
  newAmount: number,
  settings: AppSettings,
  asOfDateInput?: Date | string
): string {
  const currentStatus = calculateFamilyStatus(family, payments, settings, asOfDateInput);
  const simulatedTotal = currentStatus.total_paid + (Number(newAmount) || 0);
  const simulatedBalance = simulatedTotal - currentStatus.expected_amount;

  if (simulatedBalance > 0) {
    const weeksAhead = simulatedBalance / settings.weekly_amount;
    const isWhole = weeksAhead % 1 === 0;
    const aheadText = `${isWhole ? weeksAhead : weeksAhead.toFixed(1)} ${
      weeksAhead === 1 ? 'week' : 'weeks'
    } ahead`;
    return `After this payment, ${family.name} will be ${aheadText} (+${formatCurrency(simulatedBalance)}).`;
  } else if (simulatedBalance < 0) {
    const due = Math.abs(simulatedBalance);
    const weeksBehind = Math.ceil(due / settings.weekly_amount);
    return `After this payment, ${family.name} will have ${formatCurrency(due)} due (${weeksBehind} ${
      weeksBehind === 1 ? 'week' : 'weeks'
    } behind).`;
  } else {
    return `After this payment, ${family.name} will be completely up to date! 🎉`;
  }
}

/**
 * Calculates days remaining until Eid al-Adha
 */
export function getDaysUntilEid(eidDateStr: string, asOfDateInput?: Date | string): number {
  const asOf = asOfDateInput ? getColomboDate(asOfDateInput) : getColomboDate();
  const eid = new Date(eidDateStr + 'T00:00:00');

  const asOfMidnight = new Date(asOf.getFullYear(), asOf.getMonth(), asOf.getDate());
  const eidMidnight = new Date(eid.getFullYear(), eid.getMonth(), eid.getDate());

  const diff = eidMidnight.getTime() - asOfMidnight.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Generates the weekly SMS message for a family based on their financial status.
 */
export function generateSMSMessage(
  family: Family,
  status: FamilyFinancialStatus,
  settings: AppSettings
): string {
  if (status.balance < 0) {
    const dueAmount = formatCurrency(Math.abs(status.balance));
    const paidAmount = formatCurrency(status.total_paid);
    const bank = settings.bank_details;

    if (settings.sms_template_due) {
      return settings.sms_template_due
        .replace('{FAMILY}', family.family_title || family.name)
        .replace('{PAID}', paidAmount)
        .replace('{DUE}', dueAmount)
        .replace('{NAME}', bank.account_name)
        .replace('{BANK}', bank.bank_name)
        .replace('{ACCOUNT}', bank.account_number);
    }

    return `Assalamu Alaikum. Qurban Fund - ${family.family_title || family.name}.\nPaid: ${paidAmount}. Due now: ${dueAmount}.\nPay to: ${bank.account_name}, ${bank.bank_name}, A/C ${bank.account_number}. JazakAllah khair.`;
  }

  // Up to date or advance
  const paidAmount = formatCurrency(status.total_paid);
  if (settings.sms_template_paid) {
    return settings.sms_template_paid
      .replace('{FAMILY}', family.family_title || family.name)
      .replace('{PAID}', paidAmount);
  }

  return `Assalamu Alaikum. Qurban Fund - ${family.family_title || family.name}.\nAlhamdulillah, you are up to date! Total paid: ${paidAmount}.\nMay Allah accept our Qurban. JazakAllah khair.`;
}
