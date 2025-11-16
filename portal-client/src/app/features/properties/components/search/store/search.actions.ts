import { createAction, props } from '@ngrx/store';
import { PropertyListResponse } from '../../../../../core/models/property.models';

export interface SearchFilters {
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
}

export const search = createAction('[Search] Search Properties', props<{ filters: SearchFilters }>());
export const searchSuccess = createAction('[Search] Search Properties Success', props<{ response: PropertyListResponse }>());
export const searchFailure = createAction('[Search] Search Properties Failure', props<{ error: string }>());
export const reset = createAction('[Search] Reset');


