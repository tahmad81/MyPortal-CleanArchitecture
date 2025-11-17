import { createSelector } from '@ngrx/store';
import { propertyDetailFeature } from './property-detail.reducer';

export const selectPropertyDetailState = propertyDetailFeature.selectPropertyDetailState;

export const selectProperty = createSelector(
  selectPropertyDetailState,
  (state) => state.property
);

export const selectIsLoading = createSelector(
  selectPropertyDetailState,
  (state) => state.isLoading
);

export const selectError = createSelector(
  selectPropertyDetailState,
  (state) => state.error
);

