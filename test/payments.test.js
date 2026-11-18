import { test } from "node:test";
import assert from "node:assert/strict";
import {
  resolvePayments,
  walkInPaymentError,
} from "../src/features/pos/paymentState.js";

test("default cash payment covers the entire walk-in bill without manual amount entry", () => {
  const payments = resolvePayments(
    [{ method: "Cash", amount: "", reference: "" }],
    1048.95,
    true,
  );
  assert.deepEqual(payments, [
    { method: "Cash", amount: 1048.95, reference: "" },
  ]);
  assert.equal(
    walkInPaymentError({
      kind: "sale",
      customerId: null,
      total: 1048.95,
      paid: payments[0].amount,
    }),
    "",
  );
});
test("automatic payment follows revised totals and preserves the selected payment method", () => {
  const payment = [{ method: "UPI", amount: 1048.95, reference: "DEMO-UPI" }];
  assert.deepEqual(resolvePayments(payment, 2097.9, true), [
    { method: "UPI", amount: 2097.9, reference: "DEMO-UPI" },
  ]);
});
test("manual split and partial payments are never silently topped up", () => {
  const split = [
    { method: "Cash", amount: 100 },
    { method: "Card", amount: 200 },
  ];
  assert.equal(resolvePayments(split, 1048.95, false), split);
  assert.match(
    walkInPaymentError({
      kind: "sale",
      customerId: null,
      total: 1048.95,
      paid: 300,
    }),
    /paid in full/,
  );
  assert.equal(
    walkInPaymentError({
      kind: "sale",
      customerId: 1,
      total: 1048.95,
      paid: 300,
    }),
    "",
  );
});
test("fully paid walk-in split payment and zero-total bills need no named customer", () => {
  assert.equal(
    walkInPaymentError({
      kind: "sale",
      customerId: "",
      total: 1048.95,
      paid: 500 + 548.95,
    }),
    "",
  );
  assert.equal(
    walkInPaymentError({ kind: "sale", customerId: "", total: 0, paid: 0 }),
    "",
  );
});
