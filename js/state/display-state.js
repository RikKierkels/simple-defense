import { KEY, MOUSE_BUTTON } from '../utils/constants.js';

export class DisplayState {
  constructor(selectedTowerType) {
    this.selectedTowerType = selectedTowerType;
  }

  get isBuilding() {
    return this.selectedTowerType !== null;
  }

  clear() {
    return new DisplayState(null);
  }
}

DisplayState.prototype.syncInput = function(input) {
  return this.isBuilding
    ? this.updateBuilding(input)
    : this.startBuilding(input);
};

DisplayState.prototype.updateBuilding = function(input) {
  const hasCancelled =
    input.buttonStates[KEY.ESCAPE] || input.buttonStates[MOUSE_BUTTON.RIGHT];

  return hasCancelled ? this.clear() : this;
};

DisplayState.prototype.startBuilding = function({ target }) {
  return target.tower ? new DisplayState(target.tower) : this.clear();
};
