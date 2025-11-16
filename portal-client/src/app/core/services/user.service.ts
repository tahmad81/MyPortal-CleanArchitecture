import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { apiConfig } from '../config/api.config';
import { environment } from '../config/environment';
import { UserSummary } from '../models/user.models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = apiConfig.baseUrl;
  private readonly endpoints = environment.endpoints;

  getUsers(): Observable<UserSummary[]> {
    return this.http.get<UserSummary[]>(`${this.baseUrl}${this.endpoints.users.list}`);
  }
}

