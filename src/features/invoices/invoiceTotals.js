export function invoiceTotals(invoice) {
  const paid =
    invoice.payments.reduce(
      (sum, p) =>
        sum + (p.is_refund ? -1 : 1) * Math.round(Number(p.amount) * 100),
      0,
    ) / 100;
  const returned =
    invoice.returns.reduce(
      (sum, r) => sum + Math.round(Number(r.amount) * 100),
      0,
    ) / 100;
  const due =
    invoice.status === "cancelled"
      ? 0
      : Math.round((Number(invoice.total) - returned - paid) * 100) / 100;
  return { paid, returned, due };
}
