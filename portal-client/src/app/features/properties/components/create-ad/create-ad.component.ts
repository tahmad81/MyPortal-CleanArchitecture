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
  agreementLanguage: 'en' | 'ur' = 'en';
  
  states: string[] = [];
  cities: string[] = [];

  propertyTypes: Array<{ value: 'Rent' | 'Sale'; label: string; icon: string }> = [
    { value: 'Rent', label: 'For Rent', icon: '🏠' },
    { value: 'Sale', label: 'For Sale', icon: '🏘️' }
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
    { value: 'sqft', label: 'Square Feet (sqft)', shortLabel: 'sqft' },
    { value: 'sqm', label: 'Square Meters (sqm)', shortLabel: 'sqm' },
    { value: 'marla', label: 'Marla', shortLabel: 'Marla' }
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
      furnishingStatus: [''],
      agreementAccepted: [false, Validators.requiredTrue]
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
      agreementAccepted: formValue.agreementAccepted,
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

  toggleAgreementLanguage(): void {
    this.agreementLanguage = this.agreementLanguage === 'en' ? 'ur' : 'en';
  }

  getAgreementText(): any {
    if (this.agreementLanguage === 'ur') {
      return {
        title: 'صارف معاہدہ اور خدمات کی شرائط',
        notice: 'اہم نوٹس: براہ کرم غور سے پڑھیں',
        intro: 'اس پراپرٹی پورٹل ("پلیٹ فارم") پر پراپرٹی لسٹنگ جمع کرواتے وقت، آپ مندرجہ ذیل شرائط و ضوابط کو تسلیم کرتے ہیں اور ان پر متفق ہوتے ہیں:',
        section1: {
          title: '1. پلیٹ فارم کی نوعیت:',
          text: 'یہ پراپرٹی پورٹل ایک درجہ بند اشتہاری پلیٹ فارم ہے جو صرف پراپرٹی لسٹنگ بنانے اور دکھانے کے مقصد کے لیے بنایا گیا ہے۔ پلیٹ فارم خاص طور پر ایک ثالث سروس فراہم کنندہ کے طور پر کام کرتا ہے جو پراپرٹی مالکان/اشتہار دینے والوں اور ممکنہ خریداروں/کرایہ داروں کے درمیان تعلق کو آسان بناتا ہے۔'
        },
        section2: {
          title: '2. لین دین کے لیے کوئی ذمہ داری نہیں:',
          text: 'پراپرٹی پورٹل مندرجہ ذیل سے متعلق کسی بھی ذمہ داری کے لیے ذمہ دار نہیں ہے اور اس سے صراحتاً انکار کرتا ہے:',
          items: [
            'اس پلیٹ فارم کو استعمال کرنے والے فریقین کے درمیان کیے گئے کسی بھی لین دین، معاہدے یا ڈیلز',
            'صارفین کی طرف سے پوسٹ کی گئی پراپرٹی لسٹنگ کی درستگی، مکملیت، یا سچائی',
            'پلیٹ فارم پر درج کسی بھی پراپرٹی کی حالت، معیار، قانونی حیثیت، یا دستیابی',
            'پراپرٹی مالکان اور ممکنہ خریداروں/کرایہ داروں کے درمیان پیدا ہونے والے کسی بھی تنازعات، دعوؤں، یا اختلافات',
            'فریقین کے درمیان مالی لین دین، ادائیگیاں، جمع کرائیں، یا کوئی بھی مالی تبادلے',
            'پراپرٹی میں خرابیاں، غلط بیانی، یا ملکیت دیکھنے یا خریداری/کرایہ لینے کے بعد دریافت ہونے والے مسائل',
            'قانونی تعمیل، پراپرٹی حقوق، ملکیت کی تصدیق، یا دستاویزات سے متعلق معاملات'
          ]
        },
        section3: {
          title: '3. صارفین کی ذمہ داریاں:',
          text: 'صارفین مکمل طور پر ذمہ دار ہیں:',
          items: [
            'کسی بھی فیصلے سے پہلے پراپرٹی لسٹنگ میں فراہم کردہ تمام معلومات کی تصدیق کرنے کے لیے',
            'پراپرٹیز کی آزادانہ طور پر مکمل جانچ پڑتال، معائنہ، اور قانونی تصدیق کرنے کے لیے',
            'اپنی ذاتی خطرے اور صوابدید پر معاہدے اور لین دین میں داخل ہونے کے لیے',
            'کسی بھی لین دین مکمل کرنے سے پہلے مناسب قانونی، مالی، اور پیشہ ورانہ مشورہ لینے کے لیے',
            'تمام قابل اطلاق قوانین، ضوابط، اور مقامی تقاضوں کی تعمیل کو یقینی بنانے کے لیے'
          ]
        },
        section4: {
          title: '4. ذمہ داری کی حد:',
          text: 'قانون کی زیادہ سے زیادہ حد تک، پراپرٹی پورٹل، اس کے مالکان، آپریٹرز، ملازمین، اور الحاق شدہ ادارے اس پلیٹ فارم یا اس میں موجود کسی بھی پراپرٹی لسٹنگ کے استعمال سے متعلق یا اس سے پیدا ہونے والے کسی بھی براہ راست، بالواسطہ، ضمنی، خصوصی، نتیجہ خیز، یا سزائی نقصانات کے لیے ذمہ دار نہیں ہوں گے۔'
        },
        section5: {
          title: '5. کوئی ضمانت نہیں:',
          text: 'پلیٹ فارم "جیسا ہے" فراہم کیا جاتا ہے بغیر کسی قسم کی ضمانت کے، خواہ واضح یا ضمنی، بشمول لیکن فروخت کے لیے موزونیت، کسی خاص مقصد کے لیے موزونیت، یا عدم خلاف ورزی کی ضمانتوں تک محدود نہیں۔'
        },
        section6: {
          title: '6. نقصان کی تلافی:',
          text: 'اس پلیٹ فارم کو استعمال کرکے، آپ پراپرٹی پورٹل کو پلیٹ فارم کے استعمال، آپ کی پراپرٹی لسٹنگ، یا اس پلیٹ فارم کے استعمال کے نتیجے میں کیے گئے کسی بھی لین دین سے پیدا ہونے والے کسی بھی دعوؤں، نقصانات، ہلاکتوں، ذمہ داریوں، اخراجات، اور اخراجات (قانونی فیسوں سمیت) سے بے ضرر کرنے اور بچانے پر متفق ہوتے ہیں۔'
        },
        section7: {
          title: '7. قبولیت:',
          text: 'معاہدے کی قبولیت باکس کو چیک کرکے اور پراپرٹی لسٹنگ جمع کرواکر، آپ تصدیق کرتے ہیں کہ آپ نے اس صارف معاہدے میں درج تمام شرائط و ضوابط کو پڑھا، سمجھا، اور ان سے پابند ہونے پر متفق ہیں۔'
        },
        warning: 'اگر آپ ان شرائط سے متفق نہیں ہیں، تو اس پلیٹ فارم پر پراپرٹی لسٹنگ جمع نہ کروائیں۔',
        checkboxLabel: 'میں نے اوپر بیان کردہ صارف معاہدہ اور خدمات کی شرائط کو پڑھا، سمجھا، اور ان پر متفق ہوں۔ میں تسلیم کرتا/کرتی ہوں کہ پراپرٹی پورٹل کسی بھی لین دین یا پراپرٹی سے متعلق معاملات کے لیے ذمہ دار نہیں ہے۔',
        errorMessage: 'آپ کو پراپرٹی لسٹنگ جمع کروانے کے لیے صارف معاہدہ قبول کرنا ہوگا۔'
      };
    } else {
      return {
        title: 'User Agreement & Terms of Service',
        notice: 'IMPORTANT NOTICE: PLEASE READ CAREFULLY',
        intro: 'By submitting a property listing on this MereZameen ("the Platform"), you acknowledge and agree to the following terms and conditions:',
        section1: {
          title: '1. Platform Nature:',
          text: 'This MereZameen is a classified advertising platform designed solely for the purpose of creating and displaying property listings. The Platform acts exclusively as an intermediary service provider facilitating the connection between property owners/advertisers and potential buyers/renters.'
        },
        section2: {
          title: '2. No Responsibility for Transactions:',
          text: 'The MereZameen is NOT responsible for, and expressly disclaims any and all liability related to:',
          items: [
            'Any transactions, agreements, or deals entered into between parties using this Platform',
            'The accuracy, completeness, or truthfulness of property listings posted by users',
            'The condition, quality, legality, or availability of any property listed on the Platform',
            'Any disputes, claims, or disagreements arising between property owners and potential buyers/renters',
            'Financial transactions, payments, deposits, or any monetary exchanges between parties',
            'Property defects, misrepresentations, or any issues discovered after viewing or purchasing/renting a property',
            'Legal compliance, property rights, ownership verification, or documentation matters'
          ]
        },
        section3: {
          title: '3. User Responsibilities:',
          text: 'Users are solely responsible for:',
          items: [
            'Verifying all information provided in property listings before making any decisions',
            'Conducting due diligence, inspections, and legal verification of properties independently',
            'Entering into agreements and transactions at their own risk and discretion',
            'Seeking appropriate legal, financial, and professional advice before completing any transaction',
            'Ensuring compliance with all applicable laws, regulations, and local requirements'
          ]
        },
        section4: {
          title: '4. Limitation of Liability:',
          text: 'To the maximum extent permitted by law, the MereZameen, its owners, operators, employees, and affiliates shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from or related to the use of this Platform or any property listings contained herein.'
        },
        section5: {
          title: '5. No Warranty:',
          text: 'The Platform is provided "as is" without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.'
        },
        section6: {
          title: '6. Indemnification:',
          text: 'By using this Platform, you agree to indemnify and hold harmless the MereZameen from any claims, damages, losses, liabilities, costs, and expenses (including legal fees) arising from your use of the Platform, your property listing, or any transactions entered into as a result of using this Platform.'
        },
        section7: {
          title: '7. Acceptance:',
          text: 'By checking the agreement acceptance box and submitting a property listing, you confirm that you have read, understood, and agree to be bound by all terms and conditions set forth in this User Agreement.'
        },
        warning: 'IF YOU DO NOT AGREE TO THESE TERMS, DO NOT SUBMIT A PROPERTY LISTING ON THIS PLATFORM.',
        checkboxLabel: 'I have read, understood, and agree to the User Agreement and Terms of Service stated above. I acknowledge that the MereZameen is not responsible for any transactions or property-related matters.',
        errorMessage: 'You must accept the User Agreement to submit a property listing.'
      };
    }
  }
}

