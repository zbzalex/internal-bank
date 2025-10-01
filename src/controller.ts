import { hash } from "./hash";
import { StateManager } from "./state-manager";
import { Transaction } from "./transaction";

export class Controller {
  stateManager: StateManager;
  pendingTransactions: Array<Transaction>;

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
    this.pendingTransactions = [];
  }

  async addTransaction(transaction: Transaction): Promise<void> {
    this.pendingTransactions.push(transaction);
  }

  async commit(): Promise<void> {
    if (this.pendingTransactions.length === 0) {
      throw new Error("Pending transactions is emtpy");
    }

    let i = 0;
    let invokeQueue = this.pendingTransactions.map(
      (transaction) => async (next: () => Promise<void>) => {
        console.log(
          "execute transaction @", transaction
        )

        const lastTransaction = await this.stateManager.queryLastTransaction()
        const state = await this.stateManager.queryAccounts()
        const stateHash = hash(JSON.stringify(state.map(
          account => [
            account.address.padStart(32, "0"),
            String(account.balance).padStart(32, "0")
          ]
        )))

        if (lastTransaction.stateHash !== stateHash) {
          throw new Error("State hash mismatch")
        }

        const balanceFrom = await this.stateManager.queryAccountByAddress(
          transaction.from
        );
        const balanceTo = await this.stateManager.queryAccountByAddress(transaction.to);
        if (transaction.amount < 0) {
          throw new Error("Invalid amount");
        }

        if (balanceFrom < transaction.amount) {
          throw new Error("Not enough");
        }

        await this.stateManager.setAccountBalance(
          transaction.from,
          balanceFrom - transaction.amount
        );
        await this.stateManager.setAccountBalance(
          transaction.to,
          balanceTo + transaction.amount
        );

        const newState = await this.stateManager.queryAccounts()
        const newStateHash = hash(JSON.stringify(newState.map(
          account => [
            account.address.padStart(32, "0"),
            String(account.balance).padStart(32, "0")
          ]
        )))

        transaction.index = lastTransaction.index + 1
        transaction.prevHash = lastTransaction.hash
        transaction.prevStateHash = lastTransaction.stateHash
        transaction.stateHash = newStateHash
        transaction.hash = hash(JSON.stringify({
          from: transaction.from,
          to: transaction.to,
          amount: transaction.amount,
          prevHash: transaction.prevHash,
          prevStateHash: transaction.prevStateHash,
          stateHash: transaction.stateHash,
        }))

        this.stateManager.addTransaction(transaction)

        console.log(
          "new state @", transaction
        )

        await next();
      }
    );

    const next = async () => {
      if (i < invokeQueue.length) {
        const invoke = invokeQueue[i++];

        await invoke(next);
      }
    };

    await next();
  }
}
