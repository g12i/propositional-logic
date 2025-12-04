export class HierarchicalTree<T> {
  constructor(public readonly items: (T | HierarchicalTree<T>)[] = []) {}

  get length() {
    return this.items.length;
  }

  push(item: T | HierarchicalTree<T>) {
    this.items.push(item);
  }

  [Symbol.iterator]() {
    return this.items[Symbol.iterator]();
  }
}

export function buildHierarchy(chars: string[]): HierarchicalTree<string> {
  const root = new HierarchicalTree<string>();
  const stack = [root];

  for (const ch of chars) {
    if (ch === "(" || ch === "[" || ch === "{") {
      const nextLevel = new HierarchicalTree<string>();
      stack.at(-1)?.push(nextLevel);
      stack.push(nextLevel);
      continue;
    }

    if (ch === ")" || ch === "]" || ch === "}") {
      stack.pop();
      continue;
    }

    stack.at(-1)?.push(ch);
  }

  return root;
}
