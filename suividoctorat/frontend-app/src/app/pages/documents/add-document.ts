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
  file: File | null = null;
  uploading = false;
  progress = 0;
  error: string | null = null;

  constructor(private http: HttpClient, private router: Router, private ts: ToastService) {}

  onFile(e: any){ this.file = e?.target?.files?.[0] || null; }

  submit(){
    this.error = null;
    if (!this.title || !this.file) { this.error = 'Title and file required'; return; }
    const fd = new FormData();
    fd.append('title', this.title);
    // backend expects 'category' param name
    fd.append('category', this.type);
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
