import { createFeature, createReducer, on } from '@ngrx/store';

import { Property } from '../../../../../core/models/property.models';
import { MyAdsActions } from './my-ads.actions';

export const myAdsFeatureKey = 'myAds';

export interface MyAdsState {
  properties: Property[];
  isLoading: boolean;
  error: string | null;
}

const initialState: MyAdsState = {
  properties: [],
  isLoading: false,
  error: null
};

const myAdsReducer = createReducer(
  initialState,
  on(MyAdsActions.load, state => ({
    ...state,
    isLoading: true,
    error: null
  })),
  on(MyAdsActions.loadSuccess, (state, { response }) => ({
    ...state,
    isLoading: false,
    properties: response.data || [],
    error: null
  })),
  on(MyAdsActions.loadFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    properties: [],
    error
  })),
  on(MyAdsActions.reset, () => initialState)
);

export const myAdsFeature = createFeature({
  name: myAdsFeatureKey,
  reducer: myAdsReducer
});

