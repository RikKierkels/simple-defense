export class Path {
  constructor(start) {
    this._startNode = start ? new PathNode(start) : null;
  }
}

Path.prototype.add = function(pos) {
  if (!this._startNode) {
    this._startNode = new PathNode(pos);
    return;
  }

  let current = this._startNode;
  while (current.next) {
    current = current.next;
  }

  current.next = new PathNode(pos);
};

Path.prototype.has = function(pos) {
  let current = this._startNode;

  do {
    if (current.pos.x === pos.x && current.pos.y === pos.y) {
      return true;
    }
    current = current.next;
  } while (current);

  return false;
};

Path.prototype[Symbol.iterator] = function*() {
  let current = this._startNode;

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
