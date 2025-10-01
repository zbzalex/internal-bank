import { Transaction } from "./transaction";

export interface Block {
  index: number;
  transactions: Transaction[];
  merkleRootHash: string;
  prevHash: string;
  hash: string;
  timestamp: number;
}
