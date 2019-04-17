import 'babel-polyfill';
import App from 'app/components/App';
import React from 'react';
import ReactDOM from 'react-dom';

require('assets/images/favicon.ico');

const MOUNT_NODE = document.getElementById('app');

const render = () => {
  ReactDOM.render(
    React.createElement(
      App
    ),
    MOUNT_NODE
  );
};

if ((module as any).hot) {
  (module as any).hot.accept(['app/components/App'], () => {
    ReactDOM.unmountComponentAtNode(MOUNT_NODE);
    render();
  });
}

render();
