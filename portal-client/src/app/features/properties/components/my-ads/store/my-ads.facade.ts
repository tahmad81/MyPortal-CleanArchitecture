import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';

import { MyAdsActions } from './my-ads.actions';
import {
  selectProperties,
  selectIsLoading,
  selectError
} from './my-ads.selectors';

@Injectable({ providedIn: 'root' })
export class MyAdsFacade {
  private readonly store = inject(Store);

  readonly properties$ = this.store.select(selectProperties);
  readonly isLoading$ = this.store.select(selectIsLoading);
  readonly error$ = this.store.select(selectError);

  load(): void {
    this.store.dispatch(MyAdsActions.load());
  }

  reset(): void {
    this.store.dispatch(MyAdsActions.reset());
  }
}

