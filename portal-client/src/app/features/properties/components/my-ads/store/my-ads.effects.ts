import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';

import { PropertyService } from '../../../../../core/services/property.service';
import { MyAdsActions } from './my-ads.actions';

@Injectable()
export class MyAdsEffects {
  private readonly actions$ = inject(Actions);
  private readonly propertyService = inject(PropertyService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MyAdsActions.load),
      switchMap(() =>
        this.propertyService.getMyAds().pipe(
          map(response => MyAdsActions.loadSuccess({ response })),
          catchError(error =>
            of(
              MyAdsActions.loadFailure({
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
      return httpError.error?.message ?? 'Failed to load properties.';
    }
    return 'Failed to load properties.';
  }
}

