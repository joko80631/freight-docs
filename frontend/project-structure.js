// project-structure.js
const expectedStructure = {
  components: {
    ui: ['button.tsx', 'card.tsx', 'dropdown-menu.tsx', 'avatar.tsx', 'theme-toggle.tsx'],
    common: ['page-header.tsx', 'page-container.tsx', 'section.tsx'],
    dashboard: ['dashboard-layout.tsx', 'sidebar.tsx', 'top-bar.tsx', 'metric-card.tsx', 'user-nav.tsx']
  },
  config: ['navigation.ts'],
  lib: ['utils.ts', 'useLocalStorage.ts'],
  app: {
    dashboard: ['page.tsx'],
    loads: ['page.tsx'],
    layout: ['layout.tsx']
  }
};

module.exports = expectedStructure; 