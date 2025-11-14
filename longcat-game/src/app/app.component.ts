import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, NavigationStart, NavigationError } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  constructor(private router: Router) {
    console.log('[DEBUG] AppComponent: Constructor called');
    console.log('[DEBUG] AppComponent: Current URL:', window.location.href);
  }

  ngOnInit() {
    console.log('[DEBUG] AppComponent: ngOnInit called');
    
    // 监听路由事件
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        console.log('[DEBUG] AppComponent: NavigationStart - URL:', event.url);
      }
      if (event instanceof NavigationEnd) {
        console.log('[DEBUG] AppComponent: NavigationEnd - URL:', event.url);
        console.log('[DEBUG] AppComponent: NavigationEnd - URLAfterRedirects:', event.urlAfterRedirects);
      }
      if (event instanceof NavigationError) {
        console.error('[DEBUG] AppComponent: NavigationError - URL:', event.url);
        console.error('[DEBUG] AppComponent: NavigationError - Error:', event.error);
      }
    });
  }
}
