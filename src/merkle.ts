import { hash } from "./hash";
import { Transaction } from "./transaction";

export class MerkleNode {
  constructor(
    public readonly hash: string,
    public readonly left?: MerkleNode,
    public readonly right?: MerkleNode
  ) {}
}

export function buildMerkleRoot(transactions: Transaction[]): string {
  if (transactions.length === 0) return "";
  let nodes = transactions.map(transaction =>
    new MerkleNode(hash(JSON.stringify(transaction))))
  while( nodes.length > 1 ) {
    const level = []
    for (
      let i = 0, ii = nodes.length;
      i < ii;
      i++
    ) {
      const l = nodes[i]
      const r = i + 1 < nodes.length ? nodes[++i] : l
      level.push(new MerkleNode(hash(l.hash + r.hash), l, r))
    }

    nodes = level
  }

  return nodes[0].hash
}
