"use strict";

/* ========== Existing CALCULATORS array preserved from your file ========== */
const CALCULATORS = [
    // 1. Financial Calculations
    {
        id: 'sip',
        title: 'SIP Calculator',
        category: 'Investments',
        description: `SIP (Systematic Investment Plan) calculates future value of periodic investments. Supports monthly and annual contributions and an optional step-up (increase) each year.`,
        formula: `Future Value (monthly): FV = P × [((1 + r/n)^{n*t} − 1) / (r/n)] × (1 + r/n)`,
        inputs: [
            { id: 'amount', label: 'Investment amount (per period)', type: 'number', placeholder: 'e.g. 5000', default: 5000 },
            { id: 'rate', label: 'Expected annual return (%)', type: 'number', placeholder: 'e.g. 12', default: 12 },
            { id: 'years', label: 'Investment horizon (years)', type: 'number', placeholder: 'e.g. 10', default: 10 },
            { id: 'freq', label: 'Frequency', type: 'select', options: [{ v: 'monthly', t: 'Monthly' }, { v: 'annual', t: 'Annual' }], default: 'monthly' },
            { id: 'stepupType', label: 'Step-up type', type: 'select', options: [{ v: 'none', t: 'No step-up' }, { v: 'percent', t: 'Percentage (%)' }, { v: 'fixed', t: 'Fixed amount' }], default: 'none' },
            { id: 'stepup', label: 'Step-up value', type: 'number', placeholder: 'e.g. 10 (for %) or 500 (for ₹)', default: 0 }
        ],
        calculate: ({ amount, rate, years, freq, stepupType, stepup }) => {
            amount = Number(amount);
            rate = Number(rate) / 100;
            years = Number(years);
            stepup = Number(stepup);
            const n = (freq === 'monthly') ? 12 : 1;

            let fv = 0;
            let currentAmount = amount;
            if (freq === 'monthly') {
                for (let y = 0; y < years; y++) {
                    let rmonthly = rate / 12;
                    for (let m = 0; m < 12; m++) {
                        const periods = (years - y) * 12 - m;
                        fv += currentAmount * Math.pow(1 + rmonthly, periods);
                    }
                    if (stepupType === 'percent') {
                        currentAmount *= (1 + stepup / 100);
                    } else if (stepupType === 'fixed') {
                        currentAmount += stepup;
                    }
                }
            } else {
                for (let y = 0; y < years; y++) {
                    const periods = years - y;
                    fv += currentAmount * Math.pow(1 + rate, periods);
                    if (stepupType === 'percent') {
                        currentAmount *= (1 + stepup / 100);
                    } else if (stepupType === 'fixed') {
                        currentAmount += stepup;
                    }
                }
            }

            const totalInvested = (() => {
                if (freq === 'monthly') {
                    let sum = 0; let amt = amount;
                    for (let y = 0; y < years; y++) {
                        sum += amt * 12;
                        if (stepupType === 'percent') {
                            amt *= (1 + stepup / 100);
                        } else if (stepupType === 'fixed') {
                            amt += stepup;
                        }
                    }
                    return sum;
                } else {
                    let sum = 0; let amt = amount;
                    for (let y = 0; y < years; y++) {
                        sum += amt;
                        if (stepupType === 'percent') {
                            amt *= (1 + stepup / 100);
                        } else if (stepupType === 'fixed') {
                            amt += stepup;
                        }
                    }
                    return sum;
                }
            })();

            let stepDesc = '';
            if (stepupType === 'percent' && stepup > 0) {
                stepDesc = ` with ${stepup}% annual step-up`;
            } else if (stepupType === 'fixed' && stepup > 0) {
                stepDesc = ` with ₹${stepup} fixed annual step-up`;
            }

            return { fv, totalInvested, steps: `Calculated by iterating per ${freq} period with compounding applied${stepDesc}.` };
        }
    },

    {
        id: 'swp',
        title: 'SWP Calculator',
        category: 'Investments',
        description: `Calculate how long your investment will last (or remaining balance) when making regular withdrawals, with growth taken into account.`,
        formula: `For duration: N = [ln(1 − (P × r) / (A × r))] / [n × ln(1 + r/n)]`,
        inputs: [
            { id: 'principal', label: 'Initial investment (P)', type: 'number', placeholder: 'e.g. 10,00,000', default: 1000000 },
            { id: 'withdraw', label: 'Withdrawal per period', type: 'number', placeholder: 'e.g. 10,000', default: 10000 },
            { id: 'rate', label: 'Expected annual return (%)', type: 'number', placeholder: 'e.g. 6', default: 6 },
            { id: 'freq', label: 'Withdrawal frequency', type: 'select', options: [{ v: 'monthly', t: 'Monthly' }, { v: 'annual', t: 'Annual' }], default: 'monthly' },
            { id: 'years', label: 'Number of years', type: 'number', placeholder: 'Optional (leave blank to calculate duration)', default: '' },
            { id: 'stepupType', label: 'Withdrawal step-up type', type: 'select', options: [{ v: 'none', t: 'No step-up' }, { v: 'percent', t: 'Percentage (%)' }, { v: 'fixed', t: 'Fixed amount' }], default: 'none' },
            { id: 'stepup', label: 'Step-up value', type: 'number', placeholder: 'e.g. 7% or 1000', default: 0 }
        ],
        calculate: ({ principal, withdraw, rate, freq, years, stepupType, stepup }) => {
            let P = Number(principal);
            let A = Number(withdraw);
            let r = Number(rate) / 100;
            const n = (freq === 'monthly') ? 12 : 1;
            let step = Number(stepup);
            let duration = 0, balance = P, yr = 0;
            years = Number(years) || undefined;

            if (!years) {
                while (balance > 0 && duration < 100 * 12) {
                    let actualA = A;
                    if (stepupType === 'percent') actualA *= Math.pow(1 + step / 100, Math.floor(duration / n));
                    if (stepupType === 'fixed') actualA += step * Math.floor(duration / n);
                    balance = balance * (1 + r / n) - actualA;
                    duration++;
                    if (n === 12 && duration % 12 === 0) yr++;
                }
                const y = n === 12 ? Math.floor(duration / 12) : duration;
                return { years: y, steps: `Investment lasts for approximately ${y} ${n === 12 ? 'years' : 'periods'}.` };
            } else {
                let totalWithdrawn = 0;
                for (let i = 0; i < years * n; i++) {
                    let actualA = A;
                    if (stepupType === 'percent') actualA *= Math.pow(1 + step / 100, Math.floor(i / n));
                    if (stepupType === 'fixed') actualA += step * Math.floor(i / n);
                    balance = balance * (1 + r / n) - actualA;
                    totalWithdrawn += (balance > 0 ? actualA : 0);
                    if (balance <= 0) {
                        balance = 0; break;
                    }
                }
                return { balance, totalWithdrawn, steps: `After ${years} years, remaining balance: ${balance.toFixed(2)}. Total withdrawn: ${totalWithdrawn.toFixed(2)}` };
            }
        }
    },

    {
        id: 'lumpsum',
        title: 'Lumpsum Calculator',
        category: 'Investments',
        description: `Calculate future value of a single lumpsum investment after a number of years with compound interest.`,
        formula: `FV = P × (1 + r/n)^{n×t}`,
        inputs: [
            { id: 'principal', label: 'Lumpsum amount (P)', type: 'number', placeholder: 'e.g. 1,00,000', default: 100000 },
            { id: 'rate', label: 'Expected annual return (%)', type: 'number', placeholder: 'e.g. 10', default: 10 },
            { id: 'years', label: 'Time period (years)', type: 'number', placeholder: 'e.g. 7', default: 7 },
            { id: 'n', label: 'Compounded', type: 'select', options: [{ v: 1, t: 'Yearly' }, { v: 2, t: 'Half-yearly' }, { v: 4, t: 'Quarterly' }, { v: 12, t: 'Monthly' }], default: 1 }
        ],
        calculate: ({ principal, rate, years, n }) => {
            let P = Number(principal); let r = Number(rate) / 100; let t = Number(years); n = Number(n);
            const fv = P * Math.pow(1 + r / n, n * t);
            return { fv, steps: `FV = ${P} × (1 + ${r}/${n})^{${n * t}} = ${fv.toFixed(2)}` };
        }
    },
    {
        id: 'fd',
        title: 'Fixed Deposit Calculator',
        category: 'Investments',
        description: 'Calculate maturity amount for a fixed deposit with compound interest compounded periodically.',
        formula: 'M = P × (1 + r/n)^{n*t}',
        inputs: [
            { id: 'p', label: 'Principal (P)', type: 'number', default: 100000 },
            { id: 'r', label: 'Annual rate (%)', type: 'number', default: 7.0 },
            { id: 't', label: 'Tenure (years)', type: 'number', default: 5 },
            { id: 'n', label: 'Compounding per year', type: 'select', options: [{ v: 1, t: 'Yearly' }, { v: 2, t: 'Half-yearly' }, { v: 4, t: 'Quarterly' }, { v: 12, t: 'Monthly' }], default: 1 }
        ],
        calculate: ({ p, r, t, n }) => {
            p = Number(p); r = Number(r) / 100; t = Number(t); n = Number(n);
            const m = p * Math.pow(1 + r / n, n * t);
            const interest = m - p;
            return { maturity: m, interest, steps: `M = P × (1 + r/n)^{n*t} => ${p} × (1 + ${r.toFixed(4)}/${n})^{${n * t}} = ${m.toFixed(2)}` };
        }
    },

    {
        id: 'rd',
        title: 'Recurring Deposit Calculator',
        category: 'Investments',
        description: 'Periodic monthly deposit with interest compounded monthly.',
        formula: 'M = P × [ ( (1+r/n)^{n*t} − 1 ) / (1 − (1+r/n)^{-1/periodsPerDeposit}) ]',
        inputs: [
            { id: 'monthly', label: 'Monthly deposit', type: 'number', default: 2000 },
            { id: 'rate', label: 'Annual rate (%)', type: 'number', default: 6.5 },
            { id: 'years', label: 'Tenure (years)', type: 'number', default: 5 }
        ],
        calculate: ({ monthly, rate, years }) => {
            monthly = Number(monthly); let r = Number(rate) / 100; let t = Number(years);
            const n = 12;
            const periods = n * t;
            const rmonthly = r / 12;
            let maturity = 0;
            for (let i = 0; i < periods; i++) {
                maturity += monthly * Math.pow(1 + rmonthly, periods - i);
            }
            const total = monthly * periods;
            const interest = maturity - total;
            return { maturity, total, interest, steps: `Summed each monthly deposit with monthly compounding for ${periods} months.` }
        }
    },

    {
        id: 'ppf',
        title: 'Public Provident Fund',
        category: 'Investments',
        description: 'Calculate maturity value for PPF account. PPF has a 15-year lock-in period with annual contributions and tax-free returns.',
        formula: 'M = P × [((1 + r)^n − 1) / r] × (1 + r)',
        inputs: [
            { id: 'annual', label: 'Annual contribution', type: 'number', default: 150000 },
            { id: 'rate', label: 'PPF rate (%)', type: 'number', default: 7.1 },
            { id: 'years', label: 'Investment period (years)', type: 'number', default: 15 }
        ],
        calculate: ({ annual, rate, years }) => {
            annual = Number(annual); let r = Number(rate) / 100; let t = Number(years);
            let maturity = 0;
            for (let i = 0; i < t; i++) {
                maturity += annual * Math.pow(1 + r, t - i);
            }
            const total = annual * t;
            const interest = maturity - total;
            return { maturity, total, interest, steps: `PPF compounds annually. Sum of ${t} annual contributions with compounding: Maturity = ${maturity.toFixed(2)}` }
        }
    },

    {
        id: 'nps',
        title: 'National Pension System',
        category: 'Investments',
        description: 'Calculate NPS corpus at retirement. Supports monthly contributions with expected returns.',
        formula: 'FV = PMT × [((1 + r/n)^{n*t} − 1) / (r/n)]',
        inputs: [
            { id: 'monthly', label: 'Monthly contribution', type: 'number', default: 5000 },
            { id: 'rate', label: 'Expected annual return (%)', type: 'number', default: 10 },
            { id: 'years', label: 'Years until retirement', type: 'number', default: 30 },
            { id: 'currentCorpus', label: 'Current corpus (if any)', type: 'number', default: 0 }
        ],
        calculate: ({ monthly, rate, years, currentCorpus }) => {
            monthly = Number(monthly); let r = Number(rate) / 100; let t = Number(years); let current = Number(currentCorpus);
            const n = 12; const periods = n * t; const rmonthly = r / 12;
            const fvAnnuity = monthly * ((Math.pow(1 + rmonthly, periods) - 1) / rmonthly);
            const fvCurrent = current * Math.pow(1 + r, t);
            const totalCorpus = fvAnnuity + fvCurrent;
            const totalContributed = monthly * periods + current;
            const returns = totalCorpus - totalContributed;
            return { maturity: totalCorpus, total: totalContributed, interest: returns, steps: `Monthly contributions: ${fvAnnuity.toFixed(2)}, Current corpus growth: ${fvCurrent.toFixed(2)}, Total: ${totalCorpus.toFixed(2)}` }
        }
    },

    {
        id: 'ssy',
        title: 'Sukanya Samriddhi Yojana',
        category: 'Investments',
        description: 'Calculate maturity value for SSY account. SSY is a savings scheme for girl child with 15-year tenure and tax benefits.',
        formula: 'M = P × [((1 + r)^n − 1) / r] × (1 + r)',
        inputs: [
            { id: 'annual', label: 'Annual contribution', type: 'number', default: 150000 },
            { id: 'rate', label: 'SSY rate (%)', type: 'number', default: 8.2 },
            { id: 'years', label: 'Investment period (years)', type: 'number', default: 15 }
        ],
        calculate: ({ annual, rate, years }) => {
            annual = Number(annual); let r = Number(rate) / 100; let t = Number(years);
            let maturity = 0;
            for (let i = 0; i < t; i++) {
                maturity += annual * Math.pow(1 + r, t - i);
            }
            const total = annual * t;
            const interest = maturity - total;
            return { maturity, total, interest, steps: `SSY compounds annually. Sum of ${t} annual contributions: Maturity = ${maturity.toFixed(2)}` }
        }
    },

    // 2. Investment Calculations
    {
        id: 'cagr',
        title: 'CAGR (Compound Annual Growth Rate)',
        category: 'Financial',
        description: 'CAGR shows the mean annual growth rate of an investment over a period of years.',
        formula: 'CAGR = (Final/Initial)^{1/n} − 1',
        inputs: [{ id: 'initial', label: 'Initial value', type: 'number', default: 10000 }, { id: 'final', label: 'Final value', type: 'number', default: 20000 }, { id: 'years', label: 'Years', type: 'number', default: 3 }],
        calculate: ({ initial, final, years }) => { initial = Number(initial); final = Number(final); years = Number(years); const cagr = Math.pow(final / initial, 1 / years) - 1; return { cagr, steps: `CAGR = (${final}/${initial})^(1/${years}) - 1 = ${(cagr * 100).toFixed(2)}%` } }
    },

    {
        id: 'roi',
        title: 'Return on Investment (ROI)',
        category: 'Financial',
        description: 'Measure percentage gain on an investment.',
        formula: 'ROI = (Gain − Cost) / Cost × 100',
        inputs: [{ id: 'cost', label: 'Cost', type: 'number', default: 10000 }, { id: 'gain', label: 'Current/Final value', type: 'number', default: 15000 }],
        calculate: ({ cost, gain }) => { cost = Number(cost); gain = Number(gain); const roi = (gain - cost) / cost; return { roi, steps: `ROI = (${gain} - ${cost}) / ${cost} = ${(roi * 100).toFixed(2)}%` } }
    },

    {
        id: 'gratuity',
        title: 'Gratuity Calculator',
        category: 'Financial',
        description: 'Calculate gratuity amount based on last drawn salary and years of service. Formula: (Last salary × 15/26) × Years of service.',
        formula: 'Gratuity = (Last drawn salary × 15/26) × Years of service',
        inputs: [
            { id: 'lastSalary', label: 'Last drawn salary (monthly)', type: 'number', default: 50000 },
            { id: 'years', label: 'Years of service', type: 'number', default: 10 }
        ],
        calculate: ({ lastSalary, years }) => {
            let salary = Number(lastSalary); let y = Number(years);
            const gratuity = (salary * 15 / 26) * y;
            return { gratuity, steps: `Gratuity = (${salary} × 15/26) × ${y} = ${gratuity.toFixed(2)}` }
        }
    },

    {
        id: 'simple',
        title: 'Simple Interest',
        category: 'Financial',
        description: 'Calculate Simple Interest: SI = P × R × T',
        formula: 'SI = P × R × T',
        inputs: [{ id: 'p', label: 'Principal (P)', type: 'number', default: 10000 }, { id: 'r', label: 'Rate (%)', type: 'number', default: 5 }, { id: 't', label: 'Time (years)', type: 'number', default: 2 }],
        calculate: ({ p, r, t }) => { p = Number(p); r = Number(r) / 100; t = Number(t); const si = p * r * t; const total = p + si; return { si, total, steps: `SI = ${p} × ${r} × ${t} = ${si}` } }
    },

    {
        id: 'compound',
        title: 'Compound Interest',
        category: 'Financial',
        description: 'Compound Interest = P(1 + r/n)^{nt} − P',
        formula: 'A = P(1 + r/n)^{nt}',
        inputs: [{ id: 'p', label: 'Principal (P)', type: 'number', default: 10000 }, { id: 'r', label: 'Rate (%)', type: 'number', default: 6 }, { id: 't', label: 'Time (years)', type: 'number', default: 3 }, { id: 'n', label: 'Compounding per year', type: 'select', options: [{ v: 1, t: 'Yearly' }, { v: 2, t: 'Half-yearly' }, { v: 4, t: 'Quarterly' }, { v: 12, t: 'Monthly' }], default: 1 }],
        calculate: ({ p, r, t, n }) => { p = Number(p); r = Number(r) / 100; t = Number(t); n = Number(n); const A = p * Math.pow(1 + r / n, n * t); const ci = A - p; return { A, ci, steps: `A = ${p} × (1 + ${r}/${n})^{${n * t}} = ${A.toFixed(2)} (CI = ${ci.toFixed(2)})` } }
    },

    {
        id: 'inflation',
        title: 'Inflation Impact Calculator',
        category: 'Financial',
        description: "Find the real future value (purchasing power) after inflation.",
        formula: 'Real value = Nominal / (1+inflation)^years',
        inputs: [{ id: 'nominal', label: 'Nominal amount', type: 'number', default: 100000 }, { id: 'inflation', label: 'Annual inflation (%)', type: 'number', default: 5 }, { id: 'years', label: 'Years', type: 'number', default: 10 }],
        calculate: ({ nominal, inflation, years }) => { let N = Number(nominal); let i = Number(inflation) / 100; let y = Number(years); let real = N / Math.pow(1 + i, y); return { real, steps: `Real = ${N} / (1 + ${i})^{${y}} = ${real.toFixed(2)}` } }
    },

    // 3. Loan Calculations
    {
        id: 'emi',
        title: 'Loan EMI Calculator',
        category: 'Loans',
        description: 'Compute EMI, total paid and total interest for a fixed-rate loan.',
        formula: 'EMI = [P × r × (1+r)^n] / [(1+r)^n − 1]',
        inputs: [{ id: 'principal', label: 'Loan amount (P)', type: 'number', default: 500000 }, { id: 'annualRate', label: 'Annual rate (%)', type: 'number', default: 8.5 }, { id: 'years', label: 'Tenure (years)', type: 'number', default: 20 }],
        calculate: ({ principal, annualRate, years }) => { let P = Number(principal); let r = Number(annualRate) / 100 / 12; let n = Number(years) * 12; const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1); const total = emi * n; const interest = total - P; return { emi, total, interest, steps: `EMI = [${P} × ${r.toFixed(6)} × (1+${r.toFixed(6)})^{${n}}] / ... => EMI = ${emi.toFixed(2)}` } }
    },

    {
        id: 'loaninterest',
        title: 'Total Interest Calculator',
        category: 'Loans',
        description: 'Calculate total interest payable over the loan tenure for a given EMI and loan amount.',
        formula: 'Total Interest = (EMI × n) − Principal',
        inputs: [
            { id: 'principal', label: 'Loan amount', type: 'number', default: 500000 },
            { id: 'emi', label: 'EMI amount', type: 'number', default: 5000 },
            { id: 'years', label: 'Loan tenure (years)', type: 'number', default: 20 }
        ],
        calculate: ({ principal, emi, years }) => {
            let P = Number(principal); let e = Number(emi); let t = Number(years);
            const n = t * 12;
            const totalPaid = e * n;
            const interest = totalPaid - P;
            return { total: totalPaid, interest, emi: e, steps: `Total paid = ${e} × ${n} = ${totalPaid.toFixed(2)}, Interest = ${totalPaid.toFixed(2)} - ${P} = ${interest.toFixed(2)}` }
        }
    },

    {
        id: 'loancompare',
        title: 'Loan Comparison Calculator',
        category: 'Loans',
        description: 'Compare two loan offers side by side to see which is better in terms of EMI, total interest, and total amount payable.',
        formula: 'EMI = [P × r × (1+r)^n] / [(1+r)^n − 1]',
        inputs: [
            { id: 'principal1', label: 'Loan 1: Amount', type: 'number', default: 500000 },
            { id: 'rate1', label: 'Loan 1: Rate (%)', type: 'number', default: 8.5 },
            { id: 'years1', label: 'Loan 1: Tenure (years)', type: 'number', default: 20 },
            { id: 'principal2', label: 'Loan 2: Amount', type: 'number', default: 500000 },
            { id: 'rate2', label: 'Loan 2: Rate (%)', type: 'number', default: 9.0 },
            { id: 'years2', label: 'Loan 2: Tenure (years)', type: 'number', default: 20 }
        ],
        calculate: ({ principal1, rate1, years1, principal2, rate2, years2 }) => {
            let P1 = Number(principal1); let r1 = Number(rate1) / 100 / 12; let n1 = Number(years1) * 12;
            let P2 = Number(principal2); let r2 = Number(rate2) / 100 / 12; let n2 = Number(years2) * 12;
            const emi1 = (P1 * r1 * Math.pow(1 + r1, n1)) / (Math.pow(1 + r1, n1) - 1);
            const emi2 = (P2 * r2 * Math.pow(1 + r2, n2)) / (Math.pow(1 + r2, n2) - 1);
            const total1 = emi1 * n1; const total2 = emi2 * n2;
            const interest1 = total1 - P1; const interest2 = total2 - P2;
            const savings = Math.abs(total1 - total2);
            const better = total1 < total2 ? 'Loan 1' : 'Loan 2';
            return { emi1, emi2, total1, total2, interest1, interest2, savings, better, steps: `Loan 1: EMI ${emi1.toFixed(2)}, Total ${total1.toFixed(2)}. Loan 2: EMI ${emi2.toFixed(2)}, Total ${total2.toFixed(2)}. ${better} saves ${savings.toFixed(2)}` }
        }
    },

    // 4. Retirement Planning
    {
        id: 'retire',
        title: 'Retirement Savings Goal',
        category: 'Savings & Planning',
        description: 'Estimate monthly savings required to reach a retirement corpus considering expected return and inflation-adjusted target.',
        formula: 'Use FV and PMT approximations',
        inputs: [
            { id: 'currentAge', label: 'Current age', type: 'number', default: 30 },
            { id: 'retireAge', label: 'Retirement age', type: 'number', default: 60 },
            { id: 'targetCorpus', label: 'Target corpus (nominal)', type: 'number', default: 20000000 },
            { id: 'expReturn', label: 'Expected annual return (%)', type: 'number', default: 8 },
            { id: 'inflation', label: 'Inflation (%)', type: 'number', default: 5 }
        ],
        calculate: ({ currentAge, retireAge, targetCorpus, expReturn, inflation }) => {
            let now = Number(currentAge); let ret = Number(retireAge); let years = ret - now; let target = Number(targetCorpus); let r = Number(expReturn) / 100; let inf = Number(inflation) / 100;
            const n = years * 12; const rmonth = Math.pow(1 + r, 1 / 12) - 1;
            const futureTarget = target * Math.pow(1 + inf, years);
            const pmt = (futureTarget * rmonth) / (Math.pow(1 + rmonth, n) - 1);
            return {
                futureTarget, pmt, years, steps: `Future target = ${target} × (1+${inf})^{${years}} = ${futureTarget.toFixed(2)}
Monthly saving (PMT) ≈ ${pmt.toFixed(2)}`
            }
        }
    },

    {
        id: 'retiresavingsrate',
        title: 'Retirement Savings Rate Calculator',
        category: 'Savings & Planning',
        description: 'Calculate the required savings rate (percentage of income) to achieve your retirement goal.',
        formula: 'Savings Rate = (Required monthly savings / Monthly income) × 100',
        inputs: [
            { id: 'monthlyIncome', label: 'Monthly income', type: 'number', default: 100000 },
            { id: 'currentAge', label: 'Current age', type: 'number', default: 30 },
            { id: 'retireAge', label: 'Retirement age', type: 'number', default: 60 },
            { id: 'targetCorpus', label: 'Target corpus', type: 'number', default: 20000000 },
            { id: 'expReturn', label: 'Expected annual return (%)', type: 'number', default: 8 },
            { id: 'inflation', label: 'Inflation (%)', type: 'number', default: 5 }
        ],
        calculate: ({ monthlyIncome, currentAge, retireAge, targetCorpus, expReturn, inflation }) => {
            let income = Number(monthlyIncome); let now = Number(currentAge); let ret = Number(retireAge);
            let years = ret - now; let target = Number(targetCorpus); let r = Number(expReturn) / 100; let inf = Number(inflation) / 100;
            const n = years * 12; const rmonth = Math.pow(1 + r, 1 / 12) - 1;
            const futureTarget = target * Math.pow(1 + inf, years);
            const pmt = (futureTarget * rmonth) / (Math.pow(1 + rmonth, n) - 1);
            const savingsRate = (pmt / income) * 100;
            return { pmt, savingsRate, futureTarget, steps: `Required monthly savings: ${pmt.toFixed(2)}, Savings rate: ${savingsRate.toFixed(2)}% of income` }
        }
    },

    /* ========== NEW CALCULATORS Added ========== */

    // 1. Investments (Additional)
    {
        id: 'mf_return',
        title: 'Mutual Fund Returns',
        category: 'Investments',
        description: 'Calculate Absolute and Annualized returns for your mutual fund investments.',
        formula: 'Annualized = ((Current / Invested)^(1/years) - 1) * 100',
        inputs: [
            { id: 'invested', label: 'Invested Amount', type: 'number', default: 100000 },
            { id: 'current', label: 'Current Value', type: 'number', default: 150000 },
            { id: 'years', label: 'Investment Period (Years)', type: 'number', default: 3 }
        ],
        calculate: ({ invested, current, years }) => {
            let I = Number(invested); let C = Number(current); let t = Number(years);
            const absolute = ((C - I) / I) * 100;
            const annualized = (Math.pow(C / I, 1 / t) - 1) * 100;
            return {
                interest: C - I,
                maturity: C,
                steps: `Absolute Return: ((${C} - ${I}) / ${I}) * 100 = ${absolute.toFixed(2)}%\nAnnualized Return: ((${C}/${I})^(1/${t}) - 1) * 100 = ${annualized.toFixed(2)}%`
            };
        }
    },

    // 2. Financial (Additional)
    {
        id: 'xirr',
        title: 'SIP Returns (XIRR Estimates)',
        category: 'Financial',
        description: 'Estimate XIRR for a series of regular monthly payments. (Simplified approximation relative to specific dates).',
        formula: 'Uses Newton-Raphson approximation for internal rate of return.',
        inputs: [
            { id: 'amount', label: 'Monthly Investment', type: 'number', default: 5000 },
            { id: 'current', label: 'Current Value (Maturity)', type: 'number', default: 400000 },
            { id: 'years', label: 'Tenure (Years)', type: 'number', default: 5 }
        ],
        calculate: ({ amount, current, years }) => {
            let pmt = Number(amount); let fv = Number(current); let n = Number(years) * 12;
            // Guess rate
            let rate = 0.1; // 10%
            for (let i = 0; i < 50; i++) {
                // FV of annuity: P * ((1+r)^n - 1)/r
                // We need to find r such that FV_calc = fv
                // f(r) = P * ((1+r)^n - 1)/r - fv
                let r = rate / 12;
                let f_r = pmt * (Math.pow(1 + r, n) - 1) / r - fv;
                let df_r = pmt * ((n * r * Math.pow(1 + r, n - 1) - (Math.pow(1 + r, n) - 1)) / (r * r));
                let diff = f_r / df_r;
                rate = rate - diff * 12; // adjust annual rate
                if (Math.abs(diff) < 0.00001) break;
            }
            return {
                cagr: rate,
                steps: `Estimated XIRR: ${(rate * 100).toFixed(2)}% (Annualized)\nNote: This assumes regular monthly payments.`
            };
        }
    },

    {
        id: 'stock_return',
        title: 'Stocks Return Calculator',
        category: 'Financial',
        description: 'Calculate net profit/loss from stock trading including brokerage and taxes.',
        formula: 'Net = (Sell * Qty) - (Buy * Qty) - Taxes',
        inputs: [
            { id: 'buy', label: 'Buy Price', type: 'number', default: 100 },
            { id: 'sell', label: 'Sell Price', type: 'number', default: 120 },
            { id: 'qty', label: 'Quantity', type: 'number', default: 50 },
            { id: 'charges', label: 'Taxes & Charges (Total %)', type: 'number', default: 0.5 },
        ],
        calculate: ({ buy, sell, qty, charges }) => {
            let B = Number(buy); let S = Number(sell); let Q = Number(qty); let C = Number(charges) / 100;
            const buyVal = B * Q;
            const sellVal = S * Q;
            const turnOver = buyVal + sellVal;
            const tax = turnOver * C;
            const profit = sellVal - buyVal - tax;
            const roi = (profit / buyVal) * 100;
            return {
                interest: profit, // treating profit as "interest" for display
                total: sellVal - tax, // net receivable
                steps: `Buy Value: ${buyVal}, Sell Value: ${sellVal}\nCharges: ${tax.toFixed(2)}\nNet Profit: ${profit.toFixed(2)}\nROI: ${roi.toFixed(2)}%`
            }
        }
    },

    // 3. Loans (Additional)
    {
        id: 'loan_tenure',
        title: 'Loan Tenure Calculator',
        category: 'Loans',
        description: 'Calculate how long it will take to repay a loan given a fixed EMI.',
        formula: 'n = ln(EMI / (EMI - P*r)) / ln(1+r)',
        inputs: [
            { id: 'p', label: 'Loan Amount', type: 'number', default: 500000 },
            { id: 'emi', label: 'EMI Amount', type: 'number', default: 10000 },
            { id: 'r', label: 'Interest Rate (%)', type: 'number', default: 9 },
        ],
        calculate: ({ p, emi, r }) => {
            let P = Number(p); let E = Number(emi); let R = Number(r) / 100 / 12;
            if (E <= P * R) throw new Error("EMI must be greater than monthly interest.");
            const n = Math.log(E / (E - P * R)) / Math.log(1 + R);
            const years = n / 12;
            return {
                years: years,
                steps: `Number of months: ${Math.ceil(n)}\nYears: ${years.toFixed(2)}`
            };
        }
    },

    {
        id: 'prepayment',
        title: 'Loan Prepayment Impact',
        category: 'Loans',
        description: 'Check how much interest you save by making a lumpsum prepayment.',
        formula: 'Re-calculates tenure/balance after prepayment.',
        inputs: [
            { id: 'balance', label: 'Current Loan Balance', type: 'number', default: 1000000 },
            { id: 'rate', label: 'Interest Rate (%)', type: 'number', default: 8.5 },
            { id: 'emi', label: 'Current EMI', type: 'number', default: 12000 },
            { id: 'prepay', label: 'Prepayment Amount', type: 'number', default: 100000 }
        ],
        calculate: ({ balance, rate, emi, prepay }) => {
            let P = Number(balance); let R = Number(rate) / 100 / 12; let E = Number(emi); let Pre = Number(prepay);

            // Original remaining tenure
            const n_orig = Math.log(E / (E - P * R)) / Math.log(1 + R);
            const total_orig = n_orig * E;

            // New balance
            let P_new = P - Pre;
            // New tenure (keeping EMI same)
            const n_new = Math.log(E / (E - P_new * R)) / Math.log(1 + R);
            const total_new = n_new * E;

            const savings = total_orig - (total_new + Pre);

            return {
                interest: savings,
                steps: `Original Tenure: ${Math.ceil(n_orig)} months\nNew Tenure: ${Math.ceil(n_new)} months\nMonths Saved: ${Math.floor(n_orig - n_new)}\nInterest Saved: ${savings.toFixed(2)}`
            };
        }
    },

    // 4. Tax (Additional)
    {
        id: 'incometax',
        title: 'Income Tax Estimator (India FY 24-25)',
        category: 'Tax',
        description: 'Approximate tax calculation for New Regime FY 2024-25.',
        formula: 'Slab based calculation (New Regime)',
        inputs: [
            { id: 'income', label: 'Annual Income', type: 'number', default: 1200000 },
        ],
        calculate: ({ income }) => {
            let inc = Number(income);
            // Standard deduction
            let taxable = Math.max(0, inc - 75000);
            let tax = 0;

            if (taxable <= 0) tax = 0;
            else {
                // 0 - 3L: Nil
                let rem = taxable;
                // 3L - 7L: 5%
                if (rem > 300000) {
                    let slab = Math.min(rem, 700000) - 300000;
                    tax += slab * 0.05;
                }
                // 7L - 10L: 10%
                if (rem > 700000) {
                    let slab = Math.min(rem, 1000000) - 700000;
                    tax += slab * 0.10;
                }
                // 10L - 12L: 15%
                if (rem > 1000000) {
                    let slab = Math.min(rem, 1200000) - 1000000;
                    tax += slab * 0.15;
                }
                // 12L - 15L: 20%
                if (rem > 1200000) {
                    let slab = Math.min(rem, 1500000) - 1200000;
                    tax += slab * 0.20;
                }
                // > 15L: 30%
                if (rem > 1500000) {
                    let slab = rem - 1500000;
                    tax += slab * 0.30;
                }
            }

            // Rebate u/s 87A if taxable income <= 7L (Tax becomes 0)
            if (taxable <= 700000) tax = 0;

            // Cess 4%
            let cess = tax * 0.04;
            let totalTax = tax + cess;

            return {
                total: totalTax,
                steps: `Taxable Income (after 75k Std Ded): ${taxable}\nBase Tax: ${tax.toFixed(2)}\nCess (4%): ${cess.toFixed(2)}\nTotal Tax: ${totalTax.toFixed(2)}`
            };
        }
    },

    {
        id: 'gst',
        title: 'GST Calculator',
        category: 'Tax',
        description: 'Add or Remove GST from a given amount.',
        formula: 'Add: Amt * (1 + R), Remove: Amt / (1 + R)',
        inputs: [
            { id: 'amount', label: 'Amount', type: 'number', default: 1000 },
            { id: 'rate', label: 'GST Rate (%)', type: 'select', options: [{ v: 5, t: '5%' }, { v: 12, t: '12%' }, { v: 18, t: '18%' }, { v: 28, t: '28%' }], default: 18 },
            { id: 'type', label: 'Calculation Type', type: 'select', options: [{ v: 'add', t: 'Add GST' }, { v: 'remove', t: 'Remove GST' }], default: 'add' }
        ],
        calculate: ({ amount, rate, type }) => {
            const A = Number(amount); const R = Number(rate);
            let net = 0, gst = 0;
            if (type === 'add') {
                gst = A * (R / 100);
                net = A + gst;
            } else {
                net = A / (1 + R / 100);
                gst = A - net;
            }
            return {
                total: type === 'add' ? net : A,
                interest: gst,
                steps: `${type === 'add' ? 'Base' : 'Total'}: ${A}, Rate: ${R}%\nGST Amount: ${gst.toFixed(2)}\n${type === 'add' ? 'Total' : 'Base'}: ${(type === 'add' ? net : net).toFixed(2)}`
            };
        }
    },

    {
        id: 'tds',
        title: 'TDS Calculator',
        category: 'Tax',
        description: 'Calculate Amount Receivable after TDS deduction.',
        formula: 'Receivable = Amount - (Amount * TDS%)',
        inputs: [
            { id: 'amount', label: 'Gross Amount', type: 'number', default: 50000 },
            { id: 'rate', label: 'TDS Rate (%)', type: 'number', default: 10 },
        ],
        calculate: ({ amount, rate }) => {
            let A = Number(amount); let R = Number(rate) / 100;
            let tds = A * R;
            let net = A - tds;
            return {
                total: net,
                interest: tds,
                steps: `Gross: ${A}\nTDS (${rate}%): ${tds.toFixed(2)}\nNet Receivable: ${net.toFixed(2)}`
            };
        }
    },

    {
        id: 'capgains',
        title: 'Capital Gains Tax',
        category: 'Tax',
        description: 'Estimate STCG or LTCG on sale of assets.',
        formula: 'Gain = Sale - Buy. Tax = Gain * Rate.',
        inputs: [
            { id: 'buy', label: 'Buy Price', type: 'number', default: 100000 },
            { id: 'sell', label: 'Sell Price', type: 'number', default: 150000 },
            { id: 'type', label: 'Asset Type', type: 'select', options: [{ v: 'equity_ltcg', t: 'Equity LTCG (12.5%)' }, { v: 'equity_stcg', t: 'Equity STCG (20%)' }, { v: 'debt', t: 'Debt (Slab Rate)' }], default: 'equity_ltcg' },
            { id: 'slab', label: 'Tax Slab % (for Debt)', type: 'number', default: 30 }
        ],
        calculate: ({ buy, sell, type, slab }) => {
            let B = Number(buy); let S = Number(sell); let gain = S - B;
            let tax = 0;

            if (type === 'equity_ltcg') {
                let taxable = Math.max(0, gain - 125000);
                tax = taxable * 0.125;
            } else if (type === 'equity_stcg') {
                tax = Math.max(0, gain) * 0.20;
            } else {
                tax = Math.max(0, gain) * (Number(slab) / 100);
            }

            return {
                total: S - tax,
                interest: tax,
                steps: `Gain: ${gain}\nTaxable Gain: ${gain}\nTax Calculated: ${tax.toFixed(2)}\nPost-Tax Value: ${(S - tax).toFixed(2)}`
            };
        }
    },

    // 5. Savings & Planning (Additional)
    {
        id: 'emergency',
        title: 'Emergency Fund',
        category: 'Savings & Planning',
        description: 'Calculate recommended emergency fund size (6-12 months of expenses).',
        formula: 'Fund = Monthly Expenses * Months',
        inputs: [
            { id: 'expenses', label: 'Monthly Expenses', type: 'number', default: 30000 },
            { id: 'months', label: 'Months of Coverage', type: 'number', default: 6 }
        ],
        calculate: ({ expenses, months }) => {
            let E = Number(expenses); let M = Number(months);
            return {
                maturity: E * M,
                steps: `For ${M} months of security:\n${E} x ${M} = ${(E * M).toFixed(2)}`
            };
        }
    },

    {
        id: 'budget',
        title: 'Monthly Budget (50-30-20)',
        category: 'Savings & Planning',
        description: 'Split income into Needs (50%), Wants (30%), and Savings (20%).',
        formula: 'Needs: 50%, Wants: 30%, Savings: 20%',
        inputs: [
            { id: 'income', label: 'Monthly Income', type: 'number', default: 50000 }
        ],
        calculate: ({ income }) => {
            let I = Number(income);
            return {
                steps: `Needs (50%): ${formatCurrency(I * 0.5)}\nWants (30%): ${formatCurrency(I * 0.3)}\nSavings (20%): ${formatCurrency(I * 0.2)}`
            };
        }
    },

    {
        id: 'fire',
        title: 'FIRE Calculator',
        category: 'Savings & Planning',
        description: 'Financial Independence, Retire Early - Estimate corpus needed.',
        formula: 'Corpus = Annual Expenses * 25 (Rule of 25)',
        inputs: [
            { id: 'expenses', label: 'Monthly Expenses', type: 'number', default: 50000 },
            { id: 'age', label: 'Current Age', type: 'number', default: 30 },
            { id: 'withdraw', label: 'Safe Withdrawal Rate (%)', type: 'number', default: 4 }
        ],
        calculate: ({ expenses, withdraw }) => {
            let E = Number(expenses) * 12; // Annual
            let R = Number(withdraw) / 100;
            let corpus = E / R;
            return {
                maturity: corpus,
                steps: `Annual Expenses: ${E}\nRecommended Corpus (Rule of ${100 / Number(withdraw)}): ${corpus.toFixed(2)}`
            };
        }
    },

    {
        id: 'split',
        title: 'Expense Splitter',
        category: 'Savings & Planning',
        description: 'Split a total bill amount equally among people.',
        formula: 'Per Person = Total / People',
        inputs: [
            { id: 'total', label: 'Total Amount', type: 'number', default: 2500 },
            { id: 'people', label: 'Number of People', type: 'number', default: 4 }
        ],
        calculate: ({ total, people }) => {
            return {
                steps: `Per Person Share: ${formatCurrency(Number(total) / Number(people))}`
            };
        }
    }
];

/* ========== End of CALCULATORS array ========== */

// Utility functions
const q = s => document.querySelector(s);
const formatCurrency = v => isNaN(v) ? '₹0' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

// Derive categories from CALCULATORS
// Note: We need to wait for CALCULATORS to be populated if imports were async, but here it's sync.
// We will fill CALCULATORS via subsequent edits.

const categoryTabs = q('#categoryTabs');
const subGrid = q('#subCategoryGrid');
const contentArea = q('#content');
const calculatorView = q('#calculatorView');
const homeBtn = q('#homeBtn');
const searchSide = q('#searchBoxSide');

let activeCategory = 'All';

function renderCategoryTabs() {
    categoryTabs.innerHTML = '';
    const allTab = document.createElement('button'); allTab.className = 'tab active'; allTab.textContent = 'All'; allTab.onclick = () => selectCategory('All'); categoryTabs.appendChild(allTab);
    // Re-derive categories here to ensure we have latest data
    const CATEGORIES = Array.from(new Set(CALCULATORS.map(c => c.category))).sort();
    CATEGORIES.forEach(cat => {
        const b = document.createElement('button'); b.className = 'tab'; b.textContent = cat; b.onclick = () => selectCategory(cat); categoryTabs.appendChild(b);
    });
}

function selectCategory(cat) {
    activeCategory = cat;
    Array.from(categoryTabs.children).forEach(ch => ch.classList.toggle('active', ch.textContent === cat));
    renderSubCategoryGrid(cat);
    // ensure calculator view hidden and home area visible
    calculatorView.classList.remove('active');
    q('#categoryArea').style.display = 'block';
}

function renderSubCategoryGrid(category) {
    subGrid.innerHTML = '';
    const filtered = CALCULATORS.filter(c => category === 'All' ? true : c.category === category);
    filtered.forEach(calc => {
        const card = document.createElement('div'); card.className = 'card';
        card.innerHTML = `<h4>${calc.title}</h4><p>${calc.description}</p>`;
        card.onclick = () => openCalculator(calc.id);
        subGrid.appendChild(card);
    });
}

// Open calculator: render calculator view and preserve logic
function openCalculator(id) {
    const calc = CALCULATORS.find(c => c.id === id);
    if (!calc) return;
    // hide home area
    q('#categoryArea').style.display = 'none';
    calculatorView.classList.add('active');

    calculatorView.innerHTML = `
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
    <div style="display:flex;gap:8px;align-items:center">
      <button id="backBtn" class="back"><i data-feather="chevron-left"></i> Back</button>
      <h2 style="margin:0">${calc.title}</h2>
    </div>
    <div style="color:var(--muted)">${calc.category}</div>
  </div>
  <div class="calc-wrap">
    <div>
      <div class="calc-panel card">
        <h3 style="margin-top:0">${calc.title}</h3>
        <p style="color:var(--muted)">${calc.description}</p>
        <div class="formula" style="margin-top:12px"><strong>Formula</strong><div style="margin-top:8px;font-family:monospace">${calc.formula}</div></div>
        <form id="calcForm" style="margin-top:16px" onsubmit="return false"></form>
      </div>
    </div>
    <div>
      <div class="calc-panel card result" style="margin-bottom:12px">
        <h4 style="margin-top:0">Result</h4>
        <div id="resultContent">Enter values & click Calculate</div>
        <div id="chartContainer" style="display:none;margin-top:12px;height:220px"><canvas id="resultChart"></canvas></div>
      </div>
      <div class="calc-panel card">
        <h4 style="margin-top:0">Step-by-step</h4>
        <div id="stepsBox" class="steps">-</div>
      </div>
    </div>
  </div>
`;
    feather.replace();

    const form = q('#calcForm');
    // render inputs (preserve original inputs and defaults)
    calc.inputs.forEach(inp => {
        const row = document.createElement('div'); row.className = 'row';
        const label = document.createElement('label'); label.textContent = inp.label;
        let control;
        if (inp.type === 'select') {
            control = document.createElement('select'); control.name = inp.id;
            (inp.options || []).forEach(o => { const opt = document.createElement('option'); opt.value = o.v; opt.textContent = o.t; if (inp.default == o.v) opt.selected = true; control.appendChild(opt); });
        } else {
            control = document.createElement('input'); control.type = inp.type || 'number'; control.name = inp.id; control.value = inp.default ?? ''; control.placeholder = inp.placeholder || '';
        }
        row.appendChild(label); row.appendChild(control); form.appendChild(row);
    });

    // buttons
    const ctrl = document.createElement('div'); ctrl.className = 'controls';
    const calcBtn = document.createElement('button'); calcBtn.className = 'btn'; calcBtn.type = 'button'; calcBtn.textContent = 'Calculate';
    const resetBtn = document.createElement('button'); resetBtn.className = 'btn btn-muted'; resetBtn.type = 'button'; resetBtn.textContent = 'Reset';
    ctrl.appendChild(calcBtn); ctrl.appendChild(resetBtn); form.appendChild(ctrl);

    // Back button
    q('#backBtn').addEventListener('click', () => { calculatorView.classList.remove('active'); q('#categoryArea').style.display = 'block'; });

    // Calculate handler — uses existing calc.calculate()
    calcBtn.addEventListener('click', () => {
        const data = {}; new FormData(form).forEach((v, k) => data[k] = v);
        try {
            const out = calc.calculate(data);
            displayResult(out, calc);
        } catch (e) { q('#resultContent').innerHTML = `<div style="color:var(--danger)">Error: ${e.message}</div>` }
    });

    resetBtn.addEventListener('click', () => {
        form.reset(); q('#resultContent').textContent = 'Enter values & click Calculate'; q('#stepsBox').textContent = '-'; q('#chartContainer').style.display = 'none'; if (window.currentChart) { window.currentChart.destroy(); window.currentChart = null; }
    });
}

function displayResult(out, calc) {
    const box = q('#resultContent'); const steps = q('#stepsBox');
    let html = '';
    // Main values (FV, Maturity, Balance, etc.)
    if (out.fv || out.maturity || out.A || out.balance !== undefined || out.real !== undefined) {
        const main = out.fv || out.maturity || out.A || out.balance || out.real;
        html += `<div class="big">${formatCurrency(Math.round(main || 0))}</div>`;
        if (out.totalInvested !== undefined) html += `<div style="margin-top:6px">Total Invested: ${formatCurrency(Math.round(out.totalInvested))}</div>`;
        if (out.interest !== undefined) html += `<div>${calc.category === 'Tax' ? 'Amount' : (calc.category === 'Loans' ? 'Interest Saved' : 'Gain')}: ${formatCurrency(Math.round(out.interest))}</div>`;
    }

    // EMI / Loans
    if (out.emi) {
        html += `<div class="big">${formatCurrency(Math.round(out.emi))}<div style="font-size:12px;color:var(--muted)">/month</div></div>`;
        if (out.total) html += `<div>Total Payable: ${formatCurrency(Math.round(out.total))}</div>`;
        if (out.interest) html += `<div>Interest: ${formatCurrency(Math.round(out.interest))}</div>`;
    }

    // Retirement / PMT
    if (out.pmt) { html += `<div class="big">${formatCurrency(Math.round(out.pmt))}<div style="font-size:12px;color:var(--muted)">/month</div></div>`; if (out.savingsRate) html += `<div>Required savings rate: <strong>${out.savingsRate.toFixed(1)}%</strong></div>` }

    // Years / Tenure
    if (out.years !== undefined && !out.fv && !out.maturity) {
        html += `<div class="big">${out.years.toFixed(1)} <span style="font-size:16px">Years</span></div>`;
    }

    // Generic Total (Tax, etc) where not covered above
    if (out.total !== undefined && !out.emi && !out.maturity && !out.fv && !out.A && !out.balance) {
        html += `<div class="big">${formatCurrency(Math.round(out.total))}</div>`;
        if (out.interest) html += `<div>${calc.category === 'Tax' ? 'Tax/GST/TDS Amount' : 'Interest/Gain'}: ${formatCurrency(Math.round(out.interest))}</div>`;
    }

    // Percentages
    if (out.cagr !== undefined) html += `<div>CAGR/XIRR: <strong>${(out.cagr * 100).toFixed(2)}%</strong></div>`;
    if (out.roi !== undefined) html += `<div>ROI: <strong>${(out.roi * 100).toFixed(2)}%</strong></div>`;

    // Fallback: if html is still empty but we have steps, show "See details below" or just the JSON wrapped
    if (!html && out.steps && Object.keys(out).length === 1) {
        html += `<div>See step-by-step details</div>`;
    }

    box.innerHTML = html || `<pre style="font-size:13px;white-space:pre-wrap;word-break:break-word">${JSON.stringify(out, null, 2)}</pre>`;
    steps.textContent = out.steps || '-';

    // Charts logic
    const chartContainer = q('#chartContainer');
    if (window.currentChart) { window.currentChart.destroy(); window.currentChart = null; }

    let labels = [], data = [], colors = [];

    // 1. Investments Strategy (Invested vs Returns)
    if (['sip', 'lumpsum', 'rd', 'ppf', 'nps', 'ssy', 'mf_return', 'fd', 'simple', 'compound', 'stock_return'].includes(calc.id)) {
        if (out.totalInvested !== undefined && (out.fv || out.maturity || out.tot)) {
            // Standard investment types
            const inv = out.totalInvested;
            const ret = (out.fv || out.maturity || out.tot) - inv;
            labels = ['Invested', 'Returns'];
            data = [Math.round(inv), Math.round(ret)];
            colors = ['#64748b', '#a78bfa'];
        } else if (calc.id === 'simple' || calc.id === 'compound') {
            // Simple/Compound Interest
            // Formula inputs are p (principal). Result is A (amount) or total.
            // However, my SI/CI calculators return {si, total} or {A, ci}. 
            // Need to infer Principal.
            if (out.si && out.total) { // Simple
                const p = out.total - out.si;
                labels = ['Principal', 'Interest'];
                data = [Math.round(p), Math.round(out.si)];
                colors = ['#64748b', '#a78bfa'];
            } else if (out.A && out.ci) { // Compound
                const p = out.A - out.ci;
                labels = ['Principal', 'Interest'];
                data = [Math.round(p), Math.round(out.ci)];
                colors = ['#64748b', '#a78bfa'];
            }
        } else if (calc.id === 'stock_return' && out.total && out.interest) {
            const net = out.total; // Sell - Tax
            const profit = out.interest;
            // Profit = Sell - Buy - Tax. Total = Sell - Tax. 
            // So Buy = Total - Profit.
            const buy = net - profit;
            labels = ['Invested', 'Net Profit'];
            data = [Math.round(buy), Math.round(profit)];
            colors = ['#64748b', '#10b981']; // Green for profit
        } else if (out.maturity && out.interest) {
            // Generic fallback for others like FD/SSY
            const ret = out.interest;
            const inv = out.maturity - out.interest;
            labels = ['Invested', 'Returns'];
            data = [Math.round(inv), Math.round(ret)];
            colors = ['#64748b', '#a78bfa'];
        }
    }
    // 2. Loans Strategy (Principal vs Interest)
    else if (['emi', 'loaninterest', 'loan_tenure', 'prepayment'].includes(calc.id)) {
        if (out.total && out.interest) {
            const p = out.total - out.interest;
            labels = ['Principal', 'Interest'];
            data = [Math.round(p), Math.round(out.interest)];
            colors = ['#64748b', '#ef4444']; // Red for interest
        }
    }
    // 3. Tax Strategy (Net vs Tax)
    else if (['incometax', 'gst', 'tds', 'capgains'].includes(calc.id)) {
        if (out.total && out.interest) {
            // For tax calc, 'total' is Total Tax (incometax) or Total Value (gst/tds).
            // income tax: out.total is Tax. We don't have income in output. But we can't show chart without income.
            // gst: out.total is Net or Gross. out.interest is GST.
            // tds: out.total is Net Receivable. out.interest is TDS.
            // Let's handle specifically.
            if (calc.id === 'incometax') {
                // We can't chart specific income if we don't pass it back or parse it. 
                // But let's skip income tax for now unless we modify the calc to return income.
                // Wait, I can't modify calc here easily.
            } else {
                // GST/TDS/CapGains: out.total is usually the "Final Amount" or similar.
                // If GST Add: Total = Base + GST. Chart: Base vs GST.
                // If GST Remove: Total = Base (which was input). Chart: Net vs GST.
                // Actually my GST calc returns {total: (net or gross), interest: gst}.
                // If Add: total is (Base+GST). Interest is GST. So Base = Total - Interest.
                // If Remove: total is (Original). Interest is GST. wait.
                // GST logic: return { total: (type=='add'?net:A), interest: gst }.
                // If add: total=118, interest=18. Base=100.
                // If remove: total=118, interest=18. Base=100. (Wait, let's look at my code).
                // Code: total: type==='add' ? net : A.
                // If Remove, A is the total (118). GST is 18. Net is 100.
                // consistently: Total Value = Base + Tax. 
                // data[0] = Total - Interest (Base/Net). data[1] = Interest (Tax).
                const tax = out.interest;
                const base = out.total - tax;
                labels = [calc.id === 'tds' ? 'Net Amount' : 'Base Amount', 'Tax/GST'];
                data = [Math.round(base), Math.round(tax)];
                colors = ['#64748b', '#f59e0b']; // Orange for tax
            }
        }
    }
    // 4. Budget Strategy (Needs/Wants/Savings)
    else if (calc.id === 'budget' && out.steps) {
        // Parse from steps? No, better to have raw values. 
        // But I didn't return raw values in 'budget' calculator, only steps string. 
        // I should stick to what I have. 
        // If I can't get data, I won't draw chart.
        // Wait, I can quickly patch the 'budget' calculator in the SAME file if I want, 
        // but modifying `displayResult` is safer. 
        // Actually, let's parse the string if needed or just skip budget for now.
        // "Needs (50%): ₹25,000"
        // Let's leave budget for now or try to parse numbers.
    }

    if (data.length > 0 && !data.some(isNaN)) {
        chartContainer.style.display = 'block';
        drawChart(labels, data, colors);
    } else {
        chartContainer.style.display = 'none';
    }
}

function drawChart(labels, data, colors) {
    const ctx = q('#resultChart').getContext('2d');
    window.currentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderColor: '#0f172a',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: varColor()
                    }
                },
                tooltip: {
                    callbacks: {
                        label: ctx => `${ctx.label}: ${formatCurrency(ctx.parsed)}`
                    }
                }
            },
            cutout: '70%'
        }
    });
}

function varColor() { return '#e2e8f0'; }

// Initial render: tabs and grid
function init() { renderCategoryTabs(); selectCategory('All'); if (window.feather) feather.replace(); }
init();

// Hook: search in sidebar
searchSide.addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    // filter cards
    const filtered = CALCULATORS.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));
    subGrid.innerHTML = '';
    filtered.forEach(calc => { const card = document.createElement('div'); card.className = 'card'; card.innerHTML = `<h4>${calc.title}</h4><p>${calc.description}</p>`; card.onclick = () => openCalculator(calc.id); subGrid.appendChild(card); });
});

// Home button behavior: show home area
q('#homeBtn').addEventListener('click', () => { calculatorView.classList.remove('active'); q('#categoryArea').style.display = 'block'; });
