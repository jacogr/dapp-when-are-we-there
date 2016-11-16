// Copyright 2016 Jaco Greeff, released under the MIT License

import React, { Component } from 'react';
import { observer } from 'mobx-react';

import Store from './store';

import styles from './application.css';

@observer
export default class Application extends Component {
  store = new Store();

  render () {
    if (!this.store.fromBlockNumber) {
      return (
        <div className={ styles.loading }>Finding best block</div>
      );
    }

    return (
      <div className={ styles.body }>
        <div className={ styles.container }>
          <div className={ styles.timer }>
            <div className={ styles.countdown }>
              { this.store.countdown }
            </div>
            <div className={ styles.footer }>
              { this.store.isElapsed ? 'elpased' : 'remaining' }
            </div>
          </div>
        </div>
        <div className={ styles.container }>
          <div className={ styles.current }>
            <div className={ styles.header }>
              best block
            </div>
            <div className={ styles.block }>
              { this.store.fromBlockNumber.toFormat(0) }
            </div>
            { this.renderTimestamp(this.store.fromTime) }
          </div>
          <div className={ styles.target }>
            <div className={ styles.header }>
              target block
            </div>
            <div className={ styles.block }>
              { this.store.toBlockNumber.toFormat(0) }
            </div>
            { this.renderTimestamp(this.store.toTime) }
          </div>
        </div>
        <div className={ `${styles.container} ${styles.inputBlockNumber}` }>
          <div className={ styles.inputBox }>
            <input
              type='number'
              min='0'
              max='99999999'
              step='1'
              value={ this.store.inputBlockNumber.toFixed(0) }
              onChange={ this.store.changeInputBlockNumber } />
            <button onClick={ this.store.setInputBlockNumber }>set</button>
          </div>
        </div>
      </div>
    );
  }

  renderTimestamp (date) {
    const parts = date.toString().split(' ');

    return (
      <div className={ styles.footer }>
        { parts.slice(0, 5).join(' ') }
        <br />
        { parts.slice(5).join(' ') }
      </div>
    );
  }
}
