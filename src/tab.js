import React from 'react';
import ReactDOM from 'react-dom';
import './styles/main.css';
import Tab from './components/tab/tab';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<Tab />, document.getElementById('root'));
registerServiceWorker();
