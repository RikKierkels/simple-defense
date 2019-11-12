export class State {
  constructor(level, actors, lives, ticks) {
    this.level = level;
    this.actors = actors;
    this.lives = lives;
    this.ticks = ticks;
  }

  static start(level, actors) {
    return new State(level, actors, 20, 0);
  }
}

State.prototype.update = function(time) {
  let ticks = this.ticks + 1;

  let actors = this.actors.map(actor => actor.update(time, this));
  actors = actors.filter(({ status }) => status !== 'survived');
  const lives = this.lives - (this.actors.length - actors.length);

  return new State(this.level, actors, lives, ticks);
};
