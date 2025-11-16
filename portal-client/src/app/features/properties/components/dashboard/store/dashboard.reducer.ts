import { createFeature, createReducer, on } from '@ngrx/store';
import { Property } from '../../../../../core/models/property.models';
import * as DashboardActions from './dashboard.actions';

export interface DashboardState {
  properties: Property[];
  isLoading: boolean;
  error: string | null;
}

export const initialState: DashboardState = {
  properties: [],
  isLoading: false,
  error: null
};

export const dashboardFeature = createFeature({
  name: 'dashboard',
  reducer: createReducer(
    initialState,
    on(DashboardActions.loadLatest, (state) => ({
      ...state,
      isLoading: true,
      error: null
    })),
    on(DashboardActions.loadLatestSuccess, (state, { response }) => ({
      ...state,
      properties: response.data || [],
      isLoading: false,
      error: null
    })),
    on(DashboardActions.loadLatestFailure, (state, { error }) => ({
      ...state,
      isLoading: false,
      error
    })),
    on(DashboardActions.reset, () => initialState)
  )
});

