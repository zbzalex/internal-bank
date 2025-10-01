import { Block } from "./block";
import { Bank } from "./bank";
import { Account } from "./account";

export class MemoryBank implements Bank {
  blocks: Array<Block>;
  accounts: Array<Account>;

  constructor(blocks: Array<Block>, accounts: Array<Account>) {
    this.blocks = blocks;
    this.accounts = accounts;
  }

  async queryBlocks(
    take: number = 10,
    skip: number = 0
  ): Promise<Array<Block>> {
    return this.blocks.slice(skip, skip + take);
  }

  async queryBlockByIndex(index: number): Promise<Block | undefined> {
    return this.blocks.find((block: Block) => block.index === index);
  }

  async addBlock(block: Block) {
    this.blocks.push(block);
  }

  async queryLastBlock(): Promise<Block> {
    return this.blocks[this.blocks.length - 1];
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

    return newBalance;
  }
}
