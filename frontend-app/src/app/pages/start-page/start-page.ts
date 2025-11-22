import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PublicNavbarComponent } from '../../components/navbar/public-navbar';
import { UserNavbarComponent } from '../../components/navbar/user-navbar';
import { AuthService } from '../../services/auth.service';

interface Campaign {
  id: string;
  title: string;
  description: string;
  university: string;
  universityLogo: string;
  bannerUrl: string;
  domain: string;
  status: 'open' | 'closing-soon' | 'closed';
  funding: boolean;
}

@Component({
  selector: 'start-page',
  standalone: true,
  imports: [CommonModule, RouterLink, PublicNavbarComponent, UserNavbarComponent],
  templateUrl: './start-page.html',
  styles: [`
    :host { display:block }
    
    /* Global Dark Mode Support */
    .landing { min-height:100vh; background:#ffffff; transition:background 0.3s ease; overflow-x:hidden }
    :host-context(.dark) .landing { background:#000000 }
    
    /* Hero Section - use supplied banner image */
    .hero { position:relative; min-height:100vh; display:flex; align-items:center; justify-content:center; background:none; overflow:hidden }
    .hero-bg-gradient { position:absolute; inset:0; background-image: url('/assets/start-banner.jpg'); background-size:cover; background-position:center center; background-repeat:no-repeat; filter:contrast(0.95) saturate(1.03); opacity:1; }
    @keyframes gradientShift { 0%, 100% { transform:scale(1) rotate(0deg) } 50% { transform:scale(1.1) rotate(5deg) } }
    /* particles removed when using a photographic banner - keep for future use */
    .hero-particles { display:none }
    @keyframes particlesFloat { 0%, 100% { background-position:0% 0% } 50% { background-position:100% 100% } }
    /* subtle dark-blue filter for photographic banner to improve text contrast */
    .hero-overlay { position:absolute; inset:0; background:linear-gradient(180deg, rgba(2,10,36,0.18), rgba(2,10,36,0.32)); mix-blend-mode:multiply; pointer-events:none }
    :host-context(.dark) .hero { background:linear-gradient(135deg, #1a1a2e 0%, #16213e 100%) }
    .hero-content { position:relative; z-index:2; text-align:center; max-width:920px; padding:0 24px }
    .hero-badge { display:inline-block; padding:8px 20px; background:rgba(255,255,255,0.15); backdrop-filter:blur(10px); border-radius:100px; color:#ffffff; font-size:0.875rem; font-weight:500; letter-spacing:0.5px; margin-bottom:24px; border:1px solid rgba(255,255,255,0.2); animation:fadeInUp 0.6s ease }
    @keyframes fadeInUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
    .hero-title { font-size:5rem; font-weight:800; line-height:1.1; letter-spacing:-0.05em; color:#ffffff; margin:0 0 24px; font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',system-ui,sans-serif; animation:fadeInUp 0.8s ease 0.2s both }
    /* replace warm orange gradient with dark-blue gradient per request */
    .gradient-text { background:linear-gradient(135deg, #092e6f 0%, #1e3a8a 50%, #2563eb 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation:gradientFlow 3s ease infinite; background-size:200% 200% }
    @keyframes gradientFlow { 0%, 100% { background-position:0% 50% } 50% { background-position:100% 50% } }
    .hero-subtitle { font-size:1.375rem; line-height:1.6; color:rgba(255,255,255,0.95); margin:0 0 48px; font-weight:400; max-width:720px; margin-left:auto; margin-right:auto; animation:fadeInUp 1s ease 0.4s both }
    .hero-cta { display:flex; gap:16px; justify-content:center; align-items:center; margin-bottom:64px; animation:fadeInUp 1.2s ease 0.6s both; flex-wrap:wrap }
    .hero-stats { display:flex; gap:48px; justify-content:center; align-items:center; animation:fadeInUp 1.4s ease 0.8s both; flex-wrap:wrap }
    .stat-item { text-align:center }
    .stat-number { font-size:2.5rem; font-weight:700; color:#ffffff; margin-bottom:4px }
    .stat-label { font-size:0.875rem; color:rgba(255,255,255,0.8); text-transform:uppercase; letter-spacing:1px }
    .stat-divider { width:1px; height:48px; background:rgba(255,255,255,0.2) }
    
    /* Buttons - Enhanced Futuristic Style */
    .btn-primary, .btn-secondary, .btn-cta, .btn-cta-secondary { padding:0.875rem 2.25rem; border-radius:980px; font-weight:600; font-size:1.0625rem; border:none; cursor:pointer; transition:all 0.3s cubic-bezier(0.4,0,0.2,1); font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',Roboto,sans-serif; display:inline-flex; align-items:center; gap:8px }
    .btn-primary { background:rgba(255,255,255,0.95); color:#1e40af; box-shadow:0 4px 16px rgba(0,0,0,0.12); backdrop-filter:blur(20px) }
    .btn-primary:hover { background:rgba(255,255,255,1); transform:translateY(-2px) scale(1.02); box-shadow:0 8px 24px rgba(0,0,0,0.18) }
    .btn-secondary { background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.98); border:1.5px solid rgba(255,255,255,0.2); backdrop-filter:blur(20px) }
    .btn-secondary:hover { background:rgba(255,255,255,0.14); border-color:rgba(255,255,255,0.3); transform:translateY(-1px) }
    .btn-cta { background:linear-gradient(135deg, #3b82f6, #2563eb); color:white; box-shadow:0 4px 16px rgba(59,130,246,0.3); padding:1.125rem 2.75rem; font-size:1.1875rem }
    .btn-cta:hover { transform:translateY(-2px) scale(1.02); box-shadow:0 8px 24px rgba(59,130,246,0.4) }
    .btn-cta-secondary { background:rgba(255,255,255,0.12); color:white; border:1.5px solid rgba(255,255,255,0.25); backdrop-filter:blur(10px); padding:1.125rem 2.75rem; font-size:1.1875rem }
    .btn-cta-secondary:hover { background:rgba(255,255,255,0.18); border-color:rgba(255,255,255,0.35); transform:translateY(-1px) }
    :host-context(.dark) .btn-primary { background:rgba(255,255,255,0.92); color:#0f172a }
    :host-context(.dark) .btn-cta { background:linear-gradient(135deg, #3b82f6, #60a5fa); box-shadow:0 4px 16px rgba(59,130,246,0.4) }
    :host-context(.dark) .btn-cta:hover { box-shadow:0 8px 24px rgba(59,130,246,0.5) }
    
    /* Stats Section */
    .stats-section { padding:6rem 2rem; background:linear-gradient(180deg, #f9fafb 0%, #ffffff 100%); border-top:1px solid rgba(0,0,0,0.05) }
    :host-context(.dark) .stats-section { background:linear-gradient(180deg, #0a0a0a 0%, #000000 100%); border-top:1px solid rgba(255,255,255,0.05) }
    .stats-container { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:2rem }
    .stat-card { text-align:center; padding:2.5rem 1.5rem; background:rgba(255,255,255,0.6); backdrop-filter:blur(20px); border-radius:24px; border:1px solid rgba(0,0,0,0.06); transition:all 0.4s cubic-bezier(0.4,0,0.2,1); box-shadow:0 4px 12px rgba(0,0,0,0.03) }
    .stat-card:hover { transform:translateY(-8px); box-shadow:0 12px 32px rgba(0,0,0,0.08); border-color:rgba(59,130,246,0.2) }
    :host-context(.dark) .stat-card { background:rgba(255,255,255,0.04); border-color:rgba(255,255,255,0.08); box-shadow:0 4px 12px rgba(0,0,0,0.3) }
    :host-context(.dark) .stat-card:hover { box-shadow:0 12px 32px rgba(0,0,0,0.5); border-color:rgba(59,130,246,0.3) }
    .stat-icon { width:64px; height:64px; margin:0 auto 1.5rem; border-radius:18px; background:linear-gradient(135deg, #3b82f6, #8b5cf6); color:white; display:flex; align-items:center; justify-content:center; box-shadow:0 8px 20px rgba(59,130,246,0.25) }
    .stat-value { font-size:3rem; font-weight:700; margin-bottom:0.5rem; background:linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text }
    .stat-desc { font-size:1rem; color:#6e6e73; font-weight:500 }
    :host-context(.dark) .stat-desc { color:#a1a1a6 }
    
    /* Section Headers */
    .section-header { text-align:center; margin-bottom:4rem }
    .section-badge { display:inline-block; padding:6px 18px; background:linear-gradient(135deg, #3b82f6, #8b5cf6); color:white; border-radius:100px; font-size:0.8125rem; font-weight:600; letter-spacing:0.5px; margin-bottom:1rem; text-transform:uppercase }
    .section-title { font-size:3rem; font-weight:700; margin:0 0 1rem; color:#1d1d1f; letter-spacing:-0.02em; font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif; transition:color 0.3s ease }
    :host-context(.dark) .section-title { color:#f5f5f7 }
    .section-subtitle { font-size:1.25rem; color:#6e6e73; margin:0; max-width:640px; margin-left:auto; margin-right:auto }
    :host-context(.dark) .section-subtitle { color:#a1a1a6 }
    
    /* How It Works Section */
    .how-it-works { padding:7rem 2rem; background:#ffffff; position:relative; overflow:hidden }
    .how-it-works::before { content:''; position:absolute; top:0; left:50%; width:1px; height:100%; background:linear-gradient(180deg, transparent, rgba(59,130,246,0.2), transparent); transform:translateX(-50%) }
    :host-context(.dark) .how-it-works { background:#000000 }
    :host-context(.dark) .how-it-works::before { background:linear-gradient(180deg, transparent, rgba(59,130,246,0.3), transparent) }
    .how-container { max-width:900px; margin:0 auto }
    .timeline { display:flex; flex-direction:column; gap:3rem; position:relative }
    .timeline-item { display:flex; align-items:center; gap:2rem; position:relative }
    .timeline-marker { width:80px; height:80px; border-radius:50%; background:linear-gradient(135deg, #3b82f6, #8b5cf6); color:white; display:flex; align-items:center; justify-content:center; font-size:2rem; font-weight:700; box-shadow:0 8px 24px rgba(59,130,246,0.3); flex-shrink:0; z-index:2 }
    .timeline-content { flex:1; padding:2rem; background:rgba(249,250,251,0.8); backdrop-filter:blur(10px); border-radius:20px; border:1px solid rgba(0,0,0,0.06); transition:all 0.3s ease }
    .timeline-content:hover { transform:translateX(8px); box-shadow:0 8px 24px rgba(0,0,0,0.08); border-color:rgba(59,130,246,0.2) }
    :host-context(.dark) .timeline-content { background:rgba(28,28,30,0.8); border-color:rgba(255,255,255,0.08) }
    :host-context(.dark) .timeline-content:hover { box-shadow:0 8px 24px rgba(0,0,0,0.4); border-color:rgba(59,130,246,0.3) }
    .timeline-content h3 { font-size:1.5rem; font-weight:700; margin:0 0 0.75rem; color:#1d1d1f }
    :host-context(.dark) .timeline-content h3 { color:#f5f5f7 }
    .timeline-content p { margin:0; color:#6e6e73; line-height:1.6; font-size:1.0625rem }
    :host-context(.dark) .timeline-content p { color:#a1a1a6 }
    .timeline-connector { height:3rem; width:1px; background:rgba(59,130,246,0.2); margin:0 auto 0 39px }
    
    /* Features Section - Enhanced with Glowing Effects */
    .features { padding:6rem 2rem 7rem; background:linear-gradient(180deg, #ffffff 0%, #f9fafb 100%); transition:background 0.3s ease; position:relative }
    .features::before { content:''; position:absolute; top:20%; right:10%; width:500px; height:500px; background:radial-gradient(circle, rgba(59,130,246,0.08), transparent 70%); border-radius:50%; pointer-events:none }
    :host-context(.dark) .features { background:linear-gradient(180deg, #000000 0%, #0a0a0a 100%) }
    :host-context(.dark) .features::before { background:radial-gradient(circle, rgba(59,130,246,0.15), transparent 70%) }
    .features-container { max-width:1200px; margin:0 auto; position:relative; z-index:1 }
    .feature-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:2.5rem }
    .feature-card { padding:2.5rem 2rem; border-radius:24px; background:#ffffff; border:1px solid rgba(0,0,0,0.04); transition:all 0.4s cubic-bezier(0.4,0,0.2,1); box-shadow:0 2px 8px rgba(0,0,0,0.04); position:relative; overflow:hidden }
    .feature-card:hover { transform:translateY(-8px); box-shadow:0 20px 40px rgba(0,0,0,0.1); border-color:rgba(59,130,246,0.2) }
    .feature-glow { position:absolute; top:0; left:0; right:0; height:4px; background:linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899); opacity:0; transition:opacity 0.4s ease }
    .feature-card:hover .feature-glow { opacity:1 }
    :host-context(.dark) .feature-card { background:#1c1c1e; border-color:rgba(255,255,255,0.08); box-shadow:0 2px 8px rgba(0,0,0,0.3) }
    :host-context(.dark) .feature-card:hover { box-shadow:0 20px 40px rgba(0,0,0,0.6); border-color:rgba(59,130,246,0.3) }
    .feature-icon { width:56px; height:56px; border-radius:14px; background:linear-gradient(135deg, #3b82f6, #8b5cf6); color:white; display:flex; align-items:center; justify-content:center; margin-bottom:1.5rem; box-shadow:0 4px 12px rgba(59,130,246,0.25) }
    :host-context(.dark) .feature-icon { background:linear-gradient(135deg, #60a5fa, #a78bfa); box-shadow:0 4px 12px rgba(59,130,246,0.35) }
    .feature-card h3 { font-size:1.375rem; font-weight:700; margin:0 0 0.875rem; color:#1d1d1f; letter-spacing:-0.01em; transition:color 0.3s ease }
    :host-context(.dark) .feature-card h3 { color:#f5f5f7 }
    .feature-card p { margin:0 0 1rem; color:#6e6e73; line-height:1.6; font-size:1.0625rem; transition:color 0.3s ease }
    :host-context(.dark) .feature-card p { color:#a1a1a6 }
    .feature-link { color:#3b82f6; font-weight:600; font-size:0.9375rem; text-decoration:none; transition:color 0.3s ease }
    .feature-link:hover { color:#2563eb }
    :host-context(.dark) .feature-link { color:#60a5fa }
    :host-context(.dark) .feature-link:hover { color:#93c5fd }
    
    /* Testimonials Section */
    .testimonials { padding:7rem 2rem; background:linear-gradient(180deg, #f9fafb 0%, #ffffff 100%); position:relative }
    .testimonials::after { content:''; position:absolute; bottom:20%; left:5%; width:400px; height:400px; background:radial-gradient(circle, rgba(139,92,246,0.06), transparent 70%); border-radius:50%; pointer-events:none }
    :host-context(.dark) .testimonials { background:linear-gradient(180deg, #0a0a0a 0%, #000000 100%) }
    :host-context(.dark) .testimonials::after { background:radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%) }
    .testimonials-container { max-width:1200px; margin:0 auto; position:relative; z-index:1 }
    .testimonials-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:2rem }
    .testimonial-card { padding:2.5rem; background:rgba(255,255,255,0.8); backdrop-filter:blur(20px); border-radius:24px; border:1px solid rgba(0,0,0,0.06); transition:all 0.4s ease; box-shadow:0 4px 16px rgba(0,0,0,0.04) }
    .testimonial-card:hover { transform:translateY(-6px); box-shadow:0 12px 32px rgba(0,0,0,0.1); border-color:rgba(59,130,246,0.2) }
    :host-context(.dark) .testimonial-card { background:rgba(28,28,30,0.8); border-color:rgba(255,255,255,0.08); box-shadow:0 4px 16px rgba(0,0,0,0.3) }
    :host-context(.dark) .testimonial-card:hover { box-shadow:0 12px 32px rgba(0,0,0,0.5); border-color:rgba(59,130,246,0.3) }
    .testimonial-stars { color:#fbbf24; font-size:1.25rem; margin-bottom:1.25rem }
    .testimonial-text { font-size:1.125rem; line-height:1.7; color:#1d1d1f; margin:0 0 2rem; font-style:italic }
    :host-context(.dark) .testimonial-text { color:#f5f5f7 }
    .testimonial-author { display:flex; align-items:center; gap:1rem }
    .author-avatar { width:48px; height:48px; border-radius:50%; background:linear-gradient(135deg, #3b82f6, #8b5cf6); color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:1rem }
    .author-name { font-weight:700; color:#1d1d1f; margin-bottom:2px }
    :host-context(.dark) .author-name { color:#f5f5f7 }
    .author-title { font-size:0.875rem; color:#6e6e73 }
    :host-context(.dark) .author-title { color:#a1a1a6 }
    
    /* FAQ Section */
    .faq { padding:7rem 2rem; background:#ffffff }
    :host-context(.dark) .faq { background:#000000 }
    .faq-container { max-width:1000px; margin:0 auto }
    .faq-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:2rem }
    .faq-item { padding:2rem; background:#f9fafb; border-radius:20px; border:1px solid rgba(0,0,0,0.05); transition:all 0.3s ease }
    .faq-item:hover { background:#ffffff; box-shadow:0 8px 24px rgba(0,0,0,0.06); border-color:rgba(59,130,246,0.15) }
    :host-context(.dark) .faq-item { background:#1c1c1e; border-color:rgba(255,255,255,0.06) }
    :host-context(.dark) .faq-item:hover { background:#2a2a2e; box-shadow:0 8px 24px rgba(0,0,0,0.4); border-color:rgba(59,130,246,0.2) }
    .faq-item h3 { font-size:1.125rem; font-weight:700; margin:0 0 0.75rem; color:#1d1d1f }
    :host-context(.dark) .faq-item h3 { color:#f5f5f7 }
    .faq-item p { margin:0; color:#6e6e73; line-height:1.6; font-size:1rem }
    :host-context(.dark) .faq-item p { color:#a1a1a6 }
    
    /* CTA Section - Futuristic with Gradient Background */
    .cta-section { padding:8rem 2rem; background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); position:relative; overflow:hidden }
    .cta-bg-gradient { position:absolute; inset:0; background:radial-gradient(circle at 70% 30%, rgba(236,72,153,0.3), transparent 60%), radial-gradient(circle at 30% 70%, rgba(59,130,246,0.3), transparent 60%); animation:ctaGlow 10s ease infinite }
    @keyframes ctaGlow { 0%, 100% { opacity:0.5 } 50% { opacity:0.8 } }
    :host-context(.dark) .cta-section { background:linear-gradient(135deg, #1a1a2e 0%, #16213e 100%) }
    .cta-container { max-width:840px; margin:0 auto; text-align:center; position:relative; z-index:1 }
    .cta-badge { display:inline-block; padding:8px 20px; background:rgba(255,255,255,0.15); backdrop-filter:blur(10px); border-radius:100px; color:#ffffff; font-size:0.875rem; font-weight:600; letter-spacing:0.5px; margin-bottom:1.5rem; border:1px solid rgba(255,255,255,0.2) }
    .cta-container h2 { font-size:3.5rem; font-weight:700; margin:0 0 1.5rem; color:#ffffff; letter-spacing:-0.025em; line-height:1.08; font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif }
    .cta-container p { font-size:1.375rem; color:rgba(255,255,255,0.95); margin:0 0 3rem; font-weight:400; line-height:1.5 }
    .cta-buttons { display:flex; gap:1.25rem; justify-content:center; margin-bottom:2.5rem; flex-wrap:wrap }
    .cta-trust { display:flex; align-items:center; justify-content:center; gap:0.75rem; color:rgba(255,255,255,0.9); font-size:0.9375rem }
    
    /* Campaigns Showcase Section */
    .campaigns-showcase { padding:6rem 2rem; background:#ffffff; position:relative }
    :host-context(.dark) .campaigns-showcase { background:#000000 }
    .campaigns-showcase-container { max-width:1200px; margin:0 auto }
    .campaigns-showcase-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(340px, 1fr)); gap:2rem; margin-bottom:3rem }
    
    .campaign-showcase-card { background:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 4px 16px rgba(0,0,0,0.06); transition:all 0.3s ease; border:1px solid rgba(0,0,0,0.04) }
    .campaign-showcase-card:hover { transform:translateY(-6px); box-shadow:0 12px 32px rgba(0,0,0,0.12) }
    :host-context(.dark) .campaign-showcase-card { background:#1c1c1e; border-color:rgba(255,255,255,0.08); box-shadow:0 4px 16px rgba(0,0,0,0.3) }
    :host-context(.dark) .campaign-showcase-card:hover { box-shadow:0 12px 32px rgba(0,0,0,0.5) }
    
    .campaign-showcase-banner { position:relative; height:180px; overflow:hidden }
    .campaign-showcase-banner .banner-img { width:100%; height:100%; object-fit:cover; transition:transform 0.4s ease }
    .campaign-showcase-card:hover .banner-img { transform:scale(1.05) }
    .banner-overlay { position:absolute; inset:0; background:linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.3)); display:flex; align-items:flex-start; justify-content:flex-end; padding:1rem }
    .campaign-showcase-status { padding:0.375rem 0.875rem; border-radius:999px; font-size:0.75rem; font-weight:600; backdrop-filter:blur(12px) }
    .campaign-showcase-status.status-open { background:rgba(16,185,129,0.9); color:white }
    .campaign-showcase-status.status-closing-soon { background:rgba(245,158,11,0.9); color:white }
    .campaign-showcase-status.status-closed { background:rgba(107,114,128,0.9); color:white }
    
    .university-showcase-logo { position:absolute; top:140px; left:1.5rem; z-index:2; width:80px; height:80px; background:white; border-radius:16px; padding:8px; box-shadow:0 4px 12px rgba(0,0,0,0.1) }
    .university-showcase-logo .logo-img { width:100%; height:100%; object-fit:contain }
    
    .campaign-showcase-content { padding:3rem 1.5rem 1.5rem }
    .campaign-showcase-title { font-size:1.25rem; font-weight:700; color:#0f172a; margin:0 0 0.75rem; line-height:1.4 }
    :host-context(.dark) .campaign-showcase-title { color:#f5f5f7 }
    .campaign-showcase-meta { display:flex; gap:1rem; flex-wrap:wrap; margin-bottom:1rem }
    .campaign-showcase-meta .meta-item { display:flex; align-items:center; gap:0.375rem; font-size:0.8125rem; color:#64748b }
    :host-context(.dark) .campaign-showcase-meta .meta-item { color:#a1a1a6 }
    .campaign-showcase-meta .meta-item svg { color:#94a3b8 }
    .campaign-showcase-description { font-size:0.9375rem; color:#475569; line-height:1.6; margin:0 0 1rem; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden }
    :host-context(.dark) .campaign-showcase-description { color:#a1a1a6 }
    .campaign-showcase-tags { display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:1.5rem }
    .campaign-showcase-tags .tag { padding:0.375rem 0.75rem; background:#eff6ff; color:#1d4ed8; border-radius:8px; font-size:0.75rem; font-weight:600 }
    :host-context(.dark) .campaign-showcase-tags .tag { background:rgba(59,130,246,0.2); color:#60a5fa }
    .campaign-showcase-footer { display:flex; gap:0.75rem }
    
    .btn-campaign-primary { flex:1; padding:0.75rem 1.25rem; background:#2563eb; color:white; border:none; border-radius:12px; font-size:0.9375rem; font-weight:600; cursor:pointer; transition:all 0.2s ease; display:flex; align-items:center; justify-content:center; gap:0.5rem }
    .btn-campaign-primary:hover { background:#1d4ed8; transform:translateY(-1px); box-shadow:0 4px 12px rgba(37,99,235,0.3) }
    :host-context(.dark) .btn-campaign-primary { background:#3b82f6 }
    :host-context(.dark) .btn-campaign-primary:hover { background:#2563eb }
    
    .campaigns-cta { text-align:center }
    .btn-view-all { padding:1rem 2.5rem; background:linear-gradient(135deg, #3b82f6, #2563eb); color:white; border:none; border-radius:12px; font-size:1.0625rem; font-weight:600; cursor:pointer; transition:all 0.3s ease; display:inline-flex; align-items:center; gap:0.75rem; box-shadow:0 4px 16px rgba(59,130,246,0.3) }
    .btn-view-all:hover { transform:translateY(-2px) scale(1.02); box-shadow:0 8px 24px rgba(59,130,246,0.4) }
    :host-context(.dark) .btn-view-all { background:linear-gradient(135deg, #3b82f6, #60a5fa) }
    
    /* Responsive - Enhanced */
    @media (max-width:1024px){
      .hero-title { font-size:4rem }
      .section-title { font-size:2.5rem }
      .cta-container h2 { font-size:2.75rem }
      .stat-card { padding:2rem 1.25rem }
      .timeline-item { flex-direction:column; align-items:flex-start }
      .timeline-marker { margin-bottom:1rem }
      .timeline-connector { display:none }
    }
    @media (max-width:768px) {
      .hero { min-height:90vh; padding:2rem 0 }
      .hero-title { font-size:2.75rem; letter-spacing:-0.03em }
      .hero-subtitle { font-size:1.125rem }
      .hero-stats { gap:24px }
      .stat-number { font-size:2rem }
      .stat-label { font-size:0.75rem }
      .stat-divider { display:none }
      .section-title { font-size:2rem }
      .cta-container h2 { font-size:2rem }
      .cta-container p { font-size:1.125rem }
      .hero-cta, .cta-buttons { flex-direction:column; align-items:center; gap:1rem }
      .btn-primary, .btn-secondary, .btn-cta, .btn-cta-secondary { min-width:280px }
      .feature-grid, .testimonials-grid, .faq-grid { grid-template-columns:1fr; gap:2rem }
      .stats-container { grid-template-columns:1fr }
      .features, .testimonials, .faq, .how-it-works { padding:4rem 1.5rem 5rem }
      .cta-section { padding:5rem 1.5rem }
      .features::before, .testimonials::after { width:300px; height:300px }
    }
    @media (max-width:480px) {
      .hero-title { font-size:2rem }
      .hero-subtitle { font-size:1rem }
      .hero-badge { font-size:0.75rem; padding:6px 16px }
      .section-title { font-size:1.75rem }
      .cta-container h2 { font-size:1.75rem }
      .btn-cta, .btn-cta-secondary { padding:1rem 2rem; font-size:1.0625rem }
      .stat-number { font-size:1.75rem }
      .stat-icon { width:48px; height:48px }
      .stat-value { font-size:2.25rem }
      .timeline-marker { width:60px; height:60px; font-size:1.5rem }
      .feature-card, .testimonial-card, .faq-item { padding:1.75rem }
    }

    /* About Section */
    .about-section { padding:7rem 2rem; background:#ffffff; position:relative; overflow:hidden }
    :host-context(.dark) .about-section { background:#000000 }
    .about-container { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:1fr 1fr; gap:4rem; align-items:center }
    .about-content { max-width:540px }
    .about-text { font-size:1.125rem; line-height:1.7; color:#475569; margin-bottom:2.5rem }
    :host-context(.dark) .about-text { color:#a1a1a6 }
    .about-stats { display:flex; gap:2.5rem; margin-bottom:3rem; border-top:1px solid #e2e8f0; padding-top:2rem }
    :host-context(.dark) .about-stats { border-color:rgba(255,255,255,0.1) }
    .about-stat { display:flex; flex-direction:column }
    .about-stat strong { font-size:2rem; font-weight:800; color:#1e40af; line-height:1 }
    :host-context(.dark) .about-stat strong { color:#60a5fa }
    .about-stat span { font-size:0.875rem; color:#64748b; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; margin-top:0.5rem }
    :host-context(.dark) .about-stat span { color:#94a3b8 }
    
    .about-features { display:grid; gap:2rem }
    .about-feat { display:flex; gap:1rem }
    .feat-icon { width:48px; height:48px; border-radius:12px; background:#eff6ff; color:#2563eb; display:flex; align-items:center; justify-content:center; flex-shrink:0 }
    :host-context(.dark) .feat-icon { background:rgba(37,99,235,0.2); color:#60a5fa }
    .about-feat h4 { font-size:1.125rem; font-weight:700; margin:0 0 0.5rem; color:#0f172a }
    :host-context(.dark) .about-feat h4 { color:#f1f5f9 }
    .about-feat p { font-size:0.95rem; color:#64748b; margin:0; line-height:1.5 }
    :host-context(.dark) .about-feat p { color:#94a3b8 }

    .about-image { position:relative; height:500px; border-radius:24px; overflow:hidden; background:#f1f5f9; display:flex; align-items:center; justify-content:center }
    :host-context(.dark) .about-image { background:#1e293b }
    .about-image img { width:100%; height:100%; object-fit:cover }
    .about-placeholder { width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:#cbd5e1 }
    .about-icon-bg { width:200px; height:200px; opacity:0.1 }

    .about-visual { position:relative; height:500px; width:100% }
    .visual-card { position:absolute; background:#fff; border-radius:16px; box-shadow:0 20px 40px -5px rgba(0,0,0,0.1); border:1px solid #e2e8f0; overflow:hidden }
    :host-context(.dark) .visual-card { background:#1e293b; border-color:#334155; box-shadow:0 20px 40px -5px rgba(0,0,0,0.4) }
    .visual-card.main { top:0; left:0; right:40px; bottom:40px; padding:1.5rem; display:flex; flex-direction:column }
    .visual-card.float { bottom:0; right:0; width:220px; padding:1.25rem; display:flex; align-items:center; gap:1rem; animation:float 6s ease-in-out infinite }
    @keyframes float { 0%, 100% { transform:translateY(0) } 50% { transform:translateY(-10px) } }
    
    .vc-header { display:flex; gap:6px; margin-bottom:2rem }
    .vc-dot { width:10px; height:10px; border-radius:50% }
    .vc-dot.red { background:#ef4444 }
    .vc-dot.yellow { background:#f59e0b }
    .vc-dot.green { background:#22c55e }
    
    .vc-body { flex:1; display:flex; flex-direction:column; gap:1.5rem }
    .vc-line { height:8px; background:#f1f5f9; border-radius:4px }
    :host-context(.dark) .vc-line { background:#334155 }
    .vc-line.w-75 { width:75% }
    .vc-line.w-50 { width:50% }
    .vc-graph { flex:1; display:flex; align-items:flex-end; justify-content:space-between; padding-top:1rem; gap:1rem }
    .bar { width:100%; background:#eff6ff; border-radius:8px 8px 0 0; position:relative; overflow:hidden }
    :host-context(.dark) .bar { background:rgba(37,99,235,0.1) }
    .bar::after { content:''; position:absolute; bottom:0; left:0; right:0; height:0; background:#3b82f6; transition:height 1s ease; animation:grow 2s ease forwards }
    .bar:nth-child(1)::after { height:40%; animation-delay:0.2s }
    .bar:nth-child(2)::after { height:70%; animation-delay:0.4s }
    .bar:nth-child(3)::after { height:55%; animation-delay:0.6s }
    .bar:nth-child(4)::after { height:85%; animation-delay:0.8s }
    @keyframes grow { from { height:0 } }

    .vc-icon { width:40px; height:40px; border-radius:10px; background:#ecfdf5; color:#059669; display:flex; align-items:center; justify-content:center }
    :host-context(.dark) .vc-icon { background:rgba(16,185,129,0.2); color:#34d399 }
    .vc-text { display:flex; flex-direction:column; font-size:0.8rem }
    .vc-text strong { color:#0f172a }
    :host-context(.dark) .vc-text strong { color:#f1f5f9 }
    .vc-text span { color:#64748b }

    /* Footer */
    .footer { background:#f8fafc; padding:4rem 2rem 2rem; border-top:1px solid #e2e8f0 }
    :host-context(.dark) .footer { background:#0f172a; border-color:#1e293b }
    .footer-content { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:3rem; margin-bottom:3rem }
    .footer-brand h3 { font-size:1.5rem; font-weight:800; margin:0 0 1rem; color:#1e40af }
    :host-context(.dark) .footer-brand h3 { color:#60a5fa }
    .footer-brand p { color:#64748b; line-height:1.6; font-size:0.95rem }
    :host-context(.dark) .footer-brand p { color:#94a3b8 }
    .footer-col h4 { font-size:0.95rem; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#0f172a; margin:0 0 1.25rem }
    :host-context(.dark) .footer-col h4 { color:#f1f5f9 }
    .footer-links { display:flex; flex-direction:column; gap:0.75rem }
    .footer-links a { color:#64748b; text-decoration:none; font-size:0.95rem; transition:color 0.2s }
    .footer-links a:hover { color:#2563eb }
    :host-context(.dark) .footer-links a { color:#94a3b8 }
    :host-context(.dark) .footer-links a:hover { color:#60a5fa }
    .footer-bottom { max-width:1200px; margin:0 auto; padding-top:2rem; border-top:1px solid #e2e8f0; text-align:center; color:#94a3b8; font-size:0.875rem }
    :host-context(.dark) .footer-bottom { border-color:#1e293b }

    @media (max-width: 900px) {
      .about-container { grid-template-columns:1fr }
      .about-image { height:300px }
    }
  `]
})
export class StartPage implements OnInit {
  featuredCampaigns: Campaign[] = [];

  constructor(private router: Router, public auth: AuthService) {}

  ngOnInit() {
    this.loadFeaturedCampaigns();
    // If user is logged in with role USER, redirect to profile selection
    if (this.isLoggedIn) {
      const role = this.auth.role ? this.auth.role() : null;
      const roleStr = String(role || '').toLowerCase();
      
      // Redirect to profile selection if user has no specific role yet
      if (roleStr === 'user' || roleStr === 'role_user' || !roleStr || roleStr === 'null') {
        console.log('[StartPage] User has role USER, redirecting to profile selection');
        this.router.navigate(['/profile-selection']);
      }
    }
  }

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn ? this.auth.isLoggedIn() : false;
  }

  loadFeaturedCampaigns() {
    // Load 3 featured campaigns for homepage
    this.featuredCampaigns = [
      {
        id: '1',
        title: 'Intelligence Artificielle et Apprentissage Profond',
        description: 'Recherche avancée en IA avec focus sur les réseaux de neurones profonds et l\'apprentissage par renforcement. Opportunité de publier dans des conférences de premier plan.',
        university: 'Université Mohammed V',
        universityLogo: 'https://via.placeholder.com/80x80/3b82f6/ffffff?text=UM5',
        bannerUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop',
        domain: 'Informatique',
        status: 'open',
        funding: true
      },
      {
        id: '2',
        title: 'Médecine de Précision et Génomique',
        description: 'Programme doctoral en médecine personnalisée utilisant des approches génomiques modernes. Collaboration avec des hôpitaux universitaires de renommée internationale.',
        university: 'Université Hassan II Casablanca',
        universityLogo: 'https://via.placeholder.com/80x80/10b981/ffffff?text=UH2',
        bannerUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&h=400&fit=crop',
        domain: 'Médecine',
        status: 'closing-soon',
        funding: true
      },
      {
        id: '3',
        title: 'Énergies Renouvelables et Développement Durable',
        description: 'Recherche sur les technologies solaires et éoliennes appliquées au contexte africain. Projet financé par l\'Union Européenne avec équipements de pointe.',
        university: 'Université Cadi Ayyad',
        universityLogo: 'https://via.placeholder.com/80x80/f59e0b/ffffff?text=UCA',
        bannerUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=400&fit=crop',
        domain: 'Ingénierie',
        status: 'open',
        funding: true
      }
    ];
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'open': 'Ouverte',
      'closing-soon': 'Clôture bientôt',
      'closed': 'Fermée'
    };
    return labels[status] || status;
  }

  goToAuth(mode: 'signin'|'signup'){
    this.router.navigate(['/auth'], { queryParams: { mode } });
  }
}
