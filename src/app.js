import { renderMineView } from './mine.js';
import { renderConvertView } from './convert.js';

export function renderApp(container) {
  container.innerHTML = `
    <div class="app-container">
      <header>
        <div class="logo">BitMiner ⚡</div>
        <nav>
          <button class="nav-btn active" data-tab="mine">Mine</button>
          <button class="nav-btn" data-tab="convert">Convert</button>
        </nav>
      </header>
      <main id="main-content">
      </main>
    </div>
  `;

  const mainContent = container.querySelector('#main-content');
  const navButtons = container.querySelectorAll('.nav-btn');

  function switchTab(tabName) {
    navButtons.forEach(btn => {
      if (btn.dataset.tab === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    mainContent.innerHTML = '';
    if (tabName === 'mine') {
      renderMineView(mainContent);
    } else if (tabName === 'convert') {
      renderConvertView(mainContent);
    }
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });

  // Initial view
  renderMineView(mainContent);
}
