import { hash } from "./hash";
import { StateManager } from "./state-manager";
import { computeTransactionHash, Transaction } from "./transaction";

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
        // console.log(
        //   "execute transaction @", transaction
        // )

        const lastTransaction = await this.stateManager.queryLastTransaction()
        const stateHash = await this.stateManager.computeStateHash()

        if (lastTransaction.stateHash !== stateHash) {
          throw new Error("Invalid state hash")
        }

        const hash_ = computeTransactionHash(lastTransaction)

        if (lastTransaction.hash !== hash_) {
          throw new Error("Invalid hash")
        }

        const balanceFrom =
          await this.stateManager.getBalance(transaction.from);
        const balanceTo =
          await this.stateManager.getBalance(transaction.to);
        if (transaction.amount < 0) {
          throw new Error("Invalid amount");
        }

        if (balanceFrom < transaction.amount) {
          throw new Error("Not enough");
        }

        await this.stateManager.deposit(transaction.from, -transaction.amount);
        await this.stateManager.deposit(transaction.to, transaction.amount);

        const newStateHash = await this.stateManager.computeStateHash()

        transaction.index = lastTransaction.index + 1
        transaction.prevHash = lastTransaction.hash
        transaction.prevStateHash = lastTransaction.stateHash
        transaction.stateHash = newStateHash
        transaction.hash = computeTransactionHash(transaction)

        this.stateManager.addTransaction(transaction)

        // console.log(
        //   "new state @", transaction
        // )

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
