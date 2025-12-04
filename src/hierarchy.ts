import { Stack } from "stack-typescript";
import { NOT } from "./constants.js";

export class HierarchicalTree<T> {
  constructor(
    public readonly type: string,
    public readonly items: Array<T | HierarchicalTree<T>> = []
  ) {}

  get length() {
    return this.items.length;
  }

  *[Symbol.iterator]() {
    for (const [index, item] of this.items.entries()) {
      yield [index, item] as const;
    }
  }

  replaceItemAtIndex(
    index: number,
    newNode: T | HierarchicalTree<T>,
    deleteCount: number = 1
  ) {
    this.items.splice(index, deleteCount, newNode);
  }

  at(index: number): T | HierarchicalTree<T> | undefined {
    return this.items[index];
  }

  push(item: T | HierarchicalTree<T>) {
    this.items.push(item);
  }

  toString(): string {
    const itemsString = this.items
      .map((item) =>
        item instanceof HierarchicalTree ? item.toString() : item
      )
      .join(" ");

    return `${this.type}#(${itemsString})`;
  }
}

export function buildHierarchy(chars: string[]): HierarchicalTree<string> {
  const root = new HierarchicalTree<string>("root");
  const stack = new Stack(root);

  for (const ch of chars) {
    if (ch === "(" || ch === "[" || ch === "{") {
      const node = new HierarchicalTree<string>("node");
      stack.top.push(node);
      stack.push(node);
      continue;
    }

    if (ch === ")" || ch === "]" || ch === "}") {
      stack.pop();
      continue;
    }

    stack.top.push(ch);
  }

  mut_normalizeNots(root);

  return root;
}

function mut_normalizeNots(tree: HierarchicalTree<string>): void {
  for (const [, node] of tree) {
    if (node instanceof HierarchicalTree) {
      mut_normalizeNots(node);
    }
  }

  for (const [index, node] of tree) {
    if (node === NOT) {
      const nextItem = tree.at(index + 1);

      if (nextItem === undefined) {
        throw new Error("NOT operator without operand");
      }

      const notNode = new HierarchicalTree<string>(NOT, [
        typeof nextItem === "string"
          ? new HierarchicalTree<string>("node", [nextItem])
          : nextItem,
      ]);

      tree.replaceItemAtIndex(index, notNode, 2);
    }
  }
}
