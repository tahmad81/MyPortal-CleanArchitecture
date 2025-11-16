import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';

import { CreatePropertyRequest } from '../../../../../core/models/property.models';
import { CreateAdActions } from './create-ad.actions';
import {
  selectIsSubmitting,
  selectResponse,
  selectError
} from './create-ad.selectors';

@Injectable({ providedIn: 'root' })
export class CreateAdFacade {
  private readonly store = inject(Store);

  readonly isSubmitting$ = this.store.select(selectIsSubmitting);
  readonly response$ = this.store.select(selectResponse);
  readonly error$ = this.store.select(selectError);

  submit(request: CreatePropertyRequest): void {
    this.store.dispatch(CreateAdActions.submit({ request }));
  }

  reset(): void {
    this.store.dispatch(CreateAdActions.reset());
  }
}

