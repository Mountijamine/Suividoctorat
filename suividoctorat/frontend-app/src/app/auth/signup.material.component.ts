import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-signup-material',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCheckboxModule],
  templateUrl: './signup.material.component.html',
})
export class SignupMaterialComponent {
  model: any = { email: '', password: '', confirmPassword: '', firstName: '', lastName: '', phone: '', acceptTerms: false };
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    this.loading = true;
    this.error = '';
    this.auth.signup(this.model).subscribe({
      next: () => { this.loading = false; this.router.navigate(['/login']); },
      error: (err) => { this.loading = false; this.error = err?.error?.message || 'Signup failed'; }
    });
  }
}
