import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Property, PropertyPhoto } from '../../../../core/models/property.models';
import { DashboardFacade } from './store/dashboard.facade';
import { LocationService } from '../../../../core/services/location.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private readonly dashboardFacade = inject(DashboardFacade);
  private readonly locationService = inject(LocationService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly properties$ = this.dashboardFacade.properties$;
  readonly isLoading$ = this.dashboardFacade.isLoading$;
  readonly error$ = this.dashboardFacade.error$;

  searchForm!: FormGroup;
  showFilters = false;
  isSearchMode = false;

  states: string[] = [];
  cities: string[] = [];

  propertyTypes = [
    { value: '', label: 'All Types' },
    { value: 'Rent', label: 'For Rent' },
    { value: 'Sale', label: 'For Sale' }
  ];

  propertyCategories = [
    { value: '', label: 'All Categories' },
    { value: 'House', label: 'House' },
    { value: 'Apartment', label: 'Apartment' },
    { value: 'Villa', label: 'Villa' },
    { value: 'Land', label: 'Land' },
    { value: 'Commercial', label: 'Commercial' },
    { value: 'Other', label: 'Other' }
  ];

  ngOnInit(): void {
    this.states = this.locationService.getStates();
    this.initForm();
    this.dashboardFacade.reset();
    this.dashboardFacade.load(20);

    // Subscribe to state changes to load cities
    this.searchForm.get('state')?.valueChanges.subscribe(state => {
      if (state) {
        this.cities = this.locationService.getCitiesByState(state);
        // Reset city when state changes
        this.searchForm.patchValue({ city: '' });
      } else {
        this.cities = [];
        this.searchForm.patchValue({ city: '' });
      }
    });
  }

  initForm(): void {
    this.searchForm = this.fb.group({
      searchTerm: [''],
      type: [''],
      category: [''],
      city: [''],
      state: [''],
      minPrice: [''],
      maxPrice: [''],
      minBedrooms: [''],
      minBathrooms: ['']
    });
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  performSearch(): void {
    this.isSearchMode = true;
    const formValue = this.searchForm.getRawValue();
    const filters: any = {
      searchTerm: formValue.searchTerm?.trim() || undefined,
      type: formValue.type || undefined,
      category: formValue.category || undefined,
      city: formValue.city?.trim() || undefined,
      state: formValue.state?.trim() || undefined,
      minPrice: formValue.minPrice ? parseFloat(formValue.minPrice) : undefined,
      maxPrice: formValue.maxPrice ? parseFloat(formValue.maxPrice) : undefined,
      minBedrooms: formValue.minBedrooms ? parseInt(formValue.minBedrooms) : undefined,
      minBathrooms: formValue.minBathrooms ? parseInt(formValue.minBathrooms) : undefined,
      page: 1,
      pageSize: 20
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

    this.dashboardFacade.search(filters);
  }

  clearFilters(): void {
    this.searchForm.reset();
    this.isSearchMode = false;
    this.dashboardFacade.load(20);
  }

  getPropertyImageUrl(property: Property): string {
    const primaryPhoto = property.photos?.find((p: PropertyPhoto) => p.isPrimary);
    if (primaryPhoto && primaryPhoto.fileUrl) {
      return primaryPhoto.fileUrl;
    }
    // Default placeholder image
    return 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }

  viewDetails(propertyId: string): void {
    this.router.navigate(['/properties', propertyId]);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  getStatusBadgeClass(property: Property): string {
    if (!property.isActive) {
      return 'bg-gray-100 text-gray-700';
    }
    return property.type === 'Sale' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700';
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      House: '🏠',
      Apartment: '🏢',
      Villa: '🏰',
      Land: '🌳',
      Commercial: '🏪',
      Other: '🏛️'
    };
    return icons[category] || '🏛️';
  }
}

