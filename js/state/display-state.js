import { KEY, MOUSE_BUTTON } from '../utils/constants.js';

export class DisplayState {
  constructor(typeOfTowerToBuild) {
    this.typeOfTowerToBuild = typeOfTowerToBuild;
  }

  get isBuilding() {
    return this.typeOfTowerToBuild !== null;
  }

  clear() {
    return new DisplayState(null);
  }
}

DisplayState.prototype.syncInput = function(userInput, clickedOn) {
  return this.isBuilding
    ? this.updateBuilding(userInput)
    : this.startBuilding(userInput, clickedOn);
};

DisplayState.prototype.updateBuilding = function(userInput) {
  const hasCancelled =
    userInput.buttonStates[KEY.ESCAPE] ||
    userInput.buttonStates[MOUSE_BUTTON.RIGHT];

  return hasCancelled ? this.clear() : this;
};

DisplayState.prototype.startBuilding = function(userInput, clickedOn) {
  return clickedOn.towerType
    ? new DisplayState(clickedOn.towerType)
    : this.clear();
};
