import { connect, RenderPageCtx, SettingsAreaSidebarItemGroupsCtx } from 'datocms-plugin-sdk';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AsyntaiPage from './components/AsyntaiPage';
import 'datocms-react-ui/styles.css';

connect({
  // Add a link to the Settings sidebar
  settingsAreaSidebarItemGroups(ctx: SettingsAreaSidebarItemGroupsCtx) {
    return [
      {
        label: 'Integrations',
        items: [
          {
            label: 'Asyntai AI Chatbot',
            icon: 'comment-dots',
            pointsTo: {
              pageId: 'asyntai-chatbot',
            },
          },
        ],
      },
    ];
  },

  // Render the main Asyntai page
  renderPage(pageId: string, ctx: RenderPageCtx) {
    const container = document.getElementById('root')!;
    const root = createRoot(container);

    if (pageId === 'asyntai-chatbot') {
      root.render(
        <StrictMode>
          <AsyntaiPage ctx={ctx} />
        </StrictMode>
      );
    }
  },
});
