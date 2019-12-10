export class Path {
  constructor(start) {
    this.startNode = new PathNode(start);
  }

  get start() {
    return this.startNode;
  }
}

Path.prototype.add = function(pos) {
  if (!this.startNode) {
    this.startNode = new PathNode(pos);
    return;
  }

  let current = this.startNode;
  while (current.next) {
    current = current.next;
  }

  current.next = new PathNode(pos);
};

Path.prototype.has = function(pos) {
  let current = this.startNode;

  do {
    if (current.pos.x === pos.x && current.pos.y === pos.y) {
      return true;
    }
    current = current.next;
  } while (current);

  return false;
};

Path.prototype[Symbol.iterator] = function*() {
  let current = this.startNode;

  while (current) {
    yield current.pos;
    current = current.next;
  }
};

class PathNode {
  constructor(pos) {
    this.pos = pos;
    this.next = null;
  }
}
