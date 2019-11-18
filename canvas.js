import { MOUSE_BUTTON } from './const.js';
import { Vector } from './vector.js';

const SCALE = 35;
const PANEL_TOWER_SIZE = SCALE * 2;
const PANEL_MARGIN = SCALE * 0.75;
const PANEL_WIDTH = SCALE * 4;
const PANEL_TOWERS = ['machine-gun', 'rockets'];

const SPRITESHEET = document.createElement('img');
SPRITESHEET.src = './sprites.png';

const SPRITESHEET_OFFSETS = {
  'empty': { x: 2432, y: 768, h: 128, w: 128 },
  'start': { x: 2816, y: 768, h: 128, w: 128 },
  'end': { x: 2816, y: 768, h: 128, w: 128 },
  'path': { x: 2816, y: 768, h: 128, w: 128 },
  'obstacle': { x: 128, y: 512, h: 128, w: 128 },

  'goblin': { x: 1920, y: 1280, h: 128, w: 128 },
  'orc': { x: 1920, y: 1408, h: 128, w: 128 },

  'machine-gun': { x: 256, y: 256, h: 128, w: 128 },
  'rockets': { x: 512, y: 512, h: 128, w: 128 }
};

export class CanvasDisplay {
  constructor(parent, level) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = level.width * SCALE + PANEL_WIDTH;
    this.canvas.height = level.height * SCALE;
    parent.appendChild(this.canvas);
    this.context = this.canvas.getContext('2d');
  }

  get levelWidth() {
    return this.canvas.width - PANEL_WIDTH;
  }

  clear() {
    this.canvas.remove();
  }
}

CanvasDisplay.prototype.syncState = function(state, input) {
  this.drawBackground(state.level);
  this.drawActors(state.actors);
  this.drawPanel();
  this.drawStatistics(state.lives);
  this.drawTowerPreview(state.level, input);
};

CanvasDisplay.prototype.drawBackground = function(level) {
  const xStart = 0;
  const xEnd = this.levelWidth / SCALE;
  const yStart = 0;
  const yEnd = this.canvas.height / SCALE;

  for (let y = yStart; y < yEnd; y++) {
    for (let x = xStart; x < xEnd; x++) {
      const tile = level.rows[y][x];
      const sprite = SPRITESHEET_OFFSETS[tile];

      this.context.drawImage(
        SPRITESHEET,
        sprite.x,
        sprite.y,
        sprite.w,
        sprite.h,
        x * SCALE,
        y * SCALE,
        SCALE,
        SCALE
      );
    }
  }
};

CanvasDisplay.prototype.drawActors = function(actors) {
  for (const actor of actors) {
    const width = actor.size.x * SCALE;
    const height = actor.size.y * SCALE;
    const sprite = SPRITESHEET_OFFSETS[actor.type];

    this.context.drawImage(
      SPRITESHEET,
      sprite.x,
      sprite.y,
      sprite.w,
      sprite.h,
      actor.pos.x * SCALE,
      actor.pos.y * SCALE,
      width,
      height
    );
  }
};

CanvasDisplay.prototype.drawPanel = function() {
  const xStart = this.levelWidth;
  const yStart = 0;

  this.context.fillStyle = 'black';
  this.context.fillRect(xStart, yStart, PANEL_WIDTH, this.canvas.height);

  PANEL_TOWERS.map((tower, index) =>
    this.getTowerPanelPosition(tower, index)
  ).forEach(({ type, xStart, yStart }) => {
    this.context.drawImage(
      SPRITESHEET,
      SPRITESHEET_OFFSETS[type].x,
      SPRITESHEET_OFFSETS[type].y,
      SPRITESHEET_OFFSETS[type].h,
      SPRITESHEET_OFFSETS[type].w,
      xStart,
      yStart,
      PANEL_TOWER_SIZE,
      PANEL_TOWER_SIZE
    );
  });
};

CanvasDisplay.prototype.getTowerPanelPosition = function(towerType, index) {
  const xTowerOffset = (PANEL_WIDTH - PANEL_TOWER_SIZE) / 2;
  const yTowerOffset = PANEL_MARGIN;

  const margin = index % 2 ? PANEL_MARGIN : 0;
  const xStart = this.levelWidth + xTowerOffset;
  const xEnd = xStart + PANEL_TOWER_SIZE;
  const yStart = index * PANEL_TOWER_SIZE + margin + yTowerOffset;
  const yEnd = yStart + PANEL_TOWER_SIZE;

  return {
    type: towerType,
    xStart,
    xEnd,
    yStart,
    yEnd
  };
};

CanvasDisplay.prototype.drawStatistics = function(lives) {
  this.context.font = '28px Georgia';
  this.context.fillStyle = 'white';
  this.context.fillText(lives, 20, this.canvas.height - 20);
};

// TODO: GUARD CLAUSE & REFACTOR
CanvasDisplay.prototype.drawTowerPreview = function(level, userInput) {
  let { mouseX, mouseY, hasMoved } = userInput;
  const hasMovedOutOfLevelBounds =
    mouseX > this.levelWidth || mouseY > this.canvas.height;

  if (!hasMoved || hasMovedOutOfLevelBounds) {
    return;
  }

  const tower = {
    type: 'machine-gun',
    size: new Vector(1, 1),
    range: new Vector(2, 2)
  };

  const scaledTowerSize = tower.size.times(SCALE);
  const mousePointerOffset = 5;
  mouseX = mouseX - scaledTowerSize.x / 2 - mousePointerOffset;
  mouseY = mouseY - scaledTowerSize.y / 2 - mousePointerOffset;

  const nearestTileX = Math.round(mouseX / SCALE);
  const nearestTileY = Math.round(mouseY / SCALE);

  if (level.isTileBlocked(nearestTileX, nearestTileY)) return;

  const tilePos = new Vector(nearestTileX, nearestTileY);
  this.context.drawImage(
    SPRITESHEET,
    256,
    256,
    128,
    128,
    tilePos.x * SCALE,
    tilePos.y * SCALE,
    scaledTowerSize.x,
    scaledTowerSize.y
  );

  const tileCenter = tilePos.plus(tower.size.times(0.5)).times(SCALE);
  const radius = tower.size
    .times(0.5)
    .plus(tower.range)
    .times(SCALE)
    .average();

  this.context.beginPath();
  this.context.arc(tileCenter.x, tileCenter.y, radius, 0, 2 * Math.PI);
  this.context.stroke();
};

// TODO: Needs some refactoring
CanvasDisplay.prototype.setMouseTarget = function(userInput) {
  if (!userInput.buttonStates[MOUSE_BUTTON.LEFT]) return userInput;

  const { mouseX, mouseY } = userInput;
  const hasClickedElement = (mouseX, mouseY, xStart, xEnd, yStart, yEnd) => {
    return (
      mouseX >= xStart && mouseX <= xEnd && mouseY >= yStart && mouseY <= yEnd
    );
  };

  const selectedTower = PANEL_TOWERS.map((tower, index) =>
    this.getTowerPanelPosition(tower, index)
  ).find(tower => {
    return hasClickedElement(
      mouseX,
      mouseY,
      tower.xStart,
      tower.xEnd,
      tower.yStart,
      tower.yEnd
    );
  });

  if (!selectedTower) return userInput;

  return {
    ...userInput,
    target: selectedTower.type,
    buttonStates: { ...userInput.buttonStates }
  };
};
