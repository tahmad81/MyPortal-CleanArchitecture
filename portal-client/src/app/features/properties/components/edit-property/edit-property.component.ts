import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Property, UpdatePropertyRequest } from '../../../../core/models/property.models';
import { EditPropertyFacade } from './store/edit-property.facade';

@Component({
  selector: 'app-edit-property',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-property.component.html',
  styleUrl: './edit-property.component.scss'
})
export class EditPropertyComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly editPropertyFacade = inject(EditPropertyFacade);
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);

  readonly property$ = this.editPropertyFacade.property$;
  readonly isLoading$ = this.editPropertyFacade.isLoading$;
  readonly isSubmitting$ = this.editPropertyFacade.isSubmitting$;
  readonly error$ = this.editPropertyFacade.error$;
  readonly success$ = this.editPropertyFacade.success$;

  editForm!: FormGroup;
  propertyId: string | null = null;
  success = false;

  uploadedImages: File[] = [];
  imagePreviews: string[] = [];
  existingImages: Array<{ url: string; id: string }> = [];
  initialPhotoCount: number = 0;

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
    this.propertyId = this.route.snapshot.paramMap.get('id');
    if (!this.propertyId) {
      this.router.navigate(['/properties/my-ads']);
      return;
    }

    this.initForm();
    this.editPropertyFacade.reset();
    this.editPropertyFacade.load(this.propertyId);

    // Load property data into form - use take(1) to ensure we only process once per load
    this.property$.subscribe(property => {
      if (property && property.id) {
        // Only populate if form hasn't been populated yet or property ID matches
        if (!this.editForm.get('title')?.value || this.editForm.get('title')?.value === '') {
          this.populateForm(property);
        }
        // Always reload images in case they change
        if (property.photos && property.photos.length > 0) {
          this.loadExistingImages(property);
        } else {
          // Reset if no photos
          this.existingImages = [];
          this.initialPhotoCount = 0;
        }
      }
    });

    this.success$.subscribe(success => {
      if (success) {
        this.success = true;
        setTimeout(() => {
          this.router.navigate(['/properties/my-ads']);
        }, 2000);
      }
    });
  }

  initForm(): void {
    this.editForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.minLength(50), Validators.maxLength(5000)]],
      price: ['', [Validators.required, Validators.min(1)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zipCode: ['', [Validators.required]],
      country: ['', [Validators.required]],
      contactNumber: ['', [Validators.required, Validators.pattern(/^[\d\s\-\+\(\)]+$/)]],
      bedrooms: [''],
      bathrooms: [''],
      area: [''],
      areaUnit: ['marla'],
      yearBuilt: [''],
      parking: [''],
      furnishingStatus: [''],
      isActive: [true]
    });
  }

  populateForm(property: Property): void {
    this.editForm.patchValue({
      title: property.title || '',
      description: property.description || '',
      price: property.price || '',
      address: property.address || '',
      city: property.city || '',
      state: property.state || '',
      zipCode: property.zipCode || '',
      country: property.country || '',
      contactNumber: property.contactNumber || '',
      bedrooms: property.bedrooms || '',
      bathrooms: property.bathrooms || '',
      area: property.area || '',
      areaUnit: property.areaUnit || 'marla',
      yearBuilt: property.yearBuilt || '',
      parking: property.parking || '',
      furnishingStatus: property.furnishingStatus || '',
      isActive: property.isActive !== undefined ? property.isActive : true
    });
  }

  loadExistingImages(property: Property): void {
    // Clear existing images first
    this.existingImages = [];
    this.initialPhotoCount = 0;
    
    // Check if property has photos array and it's not empty
    if (property && property.photos && Array.isArray(property.photos) && property.photos.length > 0) {
      // Sort by display order and filter out photos without fileUrl
      const validPhotos = property.photos
        .filter(photo => photo && photo.fileUrl && photo.fileUrl.trim() !== '')
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      
      if (validPhotos.length > 0) {
        this.existingImages = validPhotos.map(photo => ({
          url: photo.fileUrl,
          id: photo.id
        }));
        this.initialPhotoCount = validPhotos.length;
      }
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      
      // Limit to 10 images total (existing + new)
      const remainingSlots = 10 - (this.existingImages.length + this.uploadedImages.length);
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
    // Reset input
    input.value = '';
  }

  removeExistingImage(index: number): void {
    this.existingImages.splice(index, 1);
  }

  removeNewImage(index: number): void {
    this.uploadedImages.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  getFieldError(fieldName: string): string {
    const field = this.editForm.get(fieldName);
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
    const field = this.editForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  async submit(): Promise<void> {
    if (this.editForm.invalid || !this.propertyId) {
      this.editForm.markAllAsTouched();
      return;
    }

    const formValue = this.editForm.getRawValue();

    // Convert uploaded images to base64
    // Send photos if: new images are uploaded OR existing images were removed (but keep existing if no changes)
    let photos: Array<{ fileName: string; imageData: number[]; contentType: string; displayOrder: number; isPrimary: boolean }> | undefined;
    
    const photosChanged = this.uploadedImages.length > 0 || this.existingImages.length !== this.initialPhotoCount;
    
    if (photosChanged) {
      if (this.uploadedImages.length > 0) {
        // Convert new uploaded images
        photos = await Promise.all(
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
      } else {
        // User removed all existing photos but didn't upload new ones - send empty array
        photos = [];
      }
    }
    // If photosChanged is false, photos remains undefined and backend keeps existing photos

    const request: UpdatePropertyRequest = {
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
      areaUnit: formValue.areaUnit || 'marla',
      yearBuilt: formValue.yearBuilt ? parseInt(formValue.yearBuilt) : undefined,
      parking: formValue.parking || undefined,
      furnishingStatus: formValue.furnishingStatus || undefined,
      isActive: formValue.isActive !== undefined ? formValue.isActive : true,
      photos: photos
    };

    this.editPropertyFacade.update(this.propertyId, request);
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

