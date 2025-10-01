import { hash } from "./hash";

export interface Transaction {
  index: number
  from: string;
  to: string;
  amount: number;
  timestamp: number;
  prevHash: string,
  prevStateHash: string;
  hash: string,
  stateHash: string
}

export const createTransaction = (
  from: string,
  to: string,
  amount: number,
): Transaction => {
  return {
    index: 0,
    from,
    to,
    amount,
    timestamp: Date.now(),
    prevHash: "",
    prevStateHash: "",
    hash: "",
    stateHash: ""
  }
};

export const computeTransactionHash = (transaction: Transaction): string => {
  return hash(JSON.stringify({
    index: transaction.index,
    from: transaction.from,
    to: transaction.to,
    amount: transaction.amount,
    prevHash: transaction.prevHash,
    prevStateHash: transaction.prevStateHash,
    stateHash: transaction.stateHash,
  }))
}