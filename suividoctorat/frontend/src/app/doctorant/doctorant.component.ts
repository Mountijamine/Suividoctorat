import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-doctorant',
  templateUrl: './doctorant.component.html',
  styleUrls: ['./doctorant.component.css']
})
export class DoctorantComponent implements OnInit {
  doctorants: any[] = [];
  loading = false;
  error: string | null = null;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = null;
    this.http.get<any[]>(environment.apiBase + '/doctorants').subscribe({
      next: data => { this.doctorants = data; this.loading = false; },
      error: err => { this.error = err?.error?.message || 'Failed to load'; this.loading = false; }
    });
  }
}
