import { createFeature, createReducer, on } from '@ngrx/store';
import { Property } from '../../../../../core/models/property.models';
import * as SearchActions from './search.actions';

export interface SearchState {
  properties: Property[];
  isLoading: boolean;
  error: string | null;
  filters: SearchActions.SearchFilters;
}

export const initialState: SearchState = {
  properties: [],
  isLoading: false,
  error: null,
  filters: {}
};

export const searchFeature = createFeature({
  name: 'search',
  reducer: createReducer(
    initialState,
    on(SearchActions.search, (state, { filters }) => ({
      ...state,
      filters,
      isLoading: true,
      error: null
    })),
    on(SearchActions.searchSuccess, (state, { response }) => ({
      ...state,
      properties: response.data || [],
      isLoading: false,
      error: null
    })),
    on(SearchActions.searchFailure, (state, { error }) => ({
      ...state,
      isLoading: false,
      error
    })),
    on(SearchActions.reset, () => initialState)
  )
});

