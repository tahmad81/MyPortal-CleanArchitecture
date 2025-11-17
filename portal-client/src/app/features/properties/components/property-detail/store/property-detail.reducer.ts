import { createFeature, createReducer, on } from '@ngrx/store';
import { Property } from '../../../../../core/models/property.models';
import * as PropertyDetailActions from './property-detail.actions';

export interface PropertyDetailState {
  property: Property | null;
  isLoading: boolean;
  error: string | null;
}

export const initialState: PropertyDetailState = {
  property: null,
  isLoading: false,
  error: null
};

export const propertyDetailFeature = createFeature({
  name: 'propertyDetail',
  reducer: createReducer(
    initialState,
    on(PropertyDetailActions.loadProperty, (state) => ({
      ...state,
      isLoading: true,
      error: null
    })),
    on(PropertyDetailActions.loadPropertySuccess, (state, { response }) => ({
      ...state,
      property: response.data || null,
      isLoading: false,
      error: null
    })),
    on(PropertyDetailActions.loadPropertyFailure, (state, { error }) => ({
      ...state,
      isLoading: false,
      error,
      property: null
    })),
    on(PropertyDetailActions.reset, () => initialState)
  )
});

