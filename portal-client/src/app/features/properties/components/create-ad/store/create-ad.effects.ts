import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';

import { PropertyService } from '../../../../../core/services/property.service';
import { CreateAdActions } from './create-ad.actions';

@Injectable()
export class CreateAdEffects {
  private readonly actions$ = inject(Actions);
  private readonly propertyService = inject(PropertyService);

  submit$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CreateAdActions.submit),
      switchMap(({ request }) =>
        this.propertyService.createProperty(request).pipe(
          map(response => CreateAdActions.submitSuccess({ response })),
          catchError(error =>
            of(
              CreateAdActions.submitFailure({
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
      return httpError.error?.message ?? 'Failed to create property.';
    }
    return 'Failed to create property.';
  }
}

