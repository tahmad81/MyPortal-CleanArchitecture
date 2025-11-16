import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';

import { AuthService } from '../../../../../core/services/auth.service';
import { RegisterActions } from './register.actions';

@Injectable()
export class RegisterEffects {
  private readonly actions$ = inject(Actions);
  private readonly authService = inject(AuthService);

  submit$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RegisterActions.submit),
      switchMap(({ payload }) =>
        this.authService.register(payload).pipe(
          map(response =>
            RegisterActions.submitSuccess({
              message: response.message ?? 'Registration completed successfully.'
            })
          ),
          catchError(error =>
            of(
              RegisterActions.submitFailure({
                error: this.resolveErrorMessage(error)
              })
            )
          )
        )
      )
    )
  );

  private resolveErrorMessage(error: unknown): string {
    if (typeof error === 'string') {
      return error;
    }

    if (error && typeof error === 'object' && 'error' in error) {
      const httpError = error as { error?: { message?: string } };
      return httpError.error?.message ?? 'Unable to complete registration.';
    }

    return 'Unable to complete registration.';
  }
}

