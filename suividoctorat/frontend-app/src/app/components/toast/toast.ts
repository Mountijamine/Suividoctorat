import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div style="position:fixed; right:1rem; bottom:1rem; z-index:1200; display:flex; flex-direction:column; gap:0.5rem;">
    <div *ngFor="let t of toasts()" [ngClass]="t.kind" style="min-width:220px; padding:0.75rem 1rem; border-radius:8px; color:#fff; box-shadow:0 8px 20px rgba(2,6,23,0.08);">
      <strong *ngIf="t.kind === 'success'">✔ </strong>
      <strong *ngIf="t.kind === 'error'">✖ </strong>
      <span>{{t.message}}</span>
    </div>
  </div>
  `
})
export class ToastComponent {
  toasts: any;
  constructor(private ts: ToastService){ this.toasts = this.ts.list; }
}
