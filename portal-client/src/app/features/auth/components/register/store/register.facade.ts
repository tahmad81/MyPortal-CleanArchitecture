import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';

import { RegisterRequest } from '../../../../../core/models/auth.models';
import { RegisterActions } from './register.actions';
import {
  selectErrorMessage,
  selectIsSubmitting,
  selectSuccessMessage
} from './register.selectors';

@Injectable({ providedIn: 'root' })
export class RegisterFacade {
  private readonly store = inject(Store);

  readonly isSubmitting$ = this.store.select(selectIsSubmitting);
  readonly successMessage$ = this.store.select(selectSuccessMessage);
  readonly errorMessage$ = this.store.select(selectErrorMessage);

  submit(payload: RegisterRequest): void {
    this.store.dispatch(RegisterActions.submit({ payload }));
  }

  reset(): void {
    this.store.dispatch(RegisterActions.reset());
  }
}

