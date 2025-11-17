import { createAction, props } from '@ngrx/store';
import { PropertyResponse, UpdatePropertyRequest } from '../../../../../core/models/property.models';

export const loadProperty = createAction('[Edit Property] Load Property', props<{ id: string }>());
export const loadPropertySuccess = createAction('[Edit Property] Load Property Success', props<{ response: PropertyResponse }>());
export const loadPropertyFailure = createAction('[Edit Property] Load Property Failure', props<{ error: string }>());
export const updateProperty = createAction('[Edit Property] Update Property', props<{ id: string; request: UpdatePropertyRequest }>());
export const updatePropertySuccess = createAction('[Edit Property] Update Property Success', props<{ response: PropertyResponse }>());
export const updatePropertyFailure = createAction('[Edit Property] Update Property Failure', props<{ error: string }>());
export const reset = createAction('[Edit Property] Reset');
