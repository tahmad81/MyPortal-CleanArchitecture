import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { apiConfig } from '../config/api.config';
import { environment } from '../config/environment';
import { CreatePropertyRequest, Property, PropertyListResponse, PropertyResponse } from '../models/property.models';

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = apiConfig.baseUrl;
  private readonly endpoints = environment.endpoints;

  getMyAds(): Observable<PropertyListResponse> {
    return this.http.get<PropertyListResponse>(`${this.baseUrl}${this.endpoints.properties.myAds}`);
  }

  getLatest(count: number = 20): Observable<PropertyListResponse> {
    return this.http.get<PropertyListResponse>(`${this.baseUrl}${this.endpoints.properties.latest}?count=${count}`);
  }

  search(filters: {
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
  }): Observable<PropertyListResponse> {
    const params = new URLSearchParams();
    if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
    if (filters.type) params.append('type', filters.type);
    if (filters.category) params.append('category', filters.category);
    if (filters.city) params.append('city', filters.city);
    if (filters.state) params.append('state', filters.state);
    if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.minBedrooms) params.append('minBedrooms', filters.minBedrooms.toString());
    if (filters.minBathrooms) params.append('minBathrooms', filters.minBathrooms.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    
    return this.http.get<PropertyListResponse>(`${this.baseUrl}${this.endpoints.properties.search}?${params.toString()}`);
  }

  createProperty(request: CreatePropertyRequest): Observable<PropertyResponse> {
    return this.http.post<PropertyResponse>(`${this.baseUrl}${this.endpoints.properties.create}`, request);
  }
}

