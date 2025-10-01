import { Transaction } from "./transaction";
import { StateManager } from "./state-manager";
import fs from "node:fs"
import { hash } from "./hash";

export class DefaultStateManager implements StateManager {
  transactions: Array<Transaction>;
  accounts: Record<string, number>;

  constructor(
    private readonly dataFile: string
  ) {

    const data = this._load()

    this.transactions = data.transactions
    this.accounts = data.accounts
  }

  private _load(): {
    transactions: Transaction[];
    accounts: Record<string, number>
  } {

    const data: string = fs.readFileSync(this.dataFile, {
      encoding: "utf-8",
    })

    const json = JSON.parse(data)
    const transactions: Array<Transaction> = json.transactions
    const accounts: Record<string, number> = json.accounts

    return {
      transactions,
      accounts,
    }
  }

  private _commit() {

    const data = JSON.stringify({
      transactions: this.transactions,
      accounts: this.accounts,
    })

    fs.writeFileSync(this.dataFile, data)

  }

  async queryTransactions(
    take: number = 10,
    skip: number = 0
  ): Promise<Array<Transaction>> {
    return this.transactions.slice(skip, skip + take);
  }

  async queryTransactionByHash(hash: string): Promise<Transaction | undefined> {
    return this.transactions.find((tx: Transaction) => tx.hash === hash);
  }

  async addTransaction(tx: Transaction) {
    this.transactions.push(tx);

    this._commit()
  }

  async queryLastTransaction(): Promise<Transaction> {
    return this.transactions[this.transactions.length - 1];
  }

  async getBalance(address: string): Promise<number> {
    return address in this.accounts ? this.accounts[address] : 0
  }

  async setBalance(
    address: string,
    newBalance: number
  ): Promise<number> {

    this.accounts[address] = newBalance
    this._commit();

    return newBalance;
  }

  async computeStateHash(): Promise<string> {
    return hash(JSON.stringify(this.accounts))
  }
}
