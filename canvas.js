const scale = 25;
const sprites = document.createElement('img');
sprites.src = './sprites.png';

const spriteOffsets = {
  empty: { x: 256, y: 896, h: 128, w: 128 },
  start: { x: 0, y: 0, h: 128, w: 128 },
  end: { x: 0, y: 0, h: 128, w: 128 },
  path: { x: 0, y: 768, h: 128, w: 128 },
  obstacle: { x: 128, y: 512, h: 128, w: 128 },
  goblin: { x: 128, y: 128, h: 128, w: 128 }
};

export class CanvasDisplay {
  constructor(parent, level) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = level.width * scale;
    this.canvas.height = level.height * scale;
    parent.appendChild(this.canvas);
    this.context = this.canvas.getContext('2d');
  }

  clear() {
    this.canvas.remove();
  }
}

CanvasDisplay.prototype.syncState = function(state) {
  this.drawBackground(state.level);
  this.drawActors(state.actors);
};

CanvasDisplay.prototype.drawBackground = function(level) {
  const xStart = 0;
  const xEnd = this.canvas.width / scale;
  const yStart = 0;
  const yEnd = this.canvas.height / scale;

  for (let y = yStart; y < yEnd; y++) {
    for (let x = xStart; x < xEnd; x++) {
      const tile = level.rows[y][x];
      const sprite = spriteOffsets[tile];

      this.context.drawImage(
        sprites,
        sprite.x,
        sprite.y,
        sprite.w,
        sprite.h,
        x * scale,
        y * scale,
        scale,
        scale
      );
    }
  }
};

CanvasDisplay.prototype.drawActors = function(actors) {
  for (const actor of actors) {
    const width = actor.size.x * scale;
    const height = actor.size.y * scale;
    const x = actor.pos.x * scale;
    const y = actor.pos.y * scale;
    const sprite = spriteOffsets[actor.type];

    this.context.drawImage(
      sprites,
      sprite.x,
      sprite.y,
      sprite.w,
      sprite.h,
      x,
      y,
      width,
      height
    );
  }
};