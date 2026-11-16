import './src/style.css';
import { initApp } from './src/app.js';

document.addEventListener('DOMContentLoaded', () => {
  const appElement = document.getElementById('app');
  if (appElement) {
    initApp(appElement);
  }
});
