import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'start-page',
  standalone: true,
  templateUrl: './start-page.html',
  styles: [`
    .start { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; gap:1rem }
    .card { padding:2rem; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.08); text-align:center }
    button { margin:0.5rem; padding:0.6rem 1rem; border-radius:6px; border:0; cursor:pointer }
    .primary { background:linear-gradient(90deg,#FF6A00,#FF1493); color:white }
    .outline { background:transparent; border:1px solid #ddd }
  `]
})
export class StartPage {
  constructor(private router: Router) {}

  goToAuth(mode: 'signin'|'signup'){
    this.router.navigate(['/auth'], { queryParams: { mode } });
  }
}
