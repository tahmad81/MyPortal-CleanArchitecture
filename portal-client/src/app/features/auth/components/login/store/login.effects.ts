import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';

import { AuthService } from '../../../../../core/services/auth.service';
import { TokenStorageService } from '../../../../../core/services/token-storage.service';
import { AuthStateService } from '../../../../../core/services/auth-state.service';
import { LoginActions } from './login.actions';

@Injectable()
export class LoginEffects {
  private readonly actions$ = inject(Actions);
  private readonly authService = inject(AuthService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly authState = inject(AuthStateService);

  submit$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LoginActions.submit),
      switchMap(({ payload }) =>
        this.authService.login(payload).pipe(
          tap(response => {
            if (response.token) {
              this.tokenStorage.setToken(response.token);
            }
            if (response.success && response.userName) {
              this.authState.setUser(response);
            }
          }),
          map(response => LoginActions.submitSuccess({ response })),
          catchError(error =>
            of(
              LoginActions.submitFailure({
                error: this.resolveError(error)
              })
            )
          )
        )
      )
    )
  );

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

