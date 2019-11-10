import { Vector } from './vector.js';

export class Level {
  constructor(plan) {
    const rows = plan
      .trim()
      .split('\n')
      .map(row => [...row]);

    this.height = rows.length;
    this.width = rows[0].length;
    this.grid = new PF.Grid(this.width, this.height);

    this.rows = rows.map((row, y) => {
      return row.map((char, x) => {
        let type = charTypes[char];

        if (type === 'start') {
          this.start = new Vector(x, y);
        } else if (type === 'end') {
          this.end = new Vector(x, y);
        } else if (type !== 'path') {
          this.grid.setWalkableAt(x, y, false);
        }

        return type;
      });
    });
  }
}

Level.prototype.findPath = function(startX, startY) {
  const finder = new PF.AStarFinder();
  return finder.findPath(
    startX,
    startY,
    this.end.x,
    this.end.y,
    this.grid.clone()
  );
};

const charTypes = {
  '.': 'empty',
  '#': 'path',
  'S': 'start',
  'E': 'end',
  '@': 'obstacle'
};
