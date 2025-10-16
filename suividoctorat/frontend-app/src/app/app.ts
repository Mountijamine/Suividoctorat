import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="app-root">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`.app-root { font-family: Inter, Arial, Helvetica, sans-serif; min-height: 100vh; margin:0; }`]
})

export class App { }
// Removed the second App component definition
