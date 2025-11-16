import { createFeature, createReducer, on } from '@ngrx/store';

import { Property } from '../../../../../core/models/property.models';
import { CreateAdActions } from './create-ad.actions';

export const createAdFeatureKey = 'createAd';

export interface CreateAdState {
  isSubmitting: boolean;
  response: Property | null;
  error: string | null;
}

const initialState: CreateAdState = {
  isSubmitting: false,
  response: null,
  error: null
};

const createAdReducer = createReducer(
  initialState,
  on(CreateAdActions.submit, state => ({
    ...state,
    isSubmitting: true,
    response: null,
    error: null
  })),
  on(CreateAdActions.submitSuccess, (state, { response }) => ({
    ...state,
    isSubmitting: false,
    response: response.data || null,
    error: null
  })),
  on(CreateAdActions.submitFailure, (state, { error }) => ({
    ...state,
    isSubmitting: false,
    response: null,
    error
  })),
  on(CreateAdActions.reset, () => initialState)
);

export const createAdFeature = createFeature({
  name: createAdFeatureKey,
  reducer: createAdReducer
});

