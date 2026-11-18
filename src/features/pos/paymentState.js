export function resolvePayments(payments, total, automatic) {
  if (!automatic) return payments;
  return [
    {
      method: payments[0]?.method || "Cash",
      reference: payments[0]?.reference || "",
      amount: total,
    },
  ];
}

export function walkInPaymentError({ kind, customerId, total, paid }) {
  if (
    kind === "sale" &&
    !customerId &&
    Math.round(paid * 100) < Math.round(total * 100)
  )
    return "Walk-in bills must be paid in full. Use “Fill full amount” or complete the split payment.";
  return "";
}
