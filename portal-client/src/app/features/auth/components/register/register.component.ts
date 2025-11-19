import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, afterNextRender } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

import { RegisterFacade } from './store/register.facade';
import { PhoneAuthService } from '../../../../core/services/phone-auth.service';
import { RecaptchaService } from '../../../../core/services/recaptcha.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly registerFacade = inject(RegisterFacade);
  private readonly phoneAuthService = inject(PhoneAuthService);
  private readonly recaptchaService = inject(RecaptchaService);
  
  toastMessage: { type: 'success' | 'error'; message: string } | null = null;

  readonly isSubmitting$ = this.registerFacade.isSubmitting$;
  readonly successMessage$ = this.registerFacade.successMessage$;
  readonly errorMessage$ = this.registerFacade.errorMessage$;

  // OTP flow state
  otpSent = false;
  otpVerified = false;
  sendingOTP = false;
  verifyingOTP = false;
  recaptchaToken = '';
  firebaseIdToken = '';
  recaptchaWidgetId: number | null = null;

  readonly registerForm = this.fb.group(
    {
      userName: ['', [Validators.required, Validators.minLength(3)]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{10,15}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      otpCode: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
      acceptTerms: [false, Validators.requiredTrue]
    },
    { validators: passwordMatchValidator('password', 'confirmPassword') }
  );

  constructor() {
    // Use afterNextRender to ensure DOM is ready (must be in injection context)
    afterNextRender(() => {
      this.initializeRecaptcha();
    });
  }

  ngOnInit(): void {
    this.registerFacade.reset();

    this.successMessage$
      .pipe(
        filter(message => !!message),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(message => {
        this.showToast('success', message!);
        this.resetForm();
      });

    this.errorMessage$
      .pipe(filter(Boolean), takeUntilDestroyed(this.destroyRef))
      .subscribe(error => {
        this.showToast('error', error!);
        // Reset reCAPTCHA on error
        if (this.recaptchaWidgetId !== null) {
          this.recaptchaService.reset();
        }
      });
  }

  private async initializeRecaptcha(): Promise<void> {
    // Initialize reCAPTCHA v2 (for form submission)
    try {
      const widgetId = await this.recaptchaService.render('recaptcha-container');
      this.recaptchaWidgetId = widgetId;
    } catch (error) {
      console.error('Failed to initialize reCAPTCHA:', error);
      this.showToast('error', 'Failed to initialize reCAPTCHA. Please refresh the page.');
    }

    // Note: Firebase Phone Auth reCAPTCHA is initialized lazily when sending OTP
    // to avoid configuration-not-found errors during component initialization
  }

  resetForm(): void {
    this.registerForm.reset({
      userName: '',
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      otpCode: '',
      acceptTerms: false
    });
    this.otpSent = false;
    this.otpVerified = false;
    this.recaptchaToken = '';
    this.firebaseIdToken = '';
    if (this.recaptchaWidgetId !== null) {
      this.recaptchaService.reset();
    }
    this.phoneAuthService.reset();
  }
  
  showToast(type: 'success' | 'error', message: string): void {
    this.toastMessage = { type, message };
    setTimeout(() => {
      this.toastMessage = null;
    }, 4000);
  }

  async sendOTP(): Promise<void> {
    const phoneNumber = this.registerForm.get('phoneNumber')?.value;
    
    if (!phoneNumber || this.registerForm.get('phoneNumber')?.invalid) {
      this.registerForm.get('phoneNumber')?.markAsTouched();
      this.showToast('error', 'Please enter a valid phone number.');
      return;
    }

    // Check if reCAPTCHA widget is initialized
    if (this.recaptchaWidgetId === null) {
      this.showToast('error', 'reCAPTCHA is not initialized. Please refresh the page.');
      return;
    }

    // Get reCAPTCHA token - try from service first, then directly with widgetId
    let recaptchaResponse = this.recaptchaService.getResponse();
    
    // If service doesn't have response, try directly with stored widgetId
    if ((!recaptchaResponse || recaptchaResponse.length === 0) && this.recaptchaWidgetId !== null) {
      if (typeof window !== 'undefined' && (window as any).grecaptcha && (window as any).grecaptcha.getResponse) {
        recaptchaResponse = (window as any).grecaptcha.getResponse(this.recaptchaWidgetId);
      }
    }

    if (!recaptchaResponse || recaptchaResponse.length === 0) {
      this.showToast('error', 'Please complete the reCAPTCHA verification by checking the box below.');
      return;
    }
    this.recaptchaToken = recaptchaResponse;

    // Initialize Firebase Phone Auth reCAPTCHA lazily if not already initialized
    try {
      await this.phoneAuthService.initializeRecaptcha('recaptcha-phone-container');
    } catch (error: any) {
      // Check if it's a configuration error
      const errorMessage = error?.message || '';
      if (errorMessage.includes('CONFIGURATION_NOT_FOUND') || errorMessage.includes('configuration-not-found') || 
          errorMessage.includes('Phone Authentication is not enabled')) {
        this.showToast('error', 'Phone Authentication is not configured. Please enable it in Firebase Console under Authentication > Sign-in method > Phone.');
        this.sendingOTP = false;
        return;
      }
      // Check if it's an "already rendered" error - this is usually fine, we can continue
      if (errorMessage.includes('already been rendered') || errorMessage.includes('recaptcha-already-rendered')) {
        // This is okay, the reCAPTCHA is already initialized, we can continue
        console.log('Firebase reCAPTCHA already initialized, continuing...');
      } else {
        // If other initialization error, try to continue anyway (might already be initialized)
        console.warn('Firebase reCAPTCHA initialization warning:', error);
      }
    }

    this.sendingOTP = true;
    try {
      await new Promise<void>((resolve, reject) => {
        this.phoneAuthService.sendOTP(phoneNumber).subscribe({
          next: () => resolve(),
          error: (err) => reject(err)
        });
      });
      this.otpSent = true;
      this.showToast('success', 'OTP sent to your phone number.');
    } catch (error: any) {
      let errorMessage = error?.message || 'Failed to send OTP. Please try again.';
      // Check for configuration errors
      if (errorMessage.includes('CONFIGURATION_NOT_FOUND') || errorMessage.includes('configuration-not-found') || 
          errorMessage.includes('Phone Authentication is not enabled')) {
        errorMessage = 'Phone Authentication is not configured. Please enable it in Firebase Console under Authentication > Sign-in method > Phone.';
      }
      this.showToast('error', errorMessage);
    } finally {
      this.sendingOTP = false;
    }
  }

  async verifyOTP(): Promise<void> {
    const otpCode = this.registerForm.get('otpCode')?.value;
    
    if (!otpCode || this.registerForm.get('otpCode')?.invalid) {
      this.registerForm.get('otpCode')?.markAsTouched();
      this.showToast('error', 'Please enter a valid 6-digit OTP code.');
      return;
    }

    this.verifyingOTP = true;
    try {
      const idToken = await this.phoneAuthService.verifyOTPAsync(otpCode);
      this.firebaseIdToken = idToken;
      this.otpVerified = true;
      this.showToast('success', 'Phone number verified successfully.');
    } catch (error: any) {
      this.showToast('error', error.message || 'Invalid OTP code. Please try again.');
    } finally {
      this.verifyingOTP = false;
    }
  }

  submit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    if (!this.otpVerified) {
      this.showToast('error', 'Please verify your phone number with OTP first.');
      return;
    }

    // Check if reCAPTCHA is currently verified and get fresh token
    // Try using the stored widgetId from component if service doesn't have it
    let currentRecaptchaResponse = this.recaptchaService.getResponse();
    
    // If no response from service, try directly with stored widgetId
    if ((!currentRecaptchaResponse || currentRecaptchaResponse.length === 0) && this.recaptchaWidgetId !== null) {
      if (typeof window !== 'undefined' && (window as any).grecaptcha && (window as any).grecaptcha.getResponse) {
        currentRecaptchaResponse = (window as any).grecaptcha.getResponse(this.recaptchaWidgetId);
      }
    }

    if (!currentRecaptchaResponse || currentRecaptchaResponse.length === 0) {
      this.showToast('error', 'Please complete the reCAPTCHA verification.');
      return;
    }
    
    // Use current response (always use fresh token to avoid expiration issues)
    const recaptchaTokenToUse = currentRecaptchaResponse;

    if (!this.firebaseIdToken) {
      this.showToast('error', 'Please verify your phone number with OTP first.');
      return;
    }

    const { userName, firstName, lastName, email, phoneNumber, password } = this.registerForm.getRawValue();

    this.registerFacade.submit({
      userName: userName!,
      firstName: firstName!,
      lastName: lastName!,
      email: email!,
      phoneNumber: phoneNumber!,
      password: password!,
      recaptchaToken: recaptchaTokenToUse,
      firebaseIdToken: this.firebaseIdToken
    });
  }

  getControl(path: string): AbstractControl | null {
    return this.registerForm.get(path);
  }
}

function passwordMatchValidator(passwordKey: string, confirmPasswordKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get(passwordKey)?.value;
    const confirmPassword = group.get(confirmPasswordKey)?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword ? null : { passwordMismatch: true };
  };
}

