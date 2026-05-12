class BTreeNode<T> {
  keys: T[] = [];
  children: BTreeNode<T>[] = [];
  leaf: boolean;

  constructor(leaf = true) {
    this.leaf = leaf;
  }
}

export class BTree<T> {
  private root: BTreeNode<T>;
  private maxKeys = 3;
  private key: keyof T;
  private _size = 0;

  constructor(key: keyof T) {
    this.root = new BTreeNode<T>(true);
    this.key = key;
  }

  public push(value: T) {
    const root = this.root;

    this._size++;

    if (root.keys.length === this.maxKeys) {
      const newRoot = new BTreeNode<T>(false);
      newRoot.children.push(root);

      this.splitChild(newRoot, 0);
      this.root = newRoot;
    }

    this.insertNonFull(this.root, value);
  }

  private insertNonFull(node: BTreeNode<T>, value: T) {
    const k = this.key;

    let i = node.keys.length - 1;

    if (node.leaf) {
      node.keys.push(value);

      while (i >= 0 && value[k] < node.keys[i][k]) {
        node.keys[i + 1] = node.keys[i];
        i--;
      }

      node.keys[i + 1] = value;
    } else {
      while (i >= 0 && value[k] < node.keys[i][k]) {
        i--;
      }
      i++;

      if (node.children[i].keys.length === this.maxKeys) {
        this.splitChild(node, i);

        if (value[k] > node.keys[i][k]) {
          i++;
        }
      }

      this.insertNonFull(node.children[i], value);
    }
  }

  private splitChild(parent: BTreeNode<T>, index: number) {
    const fullNode = parent.children[index];
    const newNode = new BTreeNode<T>(fullNode.leaf);

    const mid = Math.floor(this.maxKeys / 2);

    parent.keys.splice(index, 0, fullNode.keys[mid]);

    newNode.keys = fullNode.keys.splice(mid + 1);
    fullNode.keys.splice(mid);

    // split children
    if (!fullNode.leaf) {
      newNode.children = fullNode.children.splice(mid + 1);
    }

    parent.children.splice(index + 1, 0, newNode);
  }

  public getAll(direction: 'asc' | 'desc' = 'asc'): T[] {
    const result: T[] = [];
    if (direction === 'asc') {
      this.inOrder(this.root, result);
    } else {
      this.desinOrder(this.root, result);
    }
    return result;
  }
  public get length(): number {
    return this._size;
  }
  private desinOrder(node: BTreeNode<T>, result: T[]) {
    for (let i = node.keys.length - 1; i >= 0; i--) {
      if (!node.leaf) {
        this.desinOrder(node.children[i + 1], result);
      }
      result.push(node.keys[i]);
    }
    if (!node.leaf) {
      this.desinOrder(node.children[0], result);
    }
  }

  private inOrder(node: BTreeNode<T>, result: T[]) {
    for (let i = 0; i < node.keys.length; i++) {
      if (!node.leaf) {
        this.inOrder(node.children[i], result);
      }
      result.push(node.keys[i]);
    }

    if (!node.leaf) {
      this.inOrder(node.children[node.keys.length], result);
    }
  }
}
