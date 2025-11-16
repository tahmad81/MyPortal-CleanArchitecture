import { createSelector } from '@ngrx/store';

import { registerFeature } from './register.reducer';

export const selectRegisterState = registerFeature.selectRegisterState;

export const selectIsSubmitting = createSelector(selectRegisterState, state => state.isSubmitting);

export const selectSuccessMessage = createSelector(
  selectRegisterState,
  state => state.successMessage
);

export const selectErrorMessage = createSelector(selectRegisterState, state => state.error);

