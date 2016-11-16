// Copyright 2016 Jaco Greeff, released under the MIT License

import BigNumber from 'bignumber.js';
import { action, observable, transaction } from 'mobx';

const { api } = window.parity;

const BLOCKTIME = 14 * 1000;

export default class Store {
  @observable countdown = null;
  @observable isElaspsed = false;
  @observable fromBlock = null;
  @observable fromBlockNumber = null;
  @observable fromTime = null;
  @observable toBlockNumber = null;
  @observable toTime = null;
  @observable inputBlockNumber = new BigNumber(0);

  constructor () {
    api.subscribe('eth_blockNumber', this.receiveBlockNumber);
    setInterval(this.countdownTimer, 1000);
  }

  @action setCountdown = (countdown, isElapsed) => {
    transaction(() => {
      this.countdown = countdown;
      this.isElapsed = isElapsed;
    });
  }

  @action setToBlockNumber = (blockNumber) => {
    this.toBlockNumber = new BigNumber(blockNumber);
  }

  @action setFromBlock = (fromBlock) => {
    transaction(() => {
      this.fromBlock = fromBlock;
      this.fromTime = fromBlock.timestamp;
      this.fromBlockNumber = fromBlock.blockNumber;

      if (this.toBlockNumber === null) {
        const toBlockNumber = this.calculateToBlockNumber();

        this.toBlockNumber = toBlockNumber;
        this.inputBlockNumber = toBlockNumber;
      }

      this.calculateTime();
    });
  }

  @action changeInputBlockNumber = (event) => {
    transaction(() => {
      this.inputBlockNumber = new BigNumber(event.target.value);
    });
  }

  @action setInputBlockNumber = () => {
    transaction(() => {
      this.toBlockNumber = this.inputBlockNumber;
      this.calculateTime();
    });
  }

  @action calculateTime = () => {
    const milis = this.toBlockNumber.sub(this.fromBlock.blockNumber).mul(BLOCKTIME);

    this.toTime = new Date(this.fromBlock.timestamp.getTime() + milis.toNumber());
    this.countdownTimer();
  }

  calculateToBlockNumber = () => {
    const digits = this.fromBlockNumber.toFixed();
    const digit = parseInt(digits[1], 10);

    let toString = this.createRepeating(digits[0], digit, digits.length);
    if (this.fromBlockNumber.gt(toString)) {
      toString = this.createRepeating(digits[0], digit + 1, digits.length);
    }

    return new BigNumber(toString);
  }

  createRepeating (prefix, repeat, length) {
    const output = [prefix];

    while (output.length < length) {
      output.push(`${repeat}`);
    }

    return output.join('');
  }

  receiveBlockNumber = (error, blockNumber) => {
    if (error) {
      console.error('Store:receiveBlockNumber', error);
      return;
    }

    api.eth
      .getBlockByNumber(blockNumber)
      .then((block) => {
        block.blockNumber = blockNumber;
        this.setFromBlock(block);
      })
      .catch((error) => {
        console.error('Store:receiveBlockNumber', error);
      });
  }

  countdownTimer = () => {
    if (!this.toTime) {
      return;
    }

    const now = Date.now();
    const isElapsed = this.toTime <= now;
    const seconds = Math.floor(Math.abs(this.toTime - now) / 1000);

    const days = Math.floor(seconds / 24 / 60 / 60);
    const hoursLeft = Math.floor(seconds - (days * 86400));
    const hours = Math.floor(hoursLeft / 3600);
    const minutesLeft = Math.floor(hoursLeft - (hours * 3600));
    const minutes = Math.floor(minutesLeft / 60);

    let remainingSeconds = seconds % 60;
    if (remainingSeconds < 10) {
      remainingSeconds = `0${remainingSeconds}`;
    }

    this.setCountdown(`${days}:${hours}:${minutes}:${remainingSeconds}`, isElapsed);
  }
}
