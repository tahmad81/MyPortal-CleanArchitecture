import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Property } from '../../../../../core/models/property.models';
import * as DashboardActions from './dashboard.actions';
import * as DashboardSelectors from './dashboard.selectors';

@Injectable({ providedIn: 'root' })
export class DashboardFacade {
  private readonly store = inject(Store);

  readonly properties$: Observable<Property[]> = this.store.select(DashboardSelectors.selectProperties);
  readonly isLoading$: Observable<boolean> = this.store.select(DashboardSelectors.selectIsLoading);
  readonly error$: Observable<string | null> = this.store.select(DashboardSelectors.selectError);

  load(count?: number): void {
    this.store.dispatch(DashboardActions.loadLatest({ count }));
  }

  reset(): void {
    this.store.dispatch(DashboardActions.reset());
  }
}


