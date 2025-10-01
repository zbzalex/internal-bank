import { Transaction } from "./transaction";

export interface StateManager {
  queryTransactions(take?: number, skip?: number): Promise<Array<Transaction>>;
  queryTransactionByHash(hash: string): Promise<Transaction | undefined>;
  queryLastTransaction(): Promise<Transaction>;
  addTransaction(transaction: Transaction): Promise<void>;
  getBalance(address: string): Promise<number>;
  deposit(address: string, value: number): Promise<number>;
  computeStateHash(): Promise<string>;
}
