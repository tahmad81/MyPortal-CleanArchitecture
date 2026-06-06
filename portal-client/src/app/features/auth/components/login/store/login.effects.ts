import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, Observable, of, switchMap, tap } from 'rxjs';

import { AuthService } from '../../../../../core/services/auth.service';
import { SocialAuthService } from '../../../../../core/services/social-auth.service';
import { TokenStorageService } from '../../../../../core/services/token-storage.service';
import { AuthStateService } from '../../../../../core/services/auth-state.service';
import { AuthResponse } from '../../../../../core/models/auth.models';
import { LoginActions } from './login.actions';

@Injectable()
export class LoginEffects {
  private readonly actions$ = inject(Actions);
  private readonly authService = inject(AuthService);
  private readonly socialAuthService = inject(SocialAuthService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly authState = inject(AuthStateService);

  submit$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LoginActions.submit),
      switchMap(({ payload }) => this.processLogin(this.authService.login(payload)))
    )
  );

  loginWithGoogle$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LoginActions.loginWithGoogle),
      switchMap(() => this.processLogin(this.socialAuthService.loginWithGoogle()))
    )
  );

  loginWithFacebook$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LoginActions.loginWithFacebook),
      switchMap(() => this.processLogin(this.socialAuthService.loginWithFacebook()))
    )
  );

  private processLogin(authRequest$: Observable<AuthResponse>) {
    return authRequest$.pipe(
      tap(response => {
        if (response.token) {
          this.tokenStorage.setToken(response.token);
        }
        if (response.success && response.userName) {
          this.authState.setUser(response);
        }
      }),
      map(response => LoginActions.submitSuccess({ response })),
      catchError(error => of(LoginActions.submitFailure({ error: this.resolveError(error) })))
    );
  }

  private resolveError(error: unknown): string {
    if (typeof error === 'string') {
      return error;
    }
    if (error && typeof error === 'object' && 'error' in error) {
      const httpError = error as { error?: { message?: string } };
      return httpError.error?.message ?? 'Unable to login.';
    }
    return 'Unable to login.';
  }
}

