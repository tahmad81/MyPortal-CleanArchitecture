import { createAction, props } from '@ngrx/store';
import { PropertyResponse } from '../../../../../core/models/property.models';

export const loadProperty = createAction('[Property Detail] Load Property', props<{ id: string }>());
export const loadPropertySuccess = createAction('[Property Detail] Load Property Success', props<{ response: PropertyResponse }>());
export const loadPropertyFailure = createAction('[Property Detail] Load Property Failure', props<{ error: string }>());
export const reset = createAction('[Property Detail] Reset');

