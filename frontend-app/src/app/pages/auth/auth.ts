import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'auth-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './auth.html',
  styles: [`
    /* ========== CSS Variables ========== */
    :host {
      --color-primary: #1e40af;
      --color-primary-hover: #1e3a8a;
      --color-primary-light: #dbeafe;
      --color-secondary: #64748b;
      --color-success: #059669;
      --color-error: #dc2626;
      --color-text-primary: #0f172a;
      --color-text-secondary: #475569;
      --color-text-muted: #64748b;
      --color-border: #e2e8f0;
      --color-bg-primary: #ffffff;
      --color-bg-secondary: #f8fafc;
      --color-bg-tertiary: #f1f5f9;
      --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      --radius-sm: 6px;
      --radius-md: 8px;
      --radius-lg: 12px;
      --transition: all 0.2s ease;
    }

    /* ========== Base Layout ========== */
    .auth-portal {
      min-height: 100vh;
      height: 100vh;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      display: flex;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }

    .auth-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      width: 100%;
      height: 100%;
      background: var(--color-bg-primary);
      overflow: hidden;
    }

    /* ========== Brand Panel ========== */
    .brand-panel {
      background-image: url('/assets/login_screen.jpg');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      color: white;
      padding: 3rem 2.5rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
    }

    .brand-panel::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(1px);
      pointer-events: none;
      z-index: 0;
    }

    /* back button over brand-panel (left image) - low-contrast "blend" style */
    .brand-back {
      position: absolute;
      top: 16px;
      left: 16px;
      background: rgba(255,255,255,0.06); /* subtle light glass */
      backdrop-filter: blur(6px);
      border: 1px solid rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.9);
      width: 40px;
      height: 40px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      box-shadow: 0 4px 10px rgba(2,6,23,0.06);
      cursor: pointer;
      z-index: 3; /* above brand-panel overlay */
    }
    .brand-back:hover{ transform: translateY(-1px); background: rgba(255,255,255,0.10); }

    .brand-content {
      position: relative;
      z-index: 2;
      display: none;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 3rem;
    }

    .logo-icon {
      width: 40px;
      height: 40px;
      color: white;
    }

    .logo-text {
      font-size: 1.5rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .brand-headline {
      font-size: 2rem;
      font-weight: 700;
      line-height: 1.2;
      margin: 0 0 2rem 0;
      letter-spacing: -0.02em;
    }

    .feature-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .feature-list li {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      font-size: 0.95rem;
      line-height: 1.5;
      opacity: 0.95;
    }

    .feature-list svg {
      flex-shrink: 0;
      margin-top: 0.15rem;
      stroke-width: 2.5;
    }

    .brand-footer {
      position: relative;
      z-index: 2;
      opacity: 0.95;
      font-size: 0.875rem;
      display: none;
    }

    /* ========== Form Panel ========== */
    .form-panel {
      background: var(--color-bg-primary);
      display: flex;
      /* center the form vertically in the right panel */
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .form-wrapper {
      width: 100%;
      max-width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* ========== Sticky Header ========== */
    .sticky-header {
      position: sticky;
      top: 0;
      background: var(--color-bg-primary);
      padding: 1.5rem 2rem;
      z-index: 10;
      flex-shrink: 0;
      border-bottom: 1px solid var(--color-border);
    }

    /* ========== Tab Switcher ========== */
    .tab-switcher {
      display: flex;
      gap: 0.5rem;
      padding: 0.25rem;
      background: var(--color-bg-tertiary);
      border-radius: var(--radius-md);
      margin-bottom: 1rem;
      width: 100%;
    }

    .tab-switcher button {
      flex: 1;
      padding: 0.625rem 1rem;
      border: none;
      background: transparent;
      color: var(--color-text-secondary);
      font-size: 0.9375rem;
      font-weight: 600;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: var(--transition);
    }

    .tab-switcher button:hover {
      color: var(--color-text-primary);
    }

    .tab-switcher button.active {
      background: var(--color-bg-primary);
      color: var(--color-primary);
      box-shadow: var(--shadow-sm);
    }

    /* ========== Form Header ========== */
    .form-header {
      margin-bottom: 1.75rem;
      text-align: center;
    }

    .form-header h1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--color-text-primary);
      margin: 0 0 0.5rem 0;
      letter-spacing: -0.02em;
    }

    .form-subtitle {
      color: var(--color-text-secondary);
      font-size: 0.9375rem;
      margin: 0;
    }

    /* ========== Form Styles ========== */
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text-primary);
      display: block;
    }

    .form-group input[type="text"],
    .form-group input[type="email"],
    .form-group input[type="password"],
    .form-group input[type="tel"] {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1.5px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: 0.9375rem;
      color: var(--color-text-primary);
      background: var(--color-bg-primary);
      transition: var(--transition);
      box-sizing: border-box;
    }

    .form-group input:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-primary-light);
    }

    .form-group input::placeholder {
      color: var(--color-text-muted);
    }

    /* ========== Checkbox ========== */
    .checkbox-group {
      margin-top: 0.25rem;
    }

    .checkbox-label {
      display: flex;
      align-items: flex-start;
      gap: 0.625rem;
      cursor: pointer;
      font-weight: 400 !important;
    }

    .checkbox-label input[type="checkbox"] {
      width: 18px;
      height: 18px;
      margin-top: 0.125rem;
      cursor: pointer;
      flex-shrink: 0;
      accent-color: var(--color-primary);
    }

    .checkbox-text {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      line-height: 1.5;
    }

    .checkbox-text a {
      color: var(--color-primary);
      text-decoration: none;
      font-weight: 600;
    }

    .checkbox-text a:hover {
      text-decoration: underline;
    }

    /* ========== Form Logo ========== */
    .form-logo {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 0.75rem;
      margin-bottom: 0;
    }

    /* allow tall/vertical logos to show their full height while staying centered */
    .form-logo img {
      width: auto;
      height: 280px; /* slightly increased height */
      max-height: 70vh;
      object-fit: contain;
      display: block;
    }

    /* ========== Scrollable Form Content ========== */
    .form-content {
      flex: 1;
      overflow-y: auto;
      padding: 2rem 2rem 3rem;
      display: flex;
      justify-content: center;
      align-items: center; /* vertically center the inner form card */
    }

    .form-content > * {
      width: 100%;
      max-width: 520px; /* allow wider form layout */
    }

    /* ========== Buttons ========== */
    .btn-primary {
      width: 100%;
      padding: 0.875rem 1.5rem;
      background: var(--color-primary);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-size: 0.9375rem;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition);
      box-shadow: var(--shadow-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .btn-primary:hover {
      background: var(--color-primary-hover);
      box-shadow: var(--shadow-md);
    }

    .btn-primary:active {
      transform: translateY(1px);
    }

    .btn-primary svg {
      width: 16px;
      height: 16px;
    }

    .btn-secondary {
      padding: 0.625rem 1.5rem;
      background: var(--color-bg-tertiary);
      color: var(--color-text-primary);
      border: none;
      border-radius: var(--radius-md);
      font-size: 0.9375rem;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition);
    }

    .btn-secondary:hover {
      background: var(--color-border);
    }

    /* ========== Alerts ========== */
    .alert {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      line-height: 1.5;
      margin-top: 1rem;
    }

    .alert svg {
      flex-shrink: 0;
      margin-top: 0.125rem;
    }

    .alert-error {
      background: #fef2f2;
      color: var(--color-error);
      border: 1px solid #fee2e2;
    }

    .alert-error svg {
      stroke: var(--color-error);
    }

    .alert-success {
      background: #f0fdf4;
      color: var(--color-success);
      border: 1px solid #dcfce7;
    }

    .alert-success svg {
      stroke: var(--color-success);
    }

    .error-message {
      color: var(--color-error);
      font-size: 0.8125rem;
      margin-top: -0.25rem;
    }

    /* ========== Modal ========== */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal-container {
      background: var(--color-bg-primary);
      border-radius: var(--radius-lg);
      width: 100%;
      max-width: 800px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-xl);
      overflow: hidden;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--color-border);
    }

    .modal-header h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0;
    }

    .modal-close {
      background: transparent;
      border: none;
      color: var(--color-text-secondary);
      cursor: pointer;
      padding: 0.25rem;
      border-radius: var(--radius-sm);
      transition: var(--transition);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-close:hover {
      background: var(--color-bg-tertiary);
      color: var(--color-text-primary);
    }

    .modal-body {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
    }

    .modal-body iframe {
      width: 100%;
      height: 500px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
    }

    .modal-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--color-border);
      display: flex;
      justify-content: flex-end;
    }

    /* ========== Responsive Design ========== */
    @media (max-width: 1024px) {
      .auth-container {
        grid-template-columns: 1fr;
      }

      .brand-panel {
        display: none;
      }
    }

    @media (max-width: 768px) {
      .sticky-header {
        padding: 1.25rem 1.5rem;
      }

      .form-content {
        padding: 1.5rem 1.5rem 2rem;
      }

      .form-header h1 {
        font-size: 1.5rem;
      }
    }

    @media (max-width: 640px) {
      .sticky-header {
        padding: 1rem 1rem;
      }

      .form-content {
        padding: 1rem 1rem 1.5rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .form-header h1 {
        font-size: 1.375rem;
      }

      .form-logo img {
        width: auto;
        height: 180px; /* slightly larger mobile height */
        max-height: 45vh;
      }
    }
  `]
})
export class AuthPage {
  mode = signal<'signin'|'signup'>('signin');

  signupForm: any;
  signinForm: any;

  serverError = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  invalidFields = signal<string[] | null>(null);
  showTerms = signal<boolean>(false);
  termsUrl: SafeResourceUrl | string = '';
  // email verification modal state
  showVerification = signal<boolean>(false);
  verificationEmail = signal<string | null>(null);
  verificationInfo = signal<string | null>(null);
  verificationCode = signal<string>('');
  verificationError = signal<string | null>(null);
  verificationSuccess = signal<string | null>(null);
  resendStatus = signal<string | null>(null);
  verifying = signal<boolean>(false);

  // Forgot password modal state
  showForgot = signal<boolean>(false);
  forgotEmail = signal<string | null>(null);
  forgotStatus = signal<string | null>(null);
  forgotError = signal<string | null>(null);
  forgotSuccess = signal<string | null>(null);
  forgetting = signal<boolean>(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private auth: AuthService,
    private sanitizer: DomSanitizer
  ) {
    this.route.queryParams.subscribe(q => {
      const m = q['mode'];
      if (m === 'signup') this.mode.set('signup');
      else this.mode.set('signin');
      if (q['email']) {
        try { this.signinForm.patchValue({ email: q['email'] }); } catch(e) { /* ignore */ }
      }
    });

    this.signupForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    });

    this.signinForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  openTerms(e: Event) {
    e.preventDefault();
    const url = '/assets/CdC-Suivi-doctorat.pdf';
    try { 
      this.termsUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url); 
    } catch(e) { 
      this.termsUrl = url; 
    }
    this.showTerms.set(true);
  }

  closeTerms() { 
    this.showTerms.set(false); 
  }

  goBack() {
    try {
      if (window.history && window.history.length > 1) {
        window.history.back();
      } else {
        this.router.navigate(['/']);
      }
    } catch (e) {
      try { this.router.navigate(['/']); } catch (_) {}
    }
  }

  switch(mode: 'signin'|'signup') {
    this.serverError.set(null);
    this.successMessage.set(null);
    this.invalidFields.set(null);
    this.router.navigate([], { queryParams: { mode } });
  }

  submitSignup() {
    this.serverError.set(null);
    this.successMessage.set(null);
    
    if (this.signupForm.invalid) {
      try { this.signupForm.markAllAsTouched(); } catch(e) { }
      const invalid = Object.keys(this.signupForm.controls || {}).filter(k => this.signupForm.controls[k].invalid);
      this.invalidFields.set(invalid.length ? invalid : null);
      this.serverError.set('Please fill all required fields correctly');
      return;
    }

    const v = this.signupForm.value;
    if (v.password !== v.confirmPassword) { 
      this.serverError.set('Passwords do not match'); 
      return; 
    }

    const payload: any = {
      email: v.email,
      password: v.password,
      confirmPassword: v.confirmPassword,
      firstName: v.firstName,
      lastName: v.lastName,
      phone: v.phone,
      acceptTerms: String(v.acceptTerms)
    };

    this.signupForm.valueChanges.subscribe(() => { 
      if (this.serverError()) this.serverError.set(null); 
    });

    this.auth.signup(payload).subscribe({
      next: (res: any) => {
        this.successMessage.set('Account created successfully! Please sign in.');
        this.signupForm.reset({acceptTerms: false});
        this.invalidFields.set(null);
        this.router.navigate([], { queryParams: { mode: 'signin', email: payload.email } });
      },
      error: (err) => {
        const msg = err?.error?.message || err?.message || 'Signup failed';
        this.serverError.set(msg);
      }
    });
  }

  submitSignin() {
    this.serverError.set(null);
    this.successMessage.set(null);
    
    if (this.signinForm.invalid) { 
      this.serverError.set('Please provide email and password.'); 
      return; 
    }

    const v = this.signinForm.value;
    this.auth.login(v).subscribe({
      next: (res: any) => {
        const token = res?.token;
        if (token) {
          let role = res?.user?.role || res?.role;

          if (!role) {
            try {
              const parts = token.split('.');
              if (parts.length >= 2) {
                const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
                role = payload.role || payload.roles || payload.authority || payload.authorities || null;
                if (Array.isArray(role) && role.length > 0) role = role[0];
              }
            } catch (e) { /* ignore decode errors */ }
          }

          const finalize = (r: any) => {
            const rr = String(r || '').toLowerCase();
            try { 
              if (r) localStorage.setItem('auth_role', String(r)); 
              else localStorage.removeItem('auth_role'); 
            } catch(e) { }
            
            this.successMessage.set('Login successful');
            
            if (!rr || rr === 'user' || rr === 'null' || rr === 'undefined') {
              try { this.router.navigate(['/profile-selection']); } 
              catch(e) { this.router.navigate(['/']); }
            } else if (rr === 'candidat' || rr.includes('candidat')) {
              this.router.navigate(['/candidat/dashboard']);
            } else if (rr.includes('admin')) {
              this.router.navigate(['/admin']);
            } else if (rr.includes('directeur') || rr.includes('encadrant')) {
              try { this.router.navigate(['/profile-selection']); } 
              catch(e) { this.router.navigate(['/']); }
            } else {
              this.router.navigate(['/']);
            }
          };

          if (role) {
            finalize(role);
          } else {
            this.auth.getProfile().subscribe({
              next: (profile: any) => { 
                finalize(profile?.role || profile?.roles || profile?.authority || null); 
              },
              error: () => { finalize(null); }
            });
          }
        } else {
          this.serverError.set('Login response missing token');
        }
      },
      error: (err) => {
        // Handle email not verified flow (403 with structured body)
        if (err?.status === 403 && (err?.error?.message || '').toLowerCase().includes('email not verified')) {
          this.verificationEmail.set(v.email);
          const action = err?.error?.action || 'Please verify your email';
          const existing = err?.error?.codeExisting === true;
          this.verificationInfo.set(existing
            ? 'Enter the existing verification code sent to your email or click the confirmation link.'
            : action);
          this.showVerification.set(true);
          this.serverError.set(null);
          return;
        }
        if (err?.status === 429 && (err?.error?.message || '').toLowerCase().includes('verification code')) {
          this.serverError.set('Too many attempts. Please wait before requesting a new code.');
          return;
        }
        const msg = err?.error?.message || err?.message || 'Login failed';
        this.serverError.set(msg);
      }
    });
  }

  closeVerification() {
    this.showVerification.set(false);
    this.verificationCode.set('');
    this.verificationError.set(null);
    this.verificationSuccess.set(null);
    this.resendStatus.set(null);
  }

  openForgot() {
    this.forgotError.set(null);
    this.forgotSuccess.set(null);
    try { this.forgotEmail.set(this.signinForm.value.email || ''); } catch(e) { this.forgotEmail.set(''); }
    this.showForgot.set(true);
  }

  closeForgot() {
    this.showForgot.set(false);
    this.forgotEmail.set(null);
    this.forgotStatus.set(null);
    this.forgotError.set(null);
    this.forgotSuccess.set(null);
    this.forgetting.set(false);
  }

  submitForgot() {
    const email = (this.forgotEmail() || '').trim();
    if (!email) { this.forgotError.set('Please enter your email'); return; }
    this.forgetting.set(true);
    this.forgotStatus.set('Sending reset link...');
    this.forgotError.set(null);
    this.forgotSuccess.set(null);
    this.auth.requestPasswordReset(email).subscribe({
      next: () => {
        this.forgetting.set(false);
        this.forgotSuccess.set('If the email exists, a reset link has been sent.');
        this.forgotStatus.set(null);
      },
      error: (err) => {
        this.forgetting.set(false);
        const msg = err?.error?.message || 'Failed to send reset link';
        this.forgotError.set(msg);
        this.forgotStatus.set(null);
      }
    });
  }

  resendCode() {
    const email = this.verificationEmail();
    if (!email) return;
    this.resendStatus.set('Sending code...');
    this.verificationError.set(null);
    this.auth.sendVerificationCode(email).subscribe({
      next: () => {
        this.resendStatus.set('Code sent. Check your email.');
      },
      error: (err) => {
        if (err?.status === 429) {
          this.resendStatus.set('Rate limited. Please wait before requesting again.');
        } else {
          this.resendStatus.set('Failed to send code.');
        }
      }
    });
  }

  submitVerificationCode() {
    const email = this.verificationEmail();
    const code = (this.verificationCode() || '').trim();
    if (!email || !code) {
      this.verificationError.set('Enter the 6-digit code.');
      return;
    }
    this.verifying.set(true);
    this.verificationError.set(null);
    this.verificationSuccess.set(null);
    this.auth.verifyCode(email, code).subscribe({
      next: () => {
        this.verificationSuccess.set('Email verified successfully. Logging you in...');
        // attempt login again automatically
        this.auth.login({ email, password: this.signinForm.value.password }).subscribe({
          next: () => {
            this.verifying.set(false);
            this.closeVerification();
            // navigate based on role (reuse submitSignin logic by calling getProfile)
            this.auth.getProfile().subscribe({
              next: (profile: any) => {
                const role = (profile?.roles && Array.isArray(profile.roles) && profile.roles.length) ? profile.roles[0] : profile?.role;
                try { localStorage.setItem('auth_role', role || ''); } catch(e) {}
                if (!role || String(role).toLowerCase() === 'user') {
                  this.router.navigate(['/profile-selection']);
                } else if (String(role).toLowerCase().includes('admin')) {
                  this.router.navigate(['/admin']);
                } else if (String(role).toLowerCase().includes('candidat')) {
                  this.router.navigate(['/candidat/dashboard']);
                } else {
                  this.router.navigate(['/']);
                }
              },
              error: () => { this.router.navigate(['/']); }
            });
          },
          error: () => {
            this.verifying.set(false);
            this.verificationError.set('Verified but automatic login failed. Please sign in again.');
          }
        });
      },
      error: (err) => {
        this.verifying.set(false);
        const msg = err?.error?.message || 'Invalid or expired code';
        this.verificationError.set(msg);
      }
    });
  }
}