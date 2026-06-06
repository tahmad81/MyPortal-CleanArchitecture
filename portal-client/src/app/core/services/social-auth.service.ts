import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Auth, FacebookAuthProvider, GoogleAuthProvider, signInWithPopup, UserCredential } from '@angular/fire/auth';
import { from, switchMap } from 'rxjs';

import { apiConfig } from '../config/api.config';
import { environment } from '../config/environment';
import { AuthResponse } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class SocialAuthService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(Auth);
  private readonly baseUrl = apiConfig.baseUrl;
  private readonly endpoints = environment.endpoints;

  loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return this.signInAndExchangeToken(provider, 'google');
  }

  loginWithFacebook() {
    const provider = new FacebookAuthProvider();
    return this.signInAndExchangeToken(provider, 'facebook');
  }

  private signInAndExchangeToken(
    provider: GoogleAuthProvider | FacebookAuthProvider,
    providerName: string
  ) {
    return from(signInWithPopup(this.auth, provider)).pipe(
      switchMap((userCredential: UserCredential) =>
        from(userCredential.user.getIdToken()).pipe(
          switchMap(idToken =>
            this.http.post<AuthResponse>(
              `${this.baseUrl}${this.endpoints.auth.socialLogin}`,
              {
                provider: providerName,
                token: idToken
              }
            )
          )
        )
      )
    );
  }
}
