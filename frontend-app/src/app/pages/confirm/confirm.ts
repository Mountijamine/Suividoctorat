import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'confirm-email-page',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
  <div class="confirm-wrapper" *ngIf="loaded()">
    <div class="card" [class.success]="success()" [class.error]="!success()">
      <h2>Email Confirmation</h2>
      <p *ngIf="success()" class="msg success">Your email has been confirmed successfully. You can now <a (click)="goLogin()">sign in</a>.</p>
      <p *ngIf="!success()" class="msg error">{{ message() }} <br /><a (click)="goLogin()">Return to sign in</a></p>
    </div>
  </div>
  `,
  styles: [`
    .confirm-wrapper { min-height: 60vh; display:flex; align-items:center; justify-content:center; font-family: system-ui, sans-serif; padding:2rem; }
    .card { max-width: 520px; width:100%; background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:2rem; box-shadow:0 6px 16px rgba(0,0,0,0.08); }
    .card.success { border-color:#dcfce7; }
    .card.error { border-color:#fee2e2; }
    h2 { margin:0 0 1rem; font-size:1.5rem; letter-spacing:-0.02em; }
    .msg { font-size:0.95rem; line-height:1.5; }
    .msg.success { color:#065f46; }
    .msg.error { color:#991b1b; }
    a { color:#1e40af; cursor:pointer; text-decoration:none; }
    a:hover { text-decoration:underline; }
  `]
})
export class ConfirmEmailPage {
  loaded = signal<boolean>(false);
  success = signal<boolean>(false);
  message = signal<string>('Processing token...');

  constructor(private route: ActivatedRoute, private auth: AuthService, private router: Router) {
    this.route.queryParams.subscribe(q => {
      const token = q['token'];
      if (!token) {
        this.message.set('Missing confirmation token.');
        this.loaded.set(true);
        return;
      }
      this.auth.confirmEmail(token).subscribe({
        next: (res: any) => {
          this.success.set(true);
          this.message.set(res?.message || 'Email confirmed');
          this.loaded.set(true);
        },
        error: (err) => {
          this.success.set(false);
          this.message.set(err?.error?.message || 'Token invalid or expired');
          this.loaded.set(true);
        }
      });
    });
  }

  goLogin() { this.router.navigate(['/auth'], { queryParams: { mode: 'signin' } }); }
}