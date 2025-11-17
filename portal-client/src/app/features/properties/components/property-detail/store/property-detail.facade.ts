import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Property } from '../../../../../core/models/property.models';
import * as PropertyDetailActions from './property-detail.actions';
import * as PropertyDetailSelectors from './property-detail.selectors';

@Injectable({ providedIn: 'root' })
export class PropertyDetailFacade {
  private readonly store = inject(Store);

  readonly property$: Observable<Property | null> = this.store.select(PropertyDetailSelectors.selectProperty);
  readonly isLoading$: Observable<boolean> = this.store.select(PropertyDetailSelectors.selectIsLoading);
  readonly error$: Observable<string | null> = this.store.select(PropertyDetailSelectors.selectError);

  load(id: string): void {
    this.store.dispatch(PropertyDetailActions.loadProperty({ id }));
  }

  reset(): void {
    this.store.dispatch(PropertyDetailActions.reset());
  }
}

