export class Timer {
  constructor(time, elapsedTime = 0) {
    this.time = time;
    this.elapsedTime = elapsedTime;
  }

  static start(time) {
    return new Timer(time);
  }

  get hasExpired() {
    return this.elapsedTime >= this.time;
  }
}

Timer.prototype.update = function(time) {
  return new Timer(this.time, this.elapsedTime + time);
};

Timer.prototype.reset = function() {
  return new Timer(this.time);
};
