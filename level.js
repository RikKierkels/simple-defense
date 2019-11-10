import { Vector } from './vector.js';
import { Path } from './path.js';

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
        let type = charTypes[char];

        if (type === 'start') {
          this.start = new Vector(x, y);
        } else if (type === 'end') {
          this.end = new Vector(x, y);
        }

        return type;
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
      if (tile === 'path' || tile === 'end') {
        path.add(pos);
        currentPos = pos;
        break;
      }
    }
  }
};

const charTypes = {
  '.': 'empty',
  '#': 'path',
  'S': 'start',
  'E': 'end',
  '@': 'obstacle'
};
