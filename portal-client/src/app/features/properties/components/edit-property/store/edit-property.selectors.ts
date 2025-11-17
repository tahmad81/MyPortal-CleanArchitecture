import { createSelector } from '@ngrx/store';
import { editPropertyFeature } from './edit-property.reducer';

export const selectEditPropertyState = editPropertyFeature.selectEditPropertyState;

export const selectProperty = createSelector(
  selectEditPropertyState,
  (state) => state.property
);

export const selectIsLoading = createSelector(
  selectEditPropertyState,
  (state) => state.isLoading
);

export const selectIsSubmitting = createSelector(
  selectEditPropertyState,
  (state) => state.isSubmitting
);

export const selectResponse = createSelector(
  selectEditPropertyState,
  (state) => state.response
);

export const selectError = createSelector(
  selectEditPropertyState,
  (state) => state.error
);

export const selectSuccess = createSelector(
  selectEditPropertyState,
  (state) => state.response !== null && !state.isSubmitting
);