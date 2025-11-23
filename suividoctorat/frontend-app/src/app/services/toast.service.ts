import { Injectable, signal } from '@angular/core';

export type Toast = { id: number; kind: 'success' | 'error' | 'info'; message: string };

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _list = signal<Toast[]>([]);
  list = this._list.asReadonly();
  private idSeq = 1;

  show(kind: Toast['kind'], message: string, ttl = 4000) {
    const t: Toast = { id: this.idSeq++, kind, message };
    this._list.update(l => [...l, t]);
    setTimeout(() => this._list.update(l => l.filter(x => x.id !== t.id)), ttl);
  }
  success(message: string, ttl = 4000){ this.show('success', message, ttl); }
  error(message: string, ttl = 6000){ this.show('error', message, ttl); }
  info(message: string, ttl = 4000){ this.show('info', message, ttl); }
}
