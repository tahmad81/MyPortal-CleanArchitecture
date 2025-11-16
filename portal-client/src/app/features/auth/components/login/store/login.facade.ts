import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';

import { LoginRequest } from '../../../../../core/models/auth.models';
import { LoginActions } from './login.actions';
import {
  selectIsLoginSubmitting,
  selectLoginError,
  selectLoginResponse
} from './login.selectors';

@Injectable({ providedIn: 'root' })
export class LoginFacade {
  private readonly store = inject(Store);

  readonly isSubmitting$ = this.store.select(selectIsLoginSubmitting);
  readonly response$ = this.store.select(selectLoginResponse);
  readonly error$ = this.store.select(selectLoginError);

  submit(payload: LoginRequest): void {
    this.store.dispatch(LoginActions.submit({ payload }));
  }

  reset(): void {
    this.store.dispatch(LoginActions.reset());
  }
}

