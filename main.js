import './style.css';
import { renderApp } from './src/app.js';

document.addEventListener('DOMContentLoaded', () => {
  const appElement = document.getElementById('app');
  if (appElement) {
    renderApp(appElement);
  }
});
