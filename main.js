import { State } from './state.js';
import { Level } from './level.js';
import { CanvasDisplay } from './canvas.js';
import { Spawn } from './spawn.js';

const game = {
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
.........####################.
............................#.
.........@@.....####..@@@...#.
................#..#........#.
................#..##########.
................#.............
................#.............
................#......#######
................#......#.....#
................########.....#
.............................#
.............................E
`,
  waves: [{ spawns: [Spawn.create('goblin', 20, 2)] }]
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
      state = state.update(time);
      display.syncState(state);
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
  await runGame(game);
})();
