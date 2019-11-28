import { State } from './state.js';
import { Level } from './level.js';
import { CanvasDisplay } from './canvas.js';
import { Spawn } from './spawn.js';
import { KEY } from './const.js';

const GAME = {
  plan: `
.........S....................
.........#.............@@@....
.........#...........@.@@@....
.........#....................
....@....################.....
....@@..................#.....
........................#.....
.........################.....
.........#....................
.........#....................
.........#....................
.........#....................
.........#....................
.........E....................
`,
  waves: [
    { spawns: [Spawn.create('goblin', 20, 0.1), Spawn.create('orc', 30, 0.2)] }
  ]
};

function runAnimation(frameFunc) {
  let lastTime = null;
  function frame(time) {
    if (lastTime != null) {
      let timeStep = Math.min(time - lastTime, 100) / 1000;
      if (frameFunc(timeStep) === false) return;
    }
    lastTime = time;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function runWave(display, state) {
  let ending = 1;

  return new Promise(resolve => {
    runAnimation(time => {
      const mouseTarget = display.getMouseTargetElement(userInput, state.level);
      state = state.update(time, userInput, mouseTarget);
      display.syncState(state, userInput);
      if (state.lives > 0) {
        return true;
      } else if (ending > 0) {
        ending -= time;
        return true;
      } else {
        display.clear();
        resolve(state.lives);
        return false;
      }
    });
  });
}

async function runGame(game) {
  const level = new Level(game.plan);
  const display = new CanvasDisplay(document.body, level);

  for (let wave = 0; wave < game.waves.length; ) {
    const state = State.start(level, game.waves[wave].spawns);
    const lives = await runWave(display, state);
    if (lives > 0) wave++;
  }
}

(async function() {
  await runGame(GAME);
})();

const canvas = document.querySelector('canvas');
const userInput = trackUserInput();
function trackUserInput() {
  const input = {
    buttonStates: {},
    hasMoved: false,
    mouseX: 0,
    mouseY: 0,
    mouseTarget: null
  };

  function moved({ clientX, clientY, offsetX, offsetY }) {
    input.hasMoved = true;
    input.mouseX = clientX - (clientX - offsetX);
    input.mouseY = clientY - (clientY - offsetY);
  }

  canvas.addEventListener('mousedown', event => {
    // TODO Combine calculation of mouseX/mouseY
    const { clientX, clientY, offsetX, offsetY } = event;
    input.buttonStates[event.button] = true;
    input.mouseX = clientX - (clientX - offsetX);
    input.mouseY = clientY - (clientY - offsetY);

    canvas.addEventListener('mousemove', moved);
    event.stopPropagation();
  });

  canvas.addEventListener('mouseup', event => {
    input.buttonStates[event.button] = false;
  });

  window.addEventListener('keydown', ({ key }) => {
    if (key !== KEY.ESCAPE) return;
    input.buttonStates[key] = true;
    input.hasMoved = false;
    canvas.removeEventListener('mousemove', moved);
  });

  window.addEventListener('keyup', ({ key }) => {
    if (key !== KEY.ESCAPE) return;
    input.buttonStates[key] = false;
  });

  return input;
}
