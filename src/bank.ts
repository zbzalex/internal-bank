import { Account } from "./account";
import { Block } from "./block";

export interface Bank {
  queryBlocks(take?: number, skip?: number): Promise<Array<Block>>;
  queryBlockByIndex(index: number): Promise<Block | undefined>;
  queryLastBlock(): Promise<Block>;
  addBlock(block: Block): Promise<void>;
  queryAccountByAddress(address: string): Promise<number>;
  queryAccounts(): Promise<Array<Account>>;
  setAccountBalance(address: string, newBalance: number): Promise<number>;
}
