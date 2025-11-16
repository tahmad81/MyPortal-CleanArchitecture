import { createFeature, createReducer, on } from '@ngrx/store';

import { AuthResponse } from '../../../../../core/models/auth.models';
import { LoginActions } from './login.actions';

export const loginFeatureKey = 'login';

export interface LoginState {
  isSubmitting: boolean;
  response: AuthResponse | null;
  error: string | null;
}

const initialState: LoginState = {
  isSubmitting: false,
  response: null,
  error: null
};

const loginReducer = createReducer(
  initialState,
  on(LoginActions.submit, state => ({
    ...state,
    isSubmitting: true,
    response: null,
    error: null
  })),
  on(LoginActions.submitSuccess, (state, { response }) => ({
    ...state,
    isSubmitting: false,
    response,
    error: null
  })),
  on(LoginActions.submitFailure, (state, { error }) => ({
    ...state,
    isSubmitting: false,
    response: null,
    error
  })),
  on(LoginActions.reset, () => initialState)
);

export const loginFeature = createFeature({
  name: loginFeatureKey,
  reducer: loginReducer
});

