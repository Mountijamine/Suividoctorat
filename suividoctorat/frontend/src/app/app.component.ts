import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <header class="app-header">
      <div class="container">Suivi Doctorat - Frontend</div>
    </header>
    <div class="container">
      <nav>
        <a routerLink="/">Doctorants</a> | <a routerLink="/login">Login</a>
      </nav>
      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent { }
