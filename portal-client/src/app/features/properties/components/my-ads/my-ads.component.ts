import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs/operators';
import { Property, PropertyPhoto, RemovePropertyRequest } from '../../../../core/models/property.models';
import { MyAdsFacade } from './store/my-ads.facade';
import { PropertyService } from '../../../../core/services/property.service';

@Component({
  selector: 'app-my-ads',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './my-ads.component.html',
  styleUrl: './my-ads.component.scss'
})
export class MyAdsComponent implements OnInit {
  private readonly myAdsFacade = inject(MyAdsFacade);
  private readonly propertyService = inject(PropertyService);
  readonly router = inject(Router);

  readonly properties$ = this.myAdsFacade.properties$;
  readonly isLoading$ = this.myAdsFacade.isLoading$;
  readonly error$ = this.myAdsFacade.error$;
  
  get filteredProperties$() {
    return this.properties$.pipe(
      map(properties => properties ? this.filterProperties(properties) : [])
    );
  }

  showRemoveDialog = false;
  selectedProperty: Property | null = null;
  removeReason = '';
  isRemoving = false;
  selectedTab: 'active' | 'expired' | 'inactive' | 'removed' = 'active';
  removeReasons = [
    'No longer available',
    'Sold/Rented',
    'Temporary removal',
    'Need to update details',
    'Other'
  ];

  ngOnInit(): void {
    this.myAdsFacade.reset();
    this.myAdsFacade.load();
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
    if (property.isRemoved) {
      return 'bg-red-100 text-red-700';
    }
    if (!property.isActive) {
      return 'bg-gray-100 text-gray-700';
    }
    return property.type === 'Sale' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700';
  }

  formatExpiryDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDate = new Date(date);
    expiryDate.setHours(0, 0, 0, 0);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Expired on ${this.formatDate(dateString)}`;
    } else if (diffDays === 0) {
      return 'Expires today';
    } else if (diffDays === 1) {
      return 'Expires tomorrow';
    } else if (diffDays <= 7) {
      return `Expires in ${diffDays} days (${this.formatDate(dateString)})`;
    } else {
      return `Expires on ${this.formatDate(dateString)}`;
    }
  }

  getExpiryBadgeClass(expiryDate: string): string {
    const date = new Date(expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(date);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'bg-red-100 text-red-700';
    } else if (diffDays <= 3) {
      return 'bg-orange-100 text-orange-700';
    } else if (diffDays <= 7) {
      return 'bg-yellow-100 text-yellow-700';
    }
    return 'bg-green-100 text-green-700';
  }

  openRemoveDialog(property: Property): void {
    this.selectedProperty = property;
    this.removeReason = '';
    this.showRemoveDialog = true;
  }

  closeRemoveDialog(): void {
    this.showRemoveDialog = false;
    this.selectedProperty = null;
    this.removeReason = '';
  }

  async removeProperty(): Promise<void> {
    if (!this.selectedProperty || !this.removeReason) {
      return;
    }

    this.isRemoving = true;
    try {
      const request: RemovePropertyRequest = { removeReason: this.removeReason };
      await this.propertyService.removeProperty(this.selectedProperty.id, request).toPromise();
      this.closeRemoveDialog();
      this.myAdsFacade.load(); // Reload properties
    } catch (error: any) {
      console.error('Error removing property:', error);
      alert(error?.error?.message || 'Failed to remove property');
    } finally {
      this.isRemoving = false;
    }
  }

  async reactivateProperty(property: Property): Promise<void> {
    if (!confirm('Are you sure you want to reactivate this property? It will use the original expiry period.')) {
      return;
    }

    try {
      await this.propertyService.reactivateProperty(property.id).toPromise();
      this.myAdsFacade.load(); // Reload properties
    } catch (error: any) {
      console.error('Error reactivating property:', error);
      alert(error?.error?.message || 'Failed to reactivate property');
    }
  }

  selectTab(tab: 'active' | 'expired' | 'inactive' | 'removed'): void {
    this.selectedTab = tab;
  }

  isPropertyExpired(property: Property): boolean {
    const expiryDate = new Date(property.expiryDate);
    expiryDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return expiryDate < today;
  }

  filterProperties(properties: Property[]): Property[] {
    switch (this.selectedTab) {
      case 'active':
        return properties.filter(p => 
          !p.isRemoved && 
          p.isActive && 
          !this.isPropertyExpired(p)
        );
      case 'expired':
        return properties.filter(p => 
          !p.isRemoved && 
          this.isPropertyExpired(p)
        );
      case 'inactive':
        return properties.filter(p => 
          !p.isRemoved && 
          !p.isActive
        );
      case 'removed':
        return properties.filter(p => p.isRemoved);
      default:
        return properties;
    }
  }

  getTabCount(properties: Property[], tab: 'active' | 'expired' | 'inactive' | 'removed'): number {
    const originalTab = this.selectedTab;
    this.selectedTab = tab;
    const count = this.filterProperties(properties).length;
    this.selectedTab = originalTab;
    return count;
  }
}

