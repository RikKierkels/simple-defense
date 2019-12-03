import { Vector } from './vector.js';
import { Path } from './path.js';
import { TILE_TYPE } from './const.js';

export class Level {
  constructor(plan) {
    const rows = plan
      .trim()
      .split('\n')
      .map(row => [...row]);

    this.height = rows.length;
    this.width = rows[0].length;

    this.rows = rows.map((row, y) => {
      return row.map((char, x) => {
        if (char === TILE_TYPE.START) {
          this.start = new Vector(x, y);
        } else if (char === TILE_TYPE.END) {
          this.end = new Vector(x, y);
        }

        return char;
      });
    });

    this.path = this.getPathFrom(this.start, this.end);
  }
}

Level.prototype.getPathFrom = function(start, end) {
  const path = new Path(start);
  let currentPos = start;

  const isOutOfBounds = (x, y) => {
    return x < 0 || x > this.width - 1 || y < 0 || y > this.height - 1;
  };

  while (!path.has(end)) {
    const neighbours = {
      north: new Vector(currentPos.x, currentPos.y - 1),
      east: new Vector(currentPos.x + 1, currentPos.y),
      south: new Vector(currentPos.x, currentPos.y + 1),
      west: new Vector(currentPos.x - 1, currentPos.y)
    };

    for (const pos of Object.values(neighbours)) {
      if (isOutOfBounds(pos.x, pos.y) || path.has(pos)) {
        continue;
      }

      const tile = this.rows[pos.y][pos.x];
      if (tile === TILE_TYPE.PATH || tile === TILE_TYPE.END) {
        path.add(pos);
        currentPos = pos;
        break;
      }
    }
  }

  return path;
};

Level.prototype.isTileBlocked = function(x, y) {
  const tile = this.rows[y][x];
  return tile && tile !== TILE_TYPE.EMPTY;
};
