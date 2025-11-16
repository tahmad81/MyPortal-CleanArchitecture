import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { apiConfig } from '../config/api.config';
import { environment } from '../config/environment';
import { AuthResponse, LoginRequest, RegisterRequest, RegisterResponse } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = apiConfig.baseUrl;
  private readonly endpoints = environment.endpoints;

  register(payload: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.baseUrl}${this.endpoints.auth.register}`, payload);
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}${this.endpoints.auth.login}`, payload);
  }
}

