import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Property, UpdatePropertyRequest } from '../../../../../core/models/property.models';
import * as EditPropertyActions from './edit-property.actions';
import * as EditPropertySelectors from './edit-property.selectors';

@Injectable({ providedIn: 'root' })
export class EditPropertyFacade {
  private readonly store = inject(Store);

  readonly property$: Observable<Property | null> = this.store.select(EditPropertySelectors.selectProperty);
  readonly isLoading$: Observable<boolean> = this.store.select(EditPropertySelectors.selectIsLoading);
  readonly isSubmitting$: Observable<boolean> = this.store.select(EditPropertySelectors.selectIsSubmitting);
  readonly error$: Observable<string | null> = this.store.select(EditPropertySelectors.selectError);
  readonly success$: Observable<boolean> = this.store.select(EditPropertySelectors.selectSuccess);

  load(id: string): void {
    this.store.dispatch(EditPropertyActions.loadProperty({ id }));
  }

  update(id: string, request: UpdatePropertyRequest): void {
    this.store.dispatch(EditPropertyActions.updateProperty({ id, request }));
  }

  reset(): void {
    this.store.dispatch(EditPropertyActions.reset());
  }
}

