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
import { AuthService } from '../../../../core/services/auth.service';
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
  private readonly authService = inject(AuthService);
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
  emailOtp = '';
  recaptchaWidgetId: number | null = null;

  readonly registerForm = this.fb.group(
    {
      userName: ['', [Validators.required, Validators.minLength(3)]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''], // Optional now
      password: ['', [Validators.required, Validators.minLength(3)]],
      confirmPassword: ['', [Validators.required]],
      otpCode: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
      acceptTerms: [false, Validators.requiredTrue]
    },
    { validators: passwordMatchValidator('password', 'confirmPassword') }
  );

  constructor() {
    // reCAPTCHA is disabled - no initialization needed
    // afterNextRender(() => {
    //   this.initializeRecaptcha();
    // });
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
    // reCAPTCHA is disabled - no initialization needed
    // This method is kept for compatibility but does nothing
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
    this.emailOtp = '';
    if (this.recaptchaWidgetId !== null) {
      this.recaptchaService.reset();
    }
  }
  
  showToast(type: 'success' | 'error', message: string): void {
    this.toastMessage = { type, message };
    setTimeout(() => {
      this.toastMessage = null;
    }, 4000);
  }

  async sendOTP(): Promise<void> {
    const email = this.registerForm.get('email')?.value;
    
    if (!email || this.registerForm.get('email')?.invalid) {
      this.registerForm.get('email')?.markAsTouched();
      this.showToast('error', 'Please enter a valid email address.');
      return;
    }

    this.sendingOTP = true;
    try {
      await new Promise<void>((resolve, reject) => {
        this.authService.sendEmailOtp(email).subscribe({
          next: (response) => {
            if (response.success) {
              resolve();
            } else {
              reject(new Error(response.message || 'Failed to send OTP. Please try again.'));
            }
          },
          error: (err) => {
            let errorMessage = 'Failed to send OTP. Please try again.';
            if (err?.error?.message) {
              errorMessage = err.error.message;
            } else if (err?.message) {
              errorMessage = err.message;
            } else if (typeof err === 'string') {
              errorMessage = err;
            }
            reject(new Error(errorMessage));
          }
        });
      });
      this.otpSent = true;
      this.showToast('success', 'OTP sent to your email address.');
    } catch (error: any) {
      const errorMessage = error?.message || error?.error?.message || 'Failed to send OTP. Please try again.';
      this.showToast('error', errorMessage);
    } finally {
      this.sendingOTP = false;
    }
  }

  async verifyOTP(): Promise<void> {
    const otpCode = this.registerForm.get('otpCode')?.value;
    const email = this.registerForm.get('email')?.value;
    
    if (!otpCode || this.registerForm.get('otpCode')?.invalid) {
      this.registerForm.get('otpCode')?.markAsTouched();
      this.showToast('error', 'Please enter a valid 6-digit OTP code.');
      return;
    }

    if (!email) {
      this.showToast('error', 'Email is required.');
      return;
    }

    this.verifyingOTP = true;
    try {
      await new Promise<void>((resolve, reject) => {
        this.authService.verifyEmailOtp(email, otpCode).subscribe({
          next: (response) => {
            if (response.success) {
              this.emailOtp = otpCode;
              resolve();
            } else {
              reject(new Error(response.message || 'Invalid OTP code. Please try again.'));
            }
          },
          error: (err) => {
            let errorMessage = 'Invalid OTP code. Please try again.';
            if (err?.error?.message) {
              errorMessage = err.error.message;
            } else if (err?.message) {
              errorMessage = err.message;
            } else if (typeof err === 'string') {
              errorMessage = err;
            }
            reject(new Error(errorMessage));
          }
        });
      });
      this.otpVerified = true;
      this.showToast('success', 'Email verified successfully.');
    } catch (error: any) {
      const errorMessage = error?.message || error?.error?.message || 'Invalid OTP code. Please try again.';
      this.showToast('error', errorMessage);
    } finally {
      this.verifyingOTP = false;
    }
  }

  onSubmitClick(): void {
    // Check form validity and OTP verification before submitting
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.showToast('error', 'Please fill all required fields correctly.');
      return;
    }

    if (!this.otpVerified) {
      this.showToast('error', 'Please verify your email with OTP first.');
      return;
    }

    // Proceed with submission
    this.submit();
  }

  submit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    if (!this.otpVerified) {
      this.showToast('error', 'Please verify your email with OTP first.');
      return;
    }

    // reCAPTCHA is disabled - use empty string as token
    const recaptchaTokenToUse = '';

    if (!this.emailOtp) {
      this.showToast('error', 'Please verify your email with OTP first.');
      return;
    }

    const { userName, firstName, lastName, email, phoneNumber, password } = this.registerForm.getRawValue();

    this.registerFacade.submit({
      userName: userName!,
      firstName: firstName!,
      lastName: lastName!,
      email: email!,
      phoneNumber: phoneNumber || undefined,
      password: password!,
      recaptchaToken: recaptchaTokenToUse,
      emailOtp: this.emailOtp
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

