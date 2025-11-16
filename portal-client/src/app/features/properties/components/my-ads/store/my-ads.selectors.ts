import { createSelector } from '@ngrx/store';

import { myAdsFeature } from './my-ads.reducer';

export const selectMyAdsState = myAdsFeature.selectMyAdsState;

export const selectProperties = createSelector(
  selectMyAdsState,
  state => state.properties
);

export const selectIsLoading = createSelector(
  selectMyAdsState,
  state => state.isLoading
);

export const selectError = createSelector(
  selectMyAdsState,
  state => state.error
);

