import { createSelector } from '@ngrx/store';

import { loginFeature } from './login.reducer';

export const selectLoginState = loginFeature.selectLoginState;

export const selectIsLoginSubmitting = createSelector(
  selectLoginState,
  state => state.isSubmitting
);

export const selectLoginResponse = createSelector(selectLoginState, state => state.response);

export const selectLoginError = createSelector(selectLoginState, state => state.error);

