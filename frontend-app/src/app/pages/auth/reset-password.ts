import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'reset-password-page',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <div class="reset-page">
      <div class="reset-container">
        <h2>Réinitialiser le mot de passe</h2>
        <p *ngIf="token">Un token a été détecté dans l'URL — utilisez le formulaire ci-dessous pour définir un nouveau mot de passe.</p>
        <p *ngIf="!token">Entrez votre email et le code reçu par email, ou collez le token reçu.</p>

        <div class="form-group" *ngIf="!token">
          <label for="email">Email</label>
          <input id="email" type="email" [value]="email" (input)="email = $any($event.target).value" />
        </div>

        <div class="form-group">
          <label for="token">Token (optionnel si vous avez un code)</label>
          <input id="token" type="text" [value]="token" (input)="token = $any($event.target).value" />
        </div>

        <div class="form-group" *ngIf="!token">
          <label for="code">Code (6 chiffres)</label>
          <input id="code" type="text" maxlength="6" [value]="code" (input)="code = $any($event.target).value" />
        </div>

        <div class="form-group">
          <label for="password">Nouveau mot de passe</label>
          <input id="password" type="password" [value]="password" (input)="password = $any($event.target).value" />
        </div>

        <div class="form-group">
          <label for="confirm">Confirmer le mot de passe</label>
          <input id="confirm" type="password" [value]="confirm" (input)="confirm = $any($event.target).value" />
        </div>

        <div *ngIf="error()" class="alert alert-error">{{ error() }}</div>
        <div *ngIf="success()" class="alert alert-success">{{ success() }}</div>

        <div style="display:flex; gap:8px; margin-top:12px;">
          <button class="btn-primary" (click)="submit()">Valider</button>
          <button class="btn-secondary" (click)="cancel()">Annuler</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reset-page { display:flex; justify-content:center; padding:2rem; }
    .reset-container { width:100%; max-width:480px; background:#fff; padding:1.5rem; border-radius:8px; box-shadow:0 6px 18px rgba(0,0,0,0.06); }
    .form-group { margin-bottom:0.75rem; display:flex; flex-direction:column; }
    label { font-weight:600; margin-bottom:0.25rem; }
    input { padding:0.6rem 0.8rem; border:1px solid #e2e8f0; border-radius:6px; }
    .btn-primary { background:#1e40af; color:#fff; border:none; padding:0.6rem 1rem; border-radius:6px; cursor:pointer; }
    .btn-secondary { background:#f3f4f6; color:#111827; border:none; padding:0.6rem 1rem; border-radius:6px; cursor:pointer; }
    .alert { padding:0.6rem 0.8rem; border-radius:6px; margin-top:0.6rem; }
    .alert-error { background:#fee2e2; color:#991b1b; }
    .alert-success { background:#ecfdf5; color:#065f46; }
  `]
})
export class ResetPasswordPage {
  token: string | null = null;
  email: string | null = null;
  code: string | null = null;
  password: string | null = null;
  confirm: string | null = null;

  error = signal<string | null>(null);
  success = signal<string | null>(null);
  submitting = signal<boolean>(false);

  constructor(private route: ActivatedRoute, private router: Router, private auth: AuthService) {
    this.route.queryParams.subscribe(q => {
      if (q['token']) this.token = q['token'];
      if (q['email']) this.email = q['email'];
    });
  }

  submit() {
    this.error.set(null);
    this.success.set(null);
    if (!this.password || !this.confirm) { this.error.set('Veuillez saisir et confirmer le mot de passe'); return; }
    if (this.password !== this.confirm) { this.error.set('Les mots de passe ne correspondent pas'); return; }
    this.submitting.set(true);

    if (this.token && this.token.trim() !== '') {
      this.auth.confirmPasswordReset(this.token, this.password, this.confirm).subscribe({
        next: () => { this.success.set('Mot de passe réinitialisé. Vous pouvez vous connecter.'); this.submitting.set(false); setTimeout(() => this.router.navigate(['/auth']), 1400); },
        error: (err: any) => { this.error.set(err?.error?.message || 'Échec de la réinitialisation'); this.submitting.set(false); }
      });
      return;
    }

    // fallback: try code + email
    if (!this.email || !this.code) { this.error.set('Token absent — fournissez email et code'); this.submitting.set(false); return; }
    this.auth.confirmPasswordResetWithCode(this.email, this.code, this.password, this.confirm).subscribe({
      next: () => { this.success.set('Mot de passe réinitialisé. Vous pouvez vous connecter.'); this.submitting.set(false); setTimeout(() => this.router.navigate(['/auth']), 1400); },
      error: (err: any) => { this.error.set(err?.error?.message || 'Échec de la réinitialisation'); this.submitting.set(false); }
    });
  }

  cancel() { this.router.navigate(['/auth']); }
}
