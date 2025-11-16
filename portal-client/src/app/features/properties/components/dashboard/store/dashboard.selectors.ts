import { createSelector } from '@ngrx/store';
import { dashboardFeature } from './dashboard.reducer';

export const selectDashboardState = dashboardFeature.selectDashboardState;

export const selectProperties = createSelector(
  selectDashboardState,
  (state) => state.properties
);

export const selectIsLoading = createSelector(
  selectDashboardState,
  (state) => state.isLoading
);

export const selectError = createSelector(
  selectDashboardState,
  (state) => state.error
);

