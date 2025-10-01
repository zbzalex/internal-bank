import { Block } from "./block";
import { hash } from "./hash";
import { buildMerkleRoot } from "./merkle";
import { Bank } from "./bank";
import { Transaction } from "./transaction";

export class Blockchain {
  bank: Bank;
  pendingTransactions: Array<Transaction>;

  constructor(bank: Bank) {
    this.bank = bank;
    this.pendingTransactions = [];
  }

  async addTransaction(transaction: Transaction): Promise<void> {
    this.pendingTransactions.push(transaction);
  }

  async commit(): Promise<Block> {
    if (this.pendingTransactions.length === 0) {
      throw new Error("Pending transactions is emtpy");
    }

    let i = 0;
    let invokeQueue = this.pendingTransactions.map(
      (transaction) => async (next: () => Promise<void>) => {

        console.log(
          "execute transaction @", transaction
        )

        const balanceFrom = await this.bank.queryAccountByAddress(
          transaction.from
        );
        const balanceTo = await this.bank.queryAccountByAddress(transaction.to);
        if (transaction.amount < 0) {
          throw new Error("Invalid amount");
        }

        if (balanceFrom < transaction.amount) {
          throw new Error("Not enough");
        }

        await this.bank.setAccountBalance(
          transaction.from,
          balanceFrom - transaction.amount
        );
        await this.bank.setAccountBalance(
          transaction.to,
          balanceTo + transaction.amount
        );

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

    const prevBlock = await this.bank.queryLastBlock();
    const merkleRootHash = buildMerkleRoot(this.pendingTransactions);
    const block: Block = {
      index: prevBlock.index + 1,
      transactions: this.pendingTransactions,
      merkleRootHash,
      prevHash: prevBlock.hash,
      hash: "",
      timestamp: Date.now(),
    };

    block.hash = hash(
      JSON.stringify({
        index: block.index,
        prevHash: block.prevHash,
        merkleRootHash: block.merkleRootHash,
        timestamp: block.timestamp,
      })
    );

    this.bank.addBlock(block);

    return block;
  }
}
