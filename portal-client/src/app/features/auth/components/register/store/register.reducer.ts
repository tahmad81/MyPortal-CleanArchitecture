import { createFeature, createReducer, on } from '@ngrx/store';

import { RegisterActions } from './register.actions';

export const registerFeatureKey = 'register';

export interface RegisterState {
  isSubmitting: boolean;
  successMessage: string | null;
  error: string | null;
}

const initialState: RegisterState = {
  isSubmitting: false,
  successMessage: null,
  error: null
};

const registerReducer = createReducer(
  initialState,
  on(RegisterActions.submit, state => ({
    ...state,
    isSubmitting: true,
    successMessage: null,
    error: null
  })),
  on(RegisterActions.submitSuccess, (state, { message }) => ({
    ...state,
    isSubmitting: false,
    successMessage: message,
    error: null
  })),
  on(RegisterActions.submitFailure, (state, { error }) => ({
    ...state,
    isSubmitting: false,
    successMessage: null,
    error
  })),
  on(RegisterActions.reset, () => initialState)
);

export const registerFeature = createFeature({
  name: registerFeatureKey,
  reducer: registerReducer
});

