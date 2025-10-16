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
  styles: [
    `
    /* Portal layout */
    .auth-portal { display:flex; align-items:center; justify-content:center; min-height:100vh; background: linear-gradient(180deg,#f3f6fb 0%,#ffffff 100%); padding:2rem }
    .card { display:flex; width:900px; max-width:95%; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 20px 40px rgba(16,24,40,0.08) }

    /* Left side visual */
    .left { flex:1; background: linear-gradient(135deg,#0ea5e9 0%,#7c3aed 100%); color:#fff; padding:2.25rem; display:flex; flex-direction:column; align-items:flex-start; gap:1rem }
    .left .logo { font-weight:700; font-size:1.4rem }
    .left .tagline { opacity:0.95; margin-top:0.25rem; font-size:0.95rem }
    .illustration { margin-top:auto; width:100%; max-width:260px; opacity:0.95 }

    /* Right side form */
    .right { flex:1; padding:2rem 2.25rem; display:flex; flex-direction:column }
    .switch { display:flex; gap:0.5rem; margin-bottom:1rem }
    .switch button { flex:1; padding:0.6rem; border-radius:8px; border:1px solid #eef2f7; background:#fbfdff; cursor:pointer; font-weight:600 }
    .switch button.active { background:#eef2ff; border-color:#cfe0ff }

    h1 { margin:0 0 1rem 0; font-size:1.25rem; color:#0f172a; text-align:center; width:100% }
    .page-header { text-align: center; margin-bottom: 1rem; }
    .page-logo { display: block; margin: 0 auto 12px; max-width: 160px; height: auto; }

    .form { display:flex; flex-direction:column; gap:0.75rem }
    .form label { display:flex; flex-direction:column; gap:0.35rem; font-size:0.9rem; color:#0f172a }
    input[type="text"], input[type="email"], input[type="password"] { padding:0.6rem 0.75rem; border-radius:8px; border:1px solid #e6eef8; background:#fbfdff; font-size:0.95rem }

    .row-2 { display:flex; gap:0.75rem }
    .row-2 label { flex:1 }

    /* LEFT-ALIGNED checkbox row */
    .checkbox-row {
      width: 100%;
      display: flex;
      justify-content: flex-start; /* left align the row */
      align-items: center;
      padding: 0.25rem 0;
      box-sizing: border-box;
    }

    /* keep checkbox and label inline with small gap */
    .checkbox {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      white-space: nowrap; /* prevent the label from wrapping under the box */
      margin: 0; /* remove any centering margins */
    }

    .checkbox input[type="checkbox"] {
      width: 18px;
      height: 18px;
      margin: 0;
      flex: 0 0 auto;
    }

    .checkbox-text {
      margin-right: 0.25rem;
      color: var(--text-color, #222);
    }

    .checkbox a {
      margin-left: 0.25rem;
      color: var(--link-color, #1565d8);
      text-decoration: underline;
    }

    /* Responsive: allow wrapping on very small screens but keep checkbox at left */
    @media (max-width: 420px) {
      .checkbox-row { align-items: flex-start; }
      .checkbox { white-space: normal; gap: 0.35rem; }
    }

    .form-actions { display:flex; justify-content:flex-end; margin-top:0.5rem }
    button.primary { background:linear-gradient(90deg,#3b82f6 0%,#06b6d4 100%); color:#fff; border:0; padding:0.6rem 1rem; border-radius:10px; cursor:pointer; box-shadow:0 6px 18px rgba(59,130,246,0.18) }

    .error { color:#b00020; font-size:0.9rem }
    .error.server { margin-top:0.5rem }
    .error.summary { margin-top:0.5rem }
    .success.server { color:#16a34a; margin-top:0.5rem }

    @media (max-width:720px) {
      .card { flex-direction:column }
      .left { display:none }
      .right { padding:1.25rem }
    }

    /* modal styles */
    .modal-backdrop { position:fixed; inset:0; background:rgba(2,6,23,0.6); display:flex; align-items:center; justify-content:center; z-index:2000 }
    .modal { background:#fff; border-radius:10px; width:90%; max-width:760px; box-shadow:0 10px 30px rgba(2,6,23,0.3); overflow:hidden }
    .modal-header { display:flex; align-items:center; justify-content:space-between; padding:0.75rem 1rem; border-bottom:1px solid #eef3ff }
    .modal-body { padding:1rem }
    .modal-footer { padding:0.75rem 1rem; border-top:1px solid #f0f4ff; display:flex; justify-content:flex-end }
    .close { background:transparent; border:0; font-size:1.1rem; cursor:pointer }

    /* FORCE LEFT ALIGN for right column and form contents */
    .right { text-align: left !important; align-items: stretch !important; }

    /* ensure form children are left-aligned and full width */
    .form { align-items: stretch !important; text-align: left !important; width: 100%; }

    /* LEFT-ALIGNED checkbox row (stronger overrides) */
    .checkbox-row {
      width: 100% !important;
      display: flex !important;
      justify-content: flex-start !important;
      align-items: center !important;
      padding: 0.25rem 0 !important;
      box-sizing: border-box !important;
    }

    .checkbox {
      display: inline-flex !important;
      align-items: center !important;
      gap: 0.5rem !important;
      white-space: nowrap !important;
      margin: 0 !important;
    }

    .checkbox input[type="checkbox"] {
      width: 18px;
      height: 18px;
      margin: 0 0.5rem 0 0 !important;
      flex: 0 0 auto;
    }

    .checkbox-text { margin-right: 0.25rem; }
    .checkbox a { margin-left: 0.25rem; display:inline-block; }

    /* Defensive: cancel any parent text-align:center inheritance */
    .card .right, .card .right * { text-align: inherit; }
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

  constructor(private route: ActivatedRoute, private router: Router, private fb: FormBuilder, private auth: AuthService, private sanitizer: DomSanitizer){
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

  openTerms(e: Event){
    e.preventDefault();
    const url = '/assets/CdC-Suivi-doctorat.pdf';
    try { this.termsUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url); } catch(e) { this.termsUrl = url; }
    this.showTerms.set(true);
  }

  closeTerms(){ this.showTerms.set(false); }

  switch(mode: 'signin'|'signup'){
    this.serverError.set(null);
    this.successMessage.set(null);
    this.invalidFields.set(null);
    this.router.navigate([], { queryParams: { mode } });
  }

  submitSignup(){
    this.serverError.set(null);
    this.successMessage.set(null);
    if (this.signupForm.invalid) {
      // mark controls so validation messages appear in the UI
      try { this.signupForm.markAllAsTouched(); } catch(e) { }
      // collect invalid control names for a clearer error
      const invalid = Object.keys(this.signupForm.controls || {}).filter(k => this.signupForm.controls[k].invalid);
      this.invalidFields.set(invalid.length ? invalid : null);
      const list = invalid.length ? invalid.join(', ') : 'required fields';
      this.serverError.set('Please fill all required fields correctly');
      return;
    }
    const v = this.signupForm.value;
    if (v.password !== v.confirmPassword) { this.serverError.set('Passwords do not match'); return; }
    const payload: any = {
      email: v.email,
      password: v.password,
      confirmPassword: v.confirmPassword,
      firstName: v.firstName,
      lastName: v.lastName,
      phone: v.phone,
      acceptTerms: String(v.acceptTerms)
    };
    // Clear server error when user makes changes after a server failure
    this.signupForm.valueChanges.subscribe(() => { if (this.serverError()) this.serverError.set(null); });
    this.auth.signup(payload).subscribe({
      next: (res:any) => {
        this.successMessage.set('Signup successful — you can now sign in.');
        // Switch to signin mode and prefill email
        this.signupForm.reset({acceptTerms:false});
        this.invalidFields.set(null);
        this.router.navigate([], { queryParams: { mode: 'signin', email: payload.email } });
      },
      error: (err) => {
        const msg = err?.error?.message || err?.message || 'Signup failed';
        this.serverError.set(msg);
      }
    });
  }

  submitSignin(){
    this.serverError.set(null);
    this.successMessage.set(null);
    if (this.signinForm.invalid) { this.serverError.set('Please provide email and password.'); return; }
    const v = this.signinForm.value;
    this.auth.login(v).subscribe({
      next: (res:any) => {
        const token = res?.token;
        if (token) {
          // Save token (AuthService already stores it) and attempt to determine role
          let role = res?.user?.role || res?.role;

          // If role not present in response, try decode from JWT payload
          if (!role) {
            try {
              const parts = token.split('.');
              if (parts.length >= 2) {
                const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
                // common claim names: role, roles, authority, authorities
                role = payload.role || payload.roles || payload.authority || payload.authorities || null;
                // normalize arrays to single value if necessary
                if (Array.isArray(role) && role.length > 0) role = role[0];
              }
            } catch (e) { /* ignore decode errors */ }
          }

          const finalize = (r:any) => {
            const rr = String(r || '').toLowerCase();
            try { if (r) localStorage.setItem('auth_role', String(r)); else localStorage.removeItem('auth_role'); } catch(e) { }
            this.successMessage.set('Login successful');
            if (rr === 'candidat' || rr.includes('candidat')) this.router.navigate(['/dashboard']);
            else if (rr.includes('admin')) this.router.navigate(['/admin']);
            else this.router.navigate(['/']);
          };

          if (role) {
            finalize(role);
          } else {
            // attempt to obtain profile info from server
            this.auth.getProfile().subscribe({
              next: (profile:any) => { finalize(profile?.role || profile?.roles || profile?.authority || null); },
              error: () => { finalize(null); }
            });
          }
        } else {
          this.serverError.set('Login response missing token');
        }
      },
      error: (err) => {
        const msg = err?.error?.message || err?.message || 'Login failed';
        this.serverError.set(msg);
      }
    });
  }
}
