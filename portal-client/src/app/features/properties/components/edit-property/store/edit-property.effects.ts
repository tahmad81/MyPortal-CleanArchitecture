import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { PropertyService } from '../../../../../core/services/property.service';
import * as EditPropertyActions from './edit-property.actions';

@Injectable()
export class EditPropertyEffects {
  private readonly actions$ = inject(Actions);
  private readonly propertyService = inject(PropertyService);

  loadProperty$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EditPropertyActions.loadProperty),
      switchMap(({ id }) =>
        this.propertyService.getById(id).pipe(
          map((response) => EditPropertyActions.loadPropertySuccess({ response: response as any })),
          catchError((err) => of(EditPropertyActions.loadPropertyFailure({ error: err.error?.message || err.message || 'Failed to load property' })))
        )
      )
    )
  );

  updateProperty$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EditPropertyActions.updateProperty),
      switchMap(({ id, request }) =>
        this.propertyService.updateProperty(id, request).pipe(
          map((response) => EditPropertyActions.updatePropertySuccess({ response: response as any })),
          catchError((err) => of(EditPropertyActions.updatePropertyFailure({ error: err.error?.message || err.message || 'Failed to update property' })))
        )
      )
    )
  );
}

