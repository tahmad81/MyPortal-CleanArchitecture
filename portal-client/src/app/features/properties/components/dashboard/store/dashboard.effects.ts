import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { PropertyService } from '../../../../../core/services/property.service';
import * as DashboardActions from './dashboard.actions';

@Injectable()
export class DashboardEffects {
  private readonly actions$ = inject(Actions);
  private readonly propertyService = inject(PropertyService);

  loadLatest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.loadLatest),
      switchMap(({ count }) =>
        this.propertyService.getLatest(count || 20).pipe(
          map((response) => DashboardActions.loadLatestSuccess({ response: response as any })),
          catchError((err) => of(DashboardActions.loadLatestFailure({ error: err.error?.message || err.message || 'Failed to load properties' })))
        )
      )
    )
  );
}


