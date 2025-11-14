import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
    console.log('[DEBUG] HomePage: Constructor called');
  }

  ngOnInit() {
    console.log('[DEBUG] HomePage: ngOnInit called');
    console.log('[DEBUG] HomePage: Current URL:', window.location.href);
    console.log('[DEBUG] HomePage: Route snapshot:', this.route.snapshot);
  }

  goToLevelSelect() {
    console.log('[DEBUG] HomePage: Navigating to level-select');
    this.router.navigate(['/level-select']);
  }

  goToSettings() {
    console.log('[DEBUG] HomePage: Navigating to settings');
    this.router.navigate(['/settings']);
  }

}
