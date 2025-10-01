import { createHash } from "crypto";

export interface Transaction {
  from: string;
  to: string;
  amount: number;
  timestamp: number;
}

export const createTransaction = (
  from: string,
  to: string,
  amount: number
): Transaction => ({
  from,
  to,
  amount,
  timestamp: Date.now(),
});
