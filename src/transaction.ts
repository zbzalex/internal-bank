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
