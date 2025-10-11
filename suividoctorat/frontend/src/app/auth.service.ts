import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  token: string | null = null;
  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    return this.http.post<{token: string}>(environment.apiBase + '/auth/login', { username, password });
  }
}
