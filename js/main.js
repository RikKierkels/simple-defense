import { KEY, ACTOR_TYPE, GAME_STATUS } from './utils/constants.js';
import { State } from './state/state.js';
import { Level } from './entities/level.js';
import { CanvasDisplay } from './canvas.js';
import { Spawn } from './entities/spawn.js';

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
    {
      spawns: [
        Spawn.create([ACTOR_TYPE.GOBLIN], 1, 0.1),
        Spawn.create([ACTOR_TYPE.ORC], 1, 0.2)
      ]
    },
    {
      spawns: [
        Spawn.create([ACTOR_TYPE.GOBLIN], 20, 0.1),
        Spawn.create([ACTOR_TYPE.ORC], 30, 0.2)
      ]
    }
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
  let ending = 2;

  return new Promise(resolve => {
    runAnimation(time => {
      const input = {
        ...userInput,
        target: display.getClickTarget(userInput)
      };
      state = state.update(time, input);
      display.syncState(state, input);

      const hasClearedWave =
        !state.actors.length &&
        state.spawns.every(spawn => spawn.hasSpawnedAllActors);

      if (state.status !== GAME_STATUS.LOST && !hasClearedWave) {
        return true;
      } else if (ending > 0) {
        ending -= time;
        return true;
      } else {
        resolve(state);
        return false;
      }
    });
  });
}

async function runGame(game) {
  const level = new Level(game.plan);
  const display = new CanvasDisplay(document.body, level);
  let state = State.start(level);

  for (let wave = 0; wave < game.waves.length; ) {
    state = state.addSpawns(game.waves[wave].spawns);
    state = await runWave(display, state);

    if (state.status === GAME_STATUS.LOST) {
      state = state.reset();
      wave = 0;
    } else {
      wave++;
    }
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
    target: null
  };

  const calculateMousePos = (current, offset) => current - (current - offset);

  function moved({ clientX, clientY, offsetX, offsetY }) {
    input.hasMoved = true;
    input.mouseX = calculateMousePos(clientX, offsetX);
    input.mouseY = calculateMousePos(clientY, offsetY);
  }

  canvas.addEventListener('mousedown', event => {
    const { clientX, clientY, offsetX, offsetY } = event;
    input.buttonStates[event.button] = true;
    input.mouseX = calculateMousePos(clientX, offsetX);
    input.mouseY = calculateMousePos(clientY, offsetY);

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
