import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Property } from '../../../../../core/models/property.models';
import * as SearchActions from './search.actions';
import * as SearchSelectors from './search.selectors';

@Injectable({ providedIn: 'root' })
export class SearchFacade {
  private readonly store = inject(Store);

  readonly properties$: Observable<Property[]> = this.store.select(SearchSelectors.selectProperties);
  readonly isLoading$: Observable<boolean> = this.store.select(SearchSelectors.selectIsLoading);
  readonly error$: Observable<string | null> = this.store.select(SearchSelectors.selectError);
  readonly filters$: Observable<SearchActions.SearchFilters> = this.store.select(SearchSelectors.selectFilters);

  search(filters: SearchActions.SearchFilters): void {
    this.store.dispatch(SearchActions.search({ filters }));
  }

  reset(): void {
    this.store.dispatch(SearchActions.reset());
  }
}


