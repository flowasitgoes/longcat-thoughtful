import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => {
      console.log('[DEBUG] AppRoutingModule: Loading home module...');
      return import('./home/home.module').then( m => {
        console.log('[DEBUG] AppRoutingModule: Home module loaded');
        return m.HomePageModule;
      });
    }
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'game',
    loadChildren: () => {
      console.log('[DEBUG] AppRoutingModule: Loading game module...');
      return import('./features/game/game.module').then( m => {
        console.log('[DEBUG] AppRoutingModule: Game module loaded');
        return m.GamePageModule;
      });
    }
  },
  {
    path: 'level-select',
    loadChildren: () => {
      console.log('[DEBUG] AppRoutingModule: Loading level-select module...');
      return import('./features/level-select/level-select.module').then( m => {
        console.log('[DEBUG] AppRoutingModule: Level-select module loaded');
        return m.LevelSelectPageModule;
      });
    }
  },
  {
    path: 'settings',
    loadChildren: () => {
      console.log('[DEBUG] AppRoutingModule: Loading settings module...');
      return import('./features/settings/settings.module').then( m => {
        console.log('[DEBUG] AppRoutingModule: Settings module loaded');
        return m.SettingsPageModule;
      });
    }
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { 
      preloadingStrategy: PreloadAllModules,
      enableTracing: false // 设为 true 可以看到更详细的路由追踪
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
  constructor() {
    console.log('[DEBUG] AppRoutingModule: Module initialized');
    console.log('[DEBUG] AppRoutingModule: Routes configured:', routes.map(r => r.path || 'root'));
  }
}
