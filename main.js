import './style.css';
import { renderApp } from './src/app.js';

document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.querySelector('#app');
  if (appContainer) {
    renderApp(appContainer);
  }
});
