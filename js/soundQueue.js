'use strict';

class SoundQueue {
  constructor() {
    this._array = [];
    this._isRun = false;
  }
  addQueueJob = async (file) => {
    this._array.push(file);
    await this.executeJob();
  }
  executeJob = async () => {
    if (this._array.length === 0) {
      this._isRun = false;
      return;
    }
    if (!this._isRun) {
      this._isRun = true;
      let file = this._array.shift();
      await playSound(file);
    }
  }
  jobFinished = async () => {
    this._isRun = false;
    if (this._array.length > 0) await this.executeJob();
  }
}