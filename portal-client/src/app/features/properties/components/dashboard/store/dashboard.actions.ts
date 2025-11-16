import { createAction, props } from '@ngrx/store';
import { PropertyListResponse } from '../../../../../core/models/property.models';

export const loadLatest = createAction('[Dashboard] Load Latest Properties', props<{ count?: number }>());
export const loadLatestSuccess = createAction('[Dashboard] Load Latest Properties Success', props<{ response: PropertyListResponse }>());
export const loadLatestFailure = createAction('[Dashboard] Load Latest Properties Failure', props<{ error: string }>());
export const reset = createAction('[Dashboard] Reset');


