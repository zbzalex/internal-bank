import { Account } from "./account";
import { Transaction } from "./transaction";
import { StateManager } from "./state-manager";
import fs from "node:fs"

export class DefaultStateManager implements StateManager {
  transactions: Array<Transaction>;
  accounts: Array<Account>;

  constructor(
    private readonly dataFile: string
  ) {

    const data = this._load()

    this.transactions = data.transactions
    this.accounts = data.accounts
  }

  private _load(): {
    transactions: Transaction[];
    accounts: Account[]
  } {

    const data: string = fs.readFileSync(this.dataFile, {
      encoding: "utf-8",
    })

    const json = JSON.parse(data)
    const transactions: Array<Transaction> = json.transactions
    const accounts: Array<Account> = json.accounts

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

  async queryAccountByAddress(address: string): Promise<number> {
    const account = this.accounts.find(
      (account) => account.address === address
    );

    return account ? account.balance : 0;
  }

  async queryAccounts(): Promise<Array<Account>> {
    return this.accounts;
  }

  async setAccountBalance(
    address: string,
    newBalance: number
  ): Promise<number> {
    let index = this.accounts.findIndex(
      (account) => account.address === address
    );
    if (index === -1) {
      this.accounts = [
        ...this.accounts,
        {
          address,
          balance: newBalance,
        },
      ];
    } else {
      this.accounts[index] = {
        address,
        balance: newBalance,
      };
    }

    this._commit();

    return newBalance;
  }
}
