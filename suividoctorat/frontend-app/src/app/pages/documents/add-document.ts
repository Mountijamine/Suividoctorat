import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'add-document',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './add-document.html',
  styles: [
    `.wrap { max-width:720px; margin:1.25rem auto; padding:1rem }
    .field { margin-bottom:0.75rem }
    `
  ]
})
export class AddDocumentPage {
  title = '';
  type = 'rapport';
  categories: string[] = [];
  useCustom = false; // when true, user types free-form category
  file: File | null = null;
  uploading = false;
  progress = 0;
  error: string | null = null;

  constructor(private http: HttpClient, private router: Router, private ts: ToastService) {}

  ngOnInit(): void {
    // fetch existing categories for this user
    this.http.get<any>('/api/candidat/documents/categories').subscribe({
      next: (res) => { try { this.categories = res?.categories || []; if (this.categories.length === 0) this.categories = ['rapport','attestation','publication']; } catch(e){} },
      error: (err) => { console.debug('Could not load categories', err); this.categories = ['rapport','attestation','publication']; }
    });
  }

  onFile(e: any){ this.file = e?.target?.files?.[0] || null; }

  submit(){
    this.error = null;
    if (!this.title || !this.file) { this.error = 'Title and file required'; return; }
    const fd = new FormData();
    fd.append('title', this.title);
    // backend expects 'category' param name
  fd.append('category', this.useCustom ? this.type : this.type);
    fd.append('file', this.file as Blob, this.file!.name);
    this.uploading = true; this.progress = 0;
    // POST to candidate REST upload endpoint
    this.http.post('/api/candidat/documents/upload', fd, { reportProgress:true, observe: 'events' }).subscribe({
      next: (ev: HttpEvent<any>) => {
        if (ev.type === HttpEventType.UploadProgress && ev.total) {
          this.progress = Math.round(100 * (ev.loaded / ev.total));
        } else if (ev.type === HttpEventType.Response) {
          this.uploading = false; this.progress = 100; this.router.navigate(['/documents']);
          try { this.ts.success('Upload successful'); } catch(e){}
        }
      },
      error: (err) => { this.uploading = false; this.error = err?.error?.message || 'Upload failed'; console.error('Upload failed', err); try{ this.ts.error(this.error || 'Upload failed'); }catch(e){} }
    });
  }
}
