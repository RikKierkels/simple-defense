import { MOUSE_BUTTON, ACTOR_TYPE, TOWER_TYPE, TILE_TYPE } from './const.js';
import { Vector } from './vector.js';
import { TOWERS } from './tower.js';

const SCALE = 35;
const PANEL_TOWER_SIZE = SCALE * 2;
const PANEL_MARGIN = SCALE * 0.75;
const PANEL_WIDTH = SCALE * 4;

const SPRITESHEET = document.createElement('img');
SPRITESHEET.src = './sprites.png';

const SPRITESHEET_OFFSETS = {
  [TILE_TYPE.EMPTY]: { x: 2432, y: 768, h: 128, w: 128 },
  [TILE_TYPE.START]: { x: 2816, y: 768, h: 128, w: 128 },
  [TILE_TYPE.END]: { x: 2816, y: 768, h: 128, w: 128 },
  [TILE_TYPE.PATH]: { x: 2816, y: 768, h: 128, w: 128 },
  [TILE_TYPE.OBSTACLE]: { x: 128, y: 512, h: 128, w: 128 },

  [ACTOR_TYPE.GOBLIN]: { x: 1920, y: 1280, h: 128, w: 128 },
  [ACTOR_TYPE.ORC]: { x: 1920, y: 1408, h: 128, w: 128 },

  [TOWER_TYPE.MACHINE_GUN]: { x: 256, y: 256, h: 128, w: 128 },
  [TOWER_TYPE.ROCKET_LAUNCHER]: { x: 512, y: 512, h: 128, w: 128 }
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
  this.drawTowers(state.towers);
  this.drawActors(state.actors);
  this.drawPanel();
  this.drawStatistics(state.lives, state.money);
  this.drawTowerPreview(state.level, input, state.display);
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

CanvasDisplay.prototype.drawTowers = function(towers) {
  for (const tower of towers) {
    const width = tower.size.x * SCALE;
    const height = tower.size.y * SCALE;
    const sprite = SPRITESHEET_OFFSETS[tower.type];

    this.context.drawImage(
      SPRITESHEET,
      sprite.x,
      sprite.y,
      sprite.w,
      sprite.h,
      tower.pos.x * SCALE,
      tower.pos.y * SCALE,
      width,
      height
    );
  }
};

// TODO: Direction
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

  this.mapTowersToPanelPositions(TOWERS).forEach(({ type, xStart, yStart }) => {
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

CanvasDisplay.prototype.mapTowersToPanelPositions = function(towers) {
  const xTowerOffset = (PANEL_WIDTH - PANEL_TOWER_SIZE) / 2;
  const yTowerOffset = PANEL_MARGIN;
  const xStart = this.levelWidth + xTowerOffset;
  const xEnd = xStart + PANEL_TOWER_SIZE;

  return Object.keys(towers).map((type, index) => {
    const margin = index % 2 ? PANEL_MARGIN : 0;
    const yStart = index * PANEL_TOWER_SIZE + margin + yTowerOffset;
    const yEnd = yStart + PANEL_TOWER_SIZE;

    return {
      type,
      xStart,
      xEnd,
      yStart,
      yEnd
    };
  });
};

CanvasDisplay.prototype.drawStatistics = function(lives, money) {
  this.context.font = '28px Georgia';
  this.context.fillStyle = 'white';

  const livesTextWidth = this.context.measureText(lives).width;

  this.context.fillText(lives, SCALE, this.canvas.height - SCALE);
  this.context.fillText(
    `$${money}`,
    livesTextWidth + SCALE * 2,
    this.canvas.height - SCALE
  );
};

CanvasDisplay.prototype.drawTowerPreview = function(level, userInput, display) {
  let { mouseX, mouseY } = userInput;
  const hasMovedOutOfLevelBounds =
    mouseX > this.levelWidth || mouseY > this.canvas.height;

  if (!display.typeOfTowerToBuild || hasMovedOutOfLevelBounds) {
    return;
  }

  const tower = TOWERS[display.typeOfTowerToBuild];

  const scaledTowerSize = tower.size.times(SCALE);
  mouseX = mouseX - scaledTowerSize.x / 2;
  mouseY = mouseY - scaledTowerSize.y / 2;

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

CanvasDisplay.prototype.getClickedOnElement = function(userInput) {
  if (!userInput.buttonStates[MOUSE_BUTTON.LEFT]) {
    return { tile: null, towerType: null };
  }

  const { mouseX, mouseY } = userInput;
  const hasClickedOnBackground = mouseX < this.levelWidth;

  return hasClickedOnBackground
    ? this.getClickedTileInBackground(mouseX, mouseY)
    : this.getClickedTowerInPanel(mouseX, mouseY);
};

CanvasDisplay.prototype.getClickedTileInBackground = function(mouseX, mouseY) {
  const tileX = Math.floor(mouseX / SCALE);
  const tileY = Math.floor(mouseY / SCALE);

  return { tile: { x: tileX, y: tileY }, towerType: null };
};

CanvasDisplay.prototype.getClickedTowerInPanel = function(mouseX, mouseY) {
  const hasClickedOnTower = (mouseX, mouseY, xStart, xEnd, yStart, yEnd) => {
    return (
      mouseX >= xStart && mouseX <= xEnd && mouseY >= yStart && mouseY <= yEnd
    );
  };

  const clickedTower = this.mapTowersToPanelPositions(TOWERS).find(
    towerPanel => {
      return hasClickedOnTower(
        mouseX,
        mouseY,
        towerPanel.xStart,
        towerPanel.xEnd,
        towerPanel.yStart,
        towerPanel.yEnd
      );
    }
  );

  return clickedTower
    ? { tile: null, towerType: clickedTower.type }
    : { tile: null, towerType: null };
};
