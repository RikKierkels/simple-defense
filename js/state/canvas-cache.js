export class CanvasCache {
  constructor(cache) {
    this.cache = cache;
  }

  static create() {
    const cache = Object.create(null);
    return new CanvasCache(cache);
  }
}

CanvasCache.prototype.has = function(type, direction) {
  const cacheForType = this.cache[type] || {};
  return cacheForType[direction] !== undefined;
};

CanvasCache.prototype.get = function(type, direction) {
  const cacheForType = this.cache[type] || {};
  return cacheForType[direction];
};

CanvasCache.prototype.set = function(type, direction, canvas) {
  let cacheForType = this.cache[type];

  if (!cacheForType) {
    cacheForType = Object.create(null);
  }

  cacheForType[direction] = canvas;
  const cache = { ...this.cache, [type]: cacheForType };
  return new CanvasCache(cache);
};
