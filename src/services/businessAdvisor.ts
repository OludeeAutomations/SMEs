import type { WorkspaceData } from '@/store/businessStore';
import { formatMoney } from '@/utils/format';

export interface BusinessAdvice {
  title: string;
  answer: string;
  insights: string[];
  actions: string[];
  dataNote?: string;
}

type ProductPerformance = {
  productId: string;
  name: string;
  quantity: number;
  revenue: number;
};

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);
const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const includesAny = (question: string, words: string[]) => words.some((word) => question.includes(word));
const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
const previousMonthKey = (date: Date) => monthKey(new Date(date.getFullYear(), date.getMonth() - 1, 1));

function productPerformance(workspace: WorkspaceData, sales = workspace.sales): ProductPerformance[] {
  const performance = new Map<string, ProductPerformance>();
  for (const sale of sales) {
    for (const item of sale.items) {
      const key = item.productId || normalize(item.productName);
      const current = performance.get(key) ?? { productId: item.productId, name: item.productName, quantity: 0, revenue: 0 };
      current.quantity += item.quantity;
      current.revenue += item.quantity * item.price;
      performance.set(key, current);
    }
  }
  return [...performance.values()].sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue);
}

function estimatedCostOfSales(workspace: WorkspaceData, sales: WorkspaceData['sales']) {
  let cost = 0;
  let knownItems = 0;
  let allItems = 0;
  for (const sale of sales) {
    for (const item of sale.items) {
      allItems += 1;
      const product = workspace.products.find((candidate) => candidate.id === item.productId)
        ?? workspace.products.find((candidate) => normalize(candidate.name) === normalize(item.productName));
      if (product) {
        cost += product.costPrice * item.quantity;
        knownItems += 1;
      }
    }
  }
  return { cost, knownItems, allItems };
}

function changeText(current: number, previous: number) {
  if (!previous && !current) return 'No revenue was recorded in either month.';
  if (!previous) return 'This is the first month with recorded revenue.';
  const change = ((current - previous) / previous) * 100;
  return `Revenue is ${Math.abs(change).toFixed(0)}% ${change >= 0 ? 'higher' : 'lower'} than last month.`;
}

export function getBusinessAdvice(question: string, workspace: WorkspaceData, currency = 'NGN'): BusinessAdvice {
  const query = normalize(question);
  const now = new Date();
  const currentMonth = monthKey(now);
  const lastMonth = previousMonthKey(now);
  const currentSales = workspace.sales.filter((sale) => sale.createdAt.startsWith(currentMonth));
  const previousSales = workspace.sales.filter((sale) => sale.createdAt.startsWith(lastMonth));
  const currentExpenses = workspace.expenses.filter((expense) => expense.date.startsWith(currentMonth));
  const previousExpenses = workspace.expenses.filter((expense) => expense.date.startsWith(lastMonth));
  const revenue = sum(currentSales.map((sale) => sale.total));
  const previousRevenue = sum(previousSales.map((sale) => sale.total));
  const expenses = sum(currentExpenses.map((expense) => expense.amount));
  const previousExpenseTotal = sum(previousExpenses.map((expense) => expense.amount));
  const costOfSales = estimatedCostOfSales(workspace, currentSales);
  const estimatedProfit = revenue - expenses - costOfSales.cost;
  const margin = revenue > 0 ? (estimatedProfit / revenue) * 100 : 0;
  const unpaid = workspace.invoices.filter((invoice) => invoice.status !== 'PAID');
  const overdue = workspace.invoices.filter((invoice) => invoice.status === 'OVERDUE' || (invoice.status !== 'PAID' && new Date(invoice.dueDate) < now));
  const receivables = sum(unpaid.map((invoice) => invoice.total));
  const lowStock = workspace.products.filter((product) => product.stockQuantity <= product.lowStockThreshold);
  const outOfStock = workspace.products.filter((product) => product.stockQuantity <= 0);
  const recentCutoff = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const recentSales = workspace.sales.filter((sale) => new Date(sale.createdAt) >= recentCutoff);
  const recentPerformance = productPerformance(workspace, recentSales);
  const currentPerformance = productPerformance(workspace, currentSales);
  const allPerformance = productPerformance(workspace);
  const soldRecently = new Set(recentPerformance.map((item) => item.productId));
  const slowStock = workspace.products.filter((product) => product.stockQuantity > product.lowStockThreshold && !soldRecently.has(product.id));
  const slowStockValue = sum(slowStock.map((product) => product.stockQuantity * product.costPrice));
  const topProduct = currentPerformance[0] ?? allPerformance[0];
  const topCustomer = [...workspace.customers].sort((a, b) => b.totalBought - a.totalBought)[0];
  const expenseByCategory = new Map<string, number>();
  currentExpenses.forEach((expense) => expenseByCategory.set(expense.category, (expenseByCategory.get(expense.category) ?? 0) + expense.amount));
  const topExpense = [...expenseByCategory.entries()].sort((a, b) => b[1] - a[1])[0];

  const namedProduct = workspace.products.find((product) => query.includes(normalize(product.name)));
  if (namedProduct) {
    const performance = allPerformance.find((item) => item.productId === namedProduct.id);
    const unitMargin = namedProduct.sellingPrice - namedProduct.costPrice;
    const reorder = Math.max(0, namedProduct.lowStockThreshold * 2 - namedProduct.stockQuantity);
    return {
      title: namedProduct.name,
      answer: `${namedProduct.name} has ${namedProduct.stockQuantity} units in stock. Recorded sales are ${performance?.quantity ?? 0} units worth ${formatMoney(performance?.revenue ?? 0, currency)}.`,
      insights: [
        `Unit margin is ${formatMoney(unitMargin, currency)} (${namedProduct.sellingPrice > 0 ? ((unitMargin / namedProduct.sellingPrice) * 100).toFixed(0) : 0}% of selling price).`,
        namedProduct.stockQuantity <= namedProduct.lowStockThreshold ? `Stock is at or below its ${namedProduct.lowStockThreshold}-unit alert level.` : `Stock is above its ${namedProduct.lowStockThreshold}-unit alert level.`,
      ],
      actions: reorder > 0
        ? [`Reorder about ${reorder} units to reach twice the alert level.`, 'Confirm recent customer demand before placing the order.']
        : ['Keep monitoring sales velocity before adding more stock.', 'Review the selling price if the margin does not cover operating costs.'],
    };
  }

  const namedCustomer = workspace.customers.find((customer) => query.includes(normalize(customer.fullName)));
  if (namedCustomer) {
    const customerSales = workspace.sales.filter((sale) => sale.customerId === namedCustomer.id);
    return {
      title: namedCustomer.fullName,
      answer: `${namedCustomer.fullName} has made ${customerSales.length} recorded ${customerSales.length === 1 ? 'purchase' : 'purchases'} worth ${formatMoney(namedCustomer.totalBought, currency)}.`,
      insights: [namedCustomer.amountOwed > 0 ? `Outstanding balance is ${formatMoney(namedCustomer.amountOwed, currency)}.` : 'There is no outstanding balance.'],
      actions: namedCustomer.amountOwed > 0 ? ['Follow up politely with the related invoice and due date.', 'Avoid extending more credit until the balance is reduced.'] : ['Consider a loyalty offer based on purchase history.'],
    };
  }

  if (includesAny(query, ['stock', 'inventory', 'reorder', 'restock', 'product', 'sell fast', 'best seller', 'slow moving', 'dead stock'])) {
    const productLabel = (product: WorkspaceData['products'][number]) => {
      const duplicateName = workspace.products.some((candidate) => candidate.id !== product.id && normalize(candidate.name) === normalize(product.name));
      return duplicateName ? `${product.name} (${formatMoney(product.sellingPrice, currency)})` : product.name;
    };
    const priority = lowStock
      .map((product) => {
        const demand = recentPerformance.find((item) => item.productId === product.id)?.quantity ?? 0;
        return { product, demand, reorder: Math.max(1, Math.ceil(demand / 2) + product.lowStockThreshold - product.stockQuantity) };
      })
      .sort((a, b) => b.demand - a.demand || a.product.stockQuantity - b.product.stockQuantity);
    return {
      title: 'Stock recommendation',
      answer: outOfStock.length
        ? `${outOfStock.length} ${outOfStock.length === 1 ? 'product is' : 'products are'} out of stock and ${lowStock.length} ${lowStock.length === 1 ? 'item needs' : 'items need'} attention.`
        : lowStock.length ? `${lowStock.length} ${lowStock.length === 1 ? 'product is' : 'products are'} at or below the low-stock level.` : 'No product is currently below its stock alert level.',
      insights: [
        topProduct ? `${topProduct.name} is the leading recorded seller (${topProduct.quantity} units, ${formatMoney(topProduct.revenue, currency)}).` : 'There is not enough sales history to identify a best seller.',
        slowStock.length ? `${slowStock.length} stocked ${slowStock.length === 1 ? 'product has' : 'products have'} no recorded sale in 60 days, tying up about ${formatMoney(slowStockValue, currency)} at cost.` : 'No obvious slow-moving stock was found.',
      ],
      actions: priority.length
        ? priority.slice(0, 3).map(({ product, reorder }) => `Reorder about ${reorder} units of ${productLabel(product)}; current stock is ${product.stockQuantity}.`)
        : slowStock.length ? [`Pause reordering ${productLabel(slowStock[0])} and consider a promotion or bundle.`] : ['Keep recording sales so reorder advice becomes more precise.'],
      dataNote: 'Reorder quantities use recorded 60-day demand and each product’s alert level.',
    };
  }

  if (includesAny(query, ['profit', 'margin', 'revenue', 'sales', 'performance', 'doing', 'growth', 'cash flow', 'cashflow'])) {
    return {
      title: 'Business performance',
      answer: `This month has ${formatMoney(revenue, currency)} revenue from ${currentSales.length} ${currentSales.length === 1 ? 'sale' : 'sales'} and estimated profit of ${formatMoney(estimatedProfit, currency)}.`,
      insights: [
        changeText(revenue, previousRevenue),
        `Recorded operating expenses are ${formatMoney(expenses, currency)} and estimated cost of sold stock is ${formatMoney(costOfSales.cost, currency)}.`,
        revenue ? `Estimated net margin is ${margin.toFixed(0)}%.` : 'There is no recorded revenue this month.',
      ],
      actions: estimatedProfit < 0
        ? ['Review the largest expense categories before spending more.', 'Prioritize high-margin products and follow up unpaid invoices.']
        : [topProduct ? `Protect availability of ${topProduct.name}, your leading recorded product.` : 'Record each sale and product cost to improve profit analysis.', receivables > 0 ? `Collect ${formatMoney(receivables, currency)} in unpaid invoices to strengthen cash flow.` : 'Keep expenses within the current revenue level.'],
      dataNote: costOfSales.allItems && costOfSales.knownItems < costOfSales.allItems ? 'Profit is an estimate because some sold items do not have a matching product cost.' : undefined,
    };
  }

  if (includesAny(query, ['invoice', 'owe', 'owed', 'debt', 'debtor', 'receivable', 'payment', 'collect'])) {
    return {
      title: 'Money to collect',
      answer: `${unpaid.length} unpaid ${unpaid.length === 1 ? 'invoice totals' : 'invoices total'} ${formatMoney(receivables, currency)}.`,
      insights: [
        overdue.length ? `${overdue.length} ${overdue.length === 1 ? 'invoice is' : 'invoices are'} overdue, worth ${formatMoney(sum(overdue.map((invoice) => invoice.total)), currency)}.` : 'No unpaid invoice is currently overdue.',
        topCustomer ? `${topCustomer.fullName} is the highest-value recorded customer at ${formatMoney(topCustomer.totalBought, currency)}.` : 'There is not enough customer history yet.',
      ],
      actions: overdue.length
        ? overdue.slice(0, 3).map((invoice) => `Follow up ${invoice.customerName} about ${formatMoney(invoice.total, currency)} due ${new Date(invoice.dueDate).toLocaleDateString('en-NG')}.`)
        : unpaid.length ? ['Send reminders before the nearest due dates.', 'Confirm each payment promptly so balances stay accurate.'] : ['Set clear payment terms on new invoices.'],
    };
  }

  if (includesAny(query, ['expense', 'spending', 'cost', 'cut', 'save money'])) {
    const expenseChange = previousExpenseTotal > 0 ? ((expenses - previousExpenseTotal) / previousExpenseTotal) * 100 : null;
    return {
      title: 'Expense review',
      answer: `This month’s recorded expenses are ${formatMoney(expenses, currency)} across ${currentExpenses.length} entries.`,
      insights: [
        topExpense ? `${topExpense[0]} is the largest category at ${formatMoney(topExpense[1], currency)}.` : 'No expense category has been recorded this month.',
        expenseChange === null ? 'There is not enough previous-month data for a spending comparison.' : `Spending is ${Math.abs(expenseChange).toFixed(0)}% ${expenseChange >= 0 ? 'higher' : 'lower'} than last month.`,
      ],
      actions: topExpense ? [`Review every ${topExpense[0]} expense and remove costs that do not support sales.`, 'Set a monthly limit for the largest category.'] : ['Record all operating costs to get useful savings recommendations.'],
    };
  }

  if (includesAny(query, ['customer', 'loyal', 'best customer', 'top customer'])) {
    return {
      title: 'Customer insight',
      answer: topCustomer ? `${topCustomer.fullName} is the highest-value recorded customer with ${formatMoney(topCustomer.totalBought, currency)} in purchases.` : 'There is not enough customer purchase history yet.',
      insights: [`${workspace.customers.length} customers are saved.`, `${workspace.customers.filter((customer) => customer.amountOwed > 0).length} have an outstanding balance.`],
      actions: topCustomer ? ['Thank high-value customers and offer a relevant repeat-purchase incentive.', 'Follow up customers with balances before extending more credit.'] : ['Attach customers to sales so Ease can identify loyal and at-risk customers.'],
    };
  }

  const priorities: string[] = [];
  if (overdue.length) priorities.push(`Collect ${formatMoney(sum(overdue.map((invoice) => invoice.total)), currency)} from ${overdue.length} overdue ${overdue.length === 1 ? 'invoice' : 'invoices'}.`);
  if (outOfStock.length) priorities.push(`Restock ${outOfStock.slice(0, 2).map((product) => product.name).join(' and ')}; they are out of stock.`);
  else if (lowStock.length) priorities.push(`Review low stock, starting with ${lowStock[0].name}.`);
  if (estimatedProfit < 0) priorities.push(`Reduce spending or improve product margins; estimated monthly profit is ${formatMoney(estimatedProfit, currency)}.`);
  if (slowStock.length) priorities.push(`Avoid buying more ${slowStock[0].name} until existing stock moves.`);
  if (!priorities.length) priorities.push(topProduct ? `Keep ${topProduct.name} available and build on its recorded demand.` : 'Record more sales and expenses to unlock stronger recommendations.');

  return {
    title: 'What to focus on now',
    answer: `Revenue this month is ${formatMoney(revenue, currency)}, estimated profit is ${formatMoney(estimatedProfit, currency)}, and ${formatMoney(receivables, currency)} is still unpaid.`,
    insights: [changeText(revenue, previousRevenue), `${lowStock.length} low-stock items and ${overdue.length} overdue invoices need attention.`],
    actions: priorities.slice(0, 3),
    dataNote: 'Advice is based only on transactions and stock recorded in Ease.',
  };
}
