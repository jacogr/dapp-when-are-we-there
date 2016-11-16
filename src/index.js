// Copyright 2016 Jaco Greeff, released under the MIT License

import ReactDOM from 'react-dom';
import React from 'react';
import { useStrict } from 'mobx';

import Application from './application';

import '../assets/fonts/Roboto/font.css';
import './index.css';
import './index.html';

useStrict(true);

ReactDOM.render(
  <Application />,
  document.querySelector('#container')
);
