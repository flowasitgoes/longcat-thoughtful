import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

console.log('[DEBUG] main.ts: Application starting...');
console.log('[DEBUG] main.ts: Current URL:', window.location.href);
console.log('[DEBUG] main.ts: Base href:', document.querySelector('base')?.getAttribute('href') || 'not set');

platformBrowserDynamic().bootstrapModule(AppModule)
  .then(() => {
    console.log('[DEBUG] main.ts: Application bootstrapped successfully');
    console.log('[DEBUG] main.ts: Current pathname:', window.location.pathname);
  })
  .catch(err => {
    console.error('[DEBUG] main.ts: Bootstrap error:', err);
    console.log(err);
  });
