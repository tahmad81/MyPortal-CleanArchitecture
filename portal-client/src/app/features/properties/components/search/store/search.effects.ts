import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { PropertyService } from '../../../../../core/services/property.service';
import * as SearchActions from './search.actions';

@Injectable()
export class SearchEffects {
  private readonly actions$ = inject(Actions);
  private readonly propertyService = inject(PropertyService);

  search$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SearchActions.search),
      switchMap(({ filters }) =>
        this.propertyService.search(filters).pipe(
          map((response) => SearchActions.searchSuccess({ response: response as any })),
          catchError((err) => of(SearchActions.searchFailure({ error: err.error?.message || err.message || 'Failed to search properties' })))
        )
      )
    )
  );
}


