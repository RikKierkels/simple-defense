export class State {
  constructor(level, actors, status) {
    this.level = level;
    this.actors = actors;
    this.status = status;
  }

  static start(level, actors) {
    return new State(level, actors, 'playing');
  }
}

State.prototype.update = function(time) {
  const actors = this.actors.map(actor => actor.update(time, this));
  return new State(this.level, actors, this.status);
};
