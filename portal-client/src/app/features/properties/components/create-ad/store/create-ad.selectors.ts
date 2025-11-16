import { createSelector } from '@ngrx/store';

import { createAdFeature } from './create-ad.reducer';

export const selectCreateAdState = createAdFeature.selectCreateAdState;

export const selectIsSubmitting = createSelector(
  selectCreateAdState,
  state => state.isSubmitting
);

export const selectResponse = createSelector(
  selectCreateAdState,
  state => state.response
);

export const selectError = createSelector(
  selectCreateAdState,
  state => state.error
);

