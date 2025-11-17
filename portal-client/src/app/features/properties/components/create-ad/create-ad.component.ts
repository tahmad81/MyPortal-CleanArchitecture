import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CreatePropertyRequest } from '../../../../core/models/property.models';
import { CreateAdFacade } from './store/create-ad.facade';
import { LocationService } from '../../../../core/services/location.service';

@Component({
  selector: 'app-create-ad',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-ad.component.html',
  styleUrl: './create-ad.component.scss'
})
export class CreateAdComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly createAdFacade = inject(CreateAdFacade);
  private readonly locationService = inject(LocationService);
  readonly router = inject(Router);

  readonly isSubmitting$ = this.createAdFacade.isSubmitting$;
  readonly response$ = this.createAdFacade.response$;
  readonly error$ = this.createAdFacade.error$;

  adForm!: FormGroup;
  selectedType: 'Rent' | 'Sale' | null = null;
  uploadedImages: File[] = [];
  imagePreviews: string[] = [];
  success = false;
  
  states: string[] = [];
  cities: string[] = [];

  propertyTypes: Array<{ value: 'Rent' | 'Sale'; label: string; icon: string }> = [
    { value: 'Rent', label: 'For Rent', icon: '🏠' },
    { value: 'Sale', label: 'For Sale', icon: '💰' }
  ];

  propertyCategories = [
    { value: 'House', label: 'House' },
    { value: 'Apartment', label: 'Apartment' },
    { value: 'Villa', label: 'Villa' },
    { value: 'Land', label: 'Land' },
    { value: 'Commercial', label: 'Commercial' },
    { value: 'Other', label: 'Other' }
  ];

  areaUnits = [
    { value: 'sqft', label: 'Square Feet (sqft)' },
    { value: 'sqm', label: 'Square Meters (sqm)' },
    { value: 'marla', label: 'Marla' }
  ];

  furnishingStatuses = [
    { value: 'Furnished', label: 'Furnished' },
    { value: 'Semi-Furnished', label: 'Semi-Furnished' },
    { value: 'Unfurnished', label: 'Unfurnished' }
  ];

  ngOnInit(): void {
    this.states = this.locationService.getStates();
    this.initForm();
    this.createAdFacade.reset();

    // Subscribe to state changes to load cities
    this.adForm.get('state')?.valueChanges.subscribe(state => {
      if (state) {
        this.cities = this.locationService.getCitiesByState(state);
        // Reset city when state changes
        this.adForm.patchValue({ city: '' });
      } else {
        this.cities = [];
        this.adForm.patchValue({ city: '' });
      }
    });

    this.response$.subscribe(response => {
      if (response) {
        this.success = true;
        // Redirect to my-ads after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/properties/my-ads']);
        }, 2000);
      }
    });

    this.error$.subscribe(error => {
      if (error) {
        // Error is displayed via error$ observable in template
      }
    });
  }

  initForm(): void {
    this.adForm = this.fb.group({
      type: ['', Validators.required],
      category: ['', Validators.required],
      title: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.minLength(50), Validators.maxLength(5000)]],
      price: ['', [Validators.required, Validators.min(1)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zipCode: ['', [Validators.required]],
      country: ['Pakistan', [Validators.required]],
      contactNumber: ['', [Validators.required, Validators.pattern(/^[\d\s\-\+\(\)]+$/)]],
      bedrooms: [''],
      bathrooms: [''],
      area: [''],
      areaUnit: ['marla'],
      yearBuilt: [''],
      parking: [''],
      furnishingStatus: ['']
    });
  }

  selectType(type: 'Rent' | 'Sale'): void {
    this.selectedType = type;
    this.adForm.patchValue({ type });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      
      // Limit to 10 images
      const remainingSlots = 10 - this.uploadedImages.length;
      const filesToAdd = files.slice(0, remainingSlots);
      
      filesToAdd.forEach(file => {
        if (file.type.startsWith('image/')) {
          this.uploadedImages.push(file);
          
          // Create preview
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              this.imagePreviews.push(e.target.result as string);
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  removeImage(index: number): void {
    this.uploadedImages.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  getFieldError(fieldName: string): string {
    const field = this.adForm.get(fieldName);
    if (field?.hasError('required') && field.touched) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (field?.hasError('minlength') && field.touched) {
      const required = field.errors?.['minlength'].requiredLength;
      return `${this.getFieldLabel(fieldName)} must be at least ${required} characters`;
    }
    if (field?.hasError('maxlength') && field.touched) {
      const required = field.errors?.['maxlength'].requiredLength;
      return `${this.getFieldLabel(fieldName)} must not exceed ${required} characters`;
    }
    if (field?.hasError('min') && field.touched) {
      return `${this.getFieldLabel(fieldName)} must be greater than 0`;
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      type: 'Property Type',
      category: 'Category',
      title: 'Title',
      description: 'Description',
      price: 'Price',
      address: 'Address',
      city: 'City',
      state: 'State',
      zipCode: 'Zip Code',
      country: 'Country',
      contactNumber: 'Contact Number'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.adForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  async submit(): Promise<void> {
    if (this.adForm.invalid || !this.selectedType) {
      this.adForm.markAllAsTouched();
      return;
    }

    const formValue = this.adForm.getRawValue();
    
    // Convert images to base64
    const photos = await Promise.all(
      this.uploadedImages.map(async (file, index) => {
        const imageData = await this.fileToByteArray(file);
        return {
          fileName: file.name,
          imageData: Array.from(imageData), // Convert Uint8Array to number array
          contentType: file.type || 'image/jpeg',
          displayOrder: index,
          isPrimary: index === 0
        };
      })
    );

    const request: CreatePropertyRequest = {
      type: this.selectedType!,
      category: formValue.category,
      title: formValue.title.trim(),
      description: formValue.description.trim(),
      price: parseFloat(formValue.price),
      address: formValue.address.trim(),
      city: formValue.city.trim(),
      state: formValue.state.trim(),
      zipCode: formValue.zipCode.trim(),
      country: formValue.country.trim(),
      contactNumber: formValue.contactNumber?.trim() || undefined,
      bedrooms: formValue.bedrooms ? parseInt(formValue.bedrooms) : undefined,
      bathrooms: formValue.bathrooms ? parseInt(formValue.bathrooms) : undefined,
      area: formValue.area ? parseFloat(formValue.area) : undefined,
      areaUnit: formValue.areaUnit || 'sqft',
      yearBuilt: formValue.yearBuilt ? parseInt(formValue.yearBuilt) : undefined,
      parking: formValue.parking || undefined,
      furnishingStatus: formValue.furnishingStatus || undefined,
      photos: photos.length > 0 ? photos : undefined
    };

    this.createAdFacade.submit(request);
  }

  private fileToByteArray(file: File): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        resolve(new Uint8Array(arrayBuffer));
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }
}

