import { createAction, props } from '@ngrx/store';
import { PropertyListResponse } from '../../../../../core/models/property.models';

export const loadLatest = createAction('[Dashboard] Load Latest Properties', props<{ count?: number }>());
export const loadLatestSuccess = createAction('[Dashboard] Load Latest Properties Success', props<{ response: PropertyListResponse }>());
export const loadLatestFailure = createAction('[Dashboard] Load Latest Properties Failure', props<{ error: string }>());
export const search = createAction('[Dashboard] Search Properties', props<{
  searchTerm?: string;
  type?: string;
  category?: string;
  city?: string;
  state?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  page?: number;
  pageSize?: number;
}>());
export const searchSuccess = createAction('[Dashboard] Search Properties Success', props<{ response: PropertyListResponse }>());
export const searchFailure = createAction('[Dashboard] Search Properties Failure', props<{ error: string }>());
export const reset = createAction('[Dashboard] Reset');


