import { MOUSE_BUTTON } from './const.js';
import { Vector } from './vector.js';

const scale = 35;
const sprites = document.createElement('img');
sprites.src = './sprites.png';

const spriteOffsets = {
  empty: { x: 2432, y: 768, h: 128, w: 128 },
  start: { x: 2816, y: 768, h: 128, w: 128 },
  end: { x: 2816, y: 768, h: 128, w: 128 },
  path: { x: 2816, y: 768, h: 128, w: 128 },
  obstacle: { x: 128, y: 512, h: 128, w: 128 },
  goblin: { x: 1920, y: 1280, h: 128, w: 128 },
  orc: { x: 1920, y: 1408, h: 128, w: 128 }
};

export class CanvasDisplay {
  constructor(parent, level) {
    this.menuWidth = 150;
    this.canvas = document.createElement('canvas');
    this.canvas.width = level.width * scale + this.menuWidth;
    this.canvas.height = level.height * scale;
    parent.appendChild(this.canvas);
    this.context = this.canvas.getContext('2d');
  }

  get levelBackgroundWidth() {
    return this.canvas.width - this.menuWidth;
  }

  clear() {
    this.canvas.remove();
  }
}

CanvasDisplay.prototype.syncState = function(state, input) {
  this.drawBackground(state.level);
  this.drawActors(state.actors);
  this.drawMenu();
  this.drawStatistics(state.lives);
  this.drawTowerPreview(state.level, input);
};

CanvasDisplay.prototype.drawBackground = function(level) {
  const xStart = 0;
  const xEnd = this.levelBackgroundWidth / scale;
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
    const sprite = spriteOffsets[actor.type];

    this.context.drawImage(
      sprites,
      sprite.x,
      sprite.y,
      sprite.w,
      sprite.h,
      actor.pos.x * scale,
      actor.pos.y * scale,
      width,
      height
    );
  }
};

CanvasDisplay.prototype.drawMenu = function() {
  const xStart = this.levelBackgroundWidth;
  const yStart = 0;
  const width = this.menuWidth;
  const height = this.canvas.height;

  this.context.fillStyle = 'black';
  this.context.fillRect(xStart, yStart, width, height);
};

CanvasDisplay.prototype.drawStatistics = function(lives) {
  this.context.font = '28px Georgia';
  this.context.fillStyle = 'white';
  this.context.fillText(lives, 20, this.canvas.height - 20);
};

CanvasDisplay.prototype.drawTowerPreview = function(level, userInput) {
  let { mouseX, mouseY, hasMoved } = userInput;
  const hasMovedOutOfLevelBounds =
    mouseX > this.levelBackgroundWidth || mouseY > this.canvas.height;

  if (!hasMoved || hasMovedOutOfLevelBounds) {
    return;
  }

  const tower = {
    type: 'machine-gun',
    size: new Vector(1, 1),
    range: new Vector(2, 2)
  };

  const scaledTowerSize = tower.size.times(scale);
  const mousePointerOffset = 5;
  mouseX = mouseX - scaledTowerSize.x / 2 - mousePointerOffset;
  mouseY = mouseY - scaledTowerSize.y / 2 - mousePointerOffset;

  const nearestTileX = Math.round(mouseX / scale);
  const nearestTileY = Math.round(mouseY / scale);
  const tile = level.rows[nearestTileY][nearestTileX];

  if (!tile || tile !== 'empty') return;

  const tilePos = new Vector(nearestTileX, nearestTileY);
  this.context.drawImage(
    sprites,
    256,
    256,
    128,
    128,
    tilePos.x * scale,
    tilePos.y * scale,
    scaledTowerSize.x,
    scaledTowerSize.y
  );

  const tileCenter = tilePos.plus(tower.size.times(0.5)).times(scale);
  const radius = tower.size
    .times(0.5)
    .plus(tower.range)
    .times(scale)
    .average();

  this.context.beginPath();
  this.context.arc(tileCenter.x, tileCenter.y, radius, 0, 2 * Math.PI);
  this.context.stroke();
};

CanvasDisplay.prototype.getMouseTarget = function(userInput) {
  if (!userInput.buttonStates[MOUSE_BUTTON.LEFT] && !userInput.hasMoved) {
    return userInput;
  }

  // TODO: Refactor
  return {
    ...userInput,
    buttonStates: { ...userInput.buttonStates },
    target: 'tower'
  };
};
