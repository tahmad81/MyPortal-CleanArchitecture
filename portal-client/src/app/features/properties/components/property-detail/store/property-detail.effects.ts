import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { PropertyService } from '../../../../../core/services/property.service';
import * as PropertyDetailActions from './property-detail.actions';

@Injectable()
export class PropertyDetailEffects {
  private readonly actions$ = inject(Actions);
  private readonly propertyService = inject(PropertyService);

  loadProperty$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PropertyDetailActions.loadProperty),
      switchMap(({ id }) =>
        this.propertyService.getById(id).pipe(
          map((response) => PropertyDetailActions.loadPropertySuccess({ response: response as any })),
          catchError((err) => of(PropertyDetailActions.loadPropertyFailure({ error: err.error?.message || err.message || 'Failed to load property' })))
        )
      )
    )
  );
}

