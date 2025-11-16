import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Property, PropertyPhoto } from '../../../../core/models/property.models';
import { DashboardFacade } from './store/dashboard.facade';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private readonly dashboardFacade = inject(DashboardFacade);
  private readonly router = inject(Router);

  readonly properties$ = this.dashboardFacade.properties$;
  readonly isLoading$ = this.dashboardFacade.isLoading$;
  readonly error$ = this.dashboardFacade.error$;

  ngOnInit(): void {
    this.dashboardFacade.reset();
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

