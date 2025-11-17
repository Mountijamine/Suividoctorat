import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PublicNavbarComponent } from '../../components/navbar/public-navbar';
import { UserNavbarComponent } from '../../components/navbar/user-navbar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'start-page',
  standalone: true,
  imports: [CommonModule, PublicNavbarComponent, UserNavbarComponent],
  templateUrl: './start-page.html',
  styles: [`
    :host { display:block }
    
    .landing { min-height:100vh; background:#f8fafc }
    
    /* Hero Section */
    .hero { position:relative; min-height:500px; display:flex; align-items:center; justify-content:center; background:url('/assets/start-banner.jpg') center/cover; overflow:hidden }
    .hero::before { content:''; position:absolute; inset:0; background:rgba(0,0,0,0.4) }
    .hero-overlay { position:absolute; inset:0; background:linear-gradient(135deg, rgba(30,64,175,0.7) 0%, rgba(59,130,246,0.6) 100%) }
    .hero-content { position:relative; z-index:2; text-align:center; max-width:800px; padding:2rem; color:white }
    .hero-title { font-size:3rem; font-weight:800; margin:0 0 1rem 0; letter-spacing:-0.02em; line-height:1.1 }
    .hero-subtitle { font-size:1.25rem; margin:0 0 2rem 0; opacity:0.95; line-height:1.6 }
    .hero-cta { display:flex; gap:1rem; justify-content:center; flex-wrap:wrap }
    
    /* Buttons */
    .btn-primary, .btn-secondary, .btn-cta { padding:0.875rem 2rem; border-radius:8px; font-weight:600; font-size:1rem; border:none; cursor:pointer; transition:all 0.2s ease }
    .btn-primary { background:white; color:#1e40af; box-shadow:0 4px 12px rgba(0,0,0,0.15) }
    .btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 20px rgba(0,0,0,0.2) }
    .btn-secondary { background:transparent; color:white; border:2px solid white }
    .btn-secondary:hover { background:rgba(255,255,255,0.1) }
    .btn-cta { background:#1e40af; color:white; box-shadow:0 4px 12px rgba(30,64,175,0.3); padding:1rem 2.5rem; font-size:1.125rem }
    .btn-cta:hover { background:#1e3a8a; transform:translateY(-2px); box-shadow:0 8px 20px rgba(30,64,175,0.4) }
    
    /* Features Section */
    .features { padding:5rem 2rem; background:white }
    .features-container { max-width:1200px; margin:0 auto }
    .section-title { text-align:center; font-size:2.5rem; font-weight:700; margin:0 0 3rem 0; color:#0f172a }
    .feature-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:2rem }
    .feature-card { padding:2rem; border-radius:12px; background:#f8fafc; border:1px solid #e2e8f0; transition:all 0.3s ease }
    .feature-card:hover { transform:translateY(-4px); box-shadow:0 12px 24px rgba(0,0,0,0.1); border-color:#3b82f6 }
    .feature-icon { width:64px; height:64px; border-radius:12px; background:linear-gradient(135deg, #3b82f6, #1e40af); color:white; display:flex; align-items:center; justify-content:center; margin-bottom:1.5rem }
    .feature-card h3 { font-size:1.25rem; font-weight:700; margin:0 0 0.75rem 0; color:#0f172a }
    .feature-card p { margin:0; color:#475569; line-height:1.6 }
    
    /* CTA Section */
    .cta-section { padding:5rem 2rem; background:linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%) }
    .cta-container { max-width:800px; margin:0 auto; text-align:center }
    .cta-container h2 { font-size:2.5rem; font-weight:700; margin:0 0 1rem 0; color:#0f172a }
    .cta-container p { font-size:1.125rem; color:#475569; margin:0 0 2rem 0 }
    
    /* Responsive */
    @media (max-width:768px) {
      .hero-title { font-size:2rem }
      .hero-subtitle { font-size:1rem }
      .section-title { font-size:1.75rem }
      .cta-container h2 { font-size:1.75rem }
      .hero-cta { flex-direction:column; align-items:stretch }
      .feature-grid { grid-template-columns:1fr }
    }
  `]
})
export class StartPage {
  constructor(private router: Router, public auth: AuthService) {}

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn ? this.auth.isLoggedIn() : false;
  }

  goToAuth(mode: 'signin'|'signup'){
    this.router.navigate(['/auth'], { queryParams: { mode } });
  }
}
