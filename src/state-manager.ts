import { Account } from "./account";
import { Transaction } from "./transaction";

export interface StateManager {
  queryTransactions(take?: number, skip?: number): Promise<Array<Transaction>>;
  queryTransactionByHash(hash: string): Promise<Transaction | undefined>;
  queryLastTransaction(): Promise<Transaction>;
  addTransaction(transaction: Transaction): Promise<void>;
  queryAccountByAddress(address: string): Promise<number>;
  queryAccounts(): Promise<Array<Account>>;
  setAccountBalance(address: string, newBalance: number): Promise<number>;
}
