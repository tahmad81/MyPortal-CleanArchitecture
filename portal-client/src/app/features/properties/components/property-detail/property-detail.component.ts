import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Property, PropertyPhoto } from '../../../../core/models/property.models';
import { AuthStateService } from '../../../../core/services/auth-state.service';
import { PropertyDetailFacade } from './store/property-detail.facade';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './property-detail.component.html',
  styleUrl: './property-detail.component.scss'
})
export class PropertyDetailComponent implements OnInit {
  private readonly propertyDetailFacade = inject(PropertyDetailFacade);
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly authState = inject(AuthStateService);

  readonly property$ = this.propertyDetailFacade.property$;
  readonly isLoading$ = this.propertyDetailFacade.isLoading$;
  readonly error$ = this.propertyDetailFacade.error$;
  readonly currentUser = this.authState.currentUser;

  currentImageIndex = 0;

  ngOnInit(): void {
    this.propertyDetailFacade.reset();
    this.currentImageIndex = 0;
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.propertyDetailFacade.load(id);
    }

    // Reset image index when property changes
    this.property$.subscribe(property => {
      if (property) {
        this.currentImageIndex = 0;
      }
    });
  }

  nextImage(totalImages: number): void {
    if (totalImages > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % totalImages;
    }
  }

  previousImage(totalImages: number): void {
    if (totalImages > 0) {
      this.currentImageIndex = (this.currentImageIndex - 1 + totalImages) % totalImages;
    }
  }

  goToImage(index: number): void {
    this.currentImageIndex = index;
  }

  getPropertyImageUrl(property: Property, index: number = 0): string {
    if (property.photos && property.photos.length > 0) {
      const photo = property.photos[index] || property.photos[0];
      if (photo && photo.fileUrl) {
        return photo.fileUrl;
      }
    }
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

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
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

