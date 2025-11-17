import { createFeature, createReducer, on } from '@ngrx/store';
import { Property } from '../../../../../core/models/property.models';
import * as EditPropertyActions from './edit-property.actions';

export interface EditPropertyState {
  property: Property | null;
  isLoading: boolean;
  isSubmitting: boolean;
  response: Property | null;
  error: string | null;
}

export const initialState: EditPropertyState = {
  property: null,
  isLoading: false,
  isSubmitting: false,
  response: null,
  error: null
};

export const editPropertyFeature = createFeature({
  name: 'editProperty',
  reducer: createReducer(
    initialState,
    on(EditPropertyActions.loadProperty, (state) => ({
      ...state,
      isLoading: true,
      error: null
    })),
    on(EditPropertyActions.loadPropertySuccess, (state, { response }) => ({
      ...state,
      property: response.data || null,
      isLoading: false,
      error: null
    })),
    on(EditPropertyActions.loadPropertyFailure, (state, { error }) => ({
      ...state,
      isLoading: false,
      error
    })),
    on(EditPropertyActions.updateProperty, (state) => ({
      ...state,
      isSubmitting: true,
      error: null
    })),
    on(EditPropertyActions.updatePropertySuccess, (state, { response }) => ({
      ...state,
      isSubmitting: false,
      response: response.data || null,
      property: response.data || state.property,
      error: null
    })),
    on(EditPropertyActions.updatePropertyFailure, (state, { error }) => ({
      ...state,
      isSubmitting: false,
      error
    })),
    on(EditPropertyActions.reset, () => initialState)
  )
});
