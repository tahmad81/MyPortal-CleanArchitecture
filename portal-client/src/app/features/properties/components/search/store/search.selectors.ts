import { createSelector } from '@ngrx/store';
import { searchFeature } from './search.reducer';

export const selectSearchState = searchFeature.selectSearchState;

export const selectProperties = createSelector(
  selectSearchState,
  (state) => state.properties
);

export const selectIsLoading = createSelector(
  selectSearchState,
  (state) => state.isLoading
);

export const selectError = createSelector(
  selectSearchState,
  (state) => state.error
);

export const selectFilters = createSelector(
  selectSearchState,
  (state) => state.filters
);

