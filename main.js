import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import App from './src/App.js';
import './src/styles.css';

const rootElement = document.getElementById('app');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(createElement(App));
}
