import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { TokenStorageService } from '../services/token-storage.service';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);
  const token = tokenStorage.getToken();
let headers = req.headers.set('ngrok-skip-browser-warning', 'true');
  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }
const authReq = req.clone({ headers });
  return next(authReq);
};

