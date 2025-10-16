import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'auth-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './auth.html',
  styles: [`
    .auth { display:flex; align-items:center; justify-content:center; height:100vh }
    .panel { width:360px; padding:1.5rem; border-radius:8px; box-shadow:0 6px 18px rgba(0,0,0,0.06) }
    .tabs { display:flex; gap:0.5rem; margin-bottom:1rem }
    .tabs button { flex:1; padding:0.5rem; border-radius:6px; border:0 }
    .error { color:#b00020; font-size:0.9rem }
    .success { color:green }
  `]
})
export class AuthPage {
  mode = signal<'signin'|'signup'>('signin');

  signupForm: any;
  signinForm: any;

  serverError = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  invalidFields = signal<string[] | null>(null);

  constructor(private route: ActivatedRoute, private router: Router, private fb: FormBuilder, private auth: AuthService){
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
      requestedProfile: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    });
    this.signinForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

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
      acceptTerms: String(v.acceptTerms),
      requestedProfile: v.requestedProfile
    };
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
          this.successMessage.set('Login successful');
          // navigate to home or dashboard
          this.router.navigate(['/']);
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
