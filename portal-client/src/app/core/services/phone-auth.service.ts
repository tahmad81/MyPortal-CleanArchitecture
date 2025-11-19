import { Injectable, inject } from '@angular/core';
import { Auth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from '@angular/fire/auth';
import { Observable, from, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PhoneAuthService {
  private readonly auth = inject(Auth);
  private recaptchaVerifier: RecaptchaVerifier | null = null;
  private confirmationResult: ConfirmationResult | null = null;
  private isInitializing = false;

  /**
   * Initialize reCAPTCHA verifier for Firebase Phone Auth
   */
  initializeRecaptcha(containerId: string = 'recaptcha-container', retryCount: number = 0): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Prevent infinite recursion
        if (retryCount > 2) {
          reject(new Error('Failed to initialize reCAPTCHA after multiple attempts. Please refresh the page.'));
          return;
        }

        // Check if Auth instance is available
        if (!this.auth) {
          reject(new Error('Firebase Auth is not initialized.'));
          return;
        }

        // Check if recaptcha verifier is already initialized
        if (this.recaptchaVerifier && !this.isInitializing) {
          // Check if it's still valid by checking if the container exists
          const container = document.getElementById(containerId);
          if (container) {
            // Already initialized, resolve immediately
            resolve();
            return;
          } else {
            // Container doesn't exist, cleanup and reinitialize
            this.cleanup();
          }
        }

        // Check if container element exists
        const container = document.getElementById(containerId);
        if (!container) {
          reject(new Error(`Container element with id '${containerId}' not found.`));
          return;
        }

        // Check if container already has reCAPTCHA rendered (clear it first)
        if (container.children.length > 0) {
          container.innerHTML = '';
        }

        this.isInitializing = true;

        // Create the recaptcha verifier
        this.recaptchaVerifier = new RecaptchaVerifier(this.auth, containerId, {
          size: 'invisible',
          callback: () => {
            this.isInitializing = false;
            resolve();
          },
          'expired-callback': () => {
            // Don't reject on expiry, just log it
            console.warn('reCAPTCHA expired');
          }
        });

        // Render the recaptcha verifier
        this.recaptchaVerifier.render().then(() => {
          this.isInitializing = false;
          resolve();
        }).catch((error: any) => {
          this.isInitializing = false;
          
          // Check if error is about already rendered reCAPTCHA
          if ((error?.message?.includes('already been rendered') || error?.code === 'auth/recaptcha-already-rendered') && retryCount === 0) {
            // Clear the container and try again once
            container.innerHTML = '';
            this.recaptchaVerifier = null;
            // Retry initialization
            this.initializeRecaptcha(containerId, retryCount + 1).then(resolve).catch(reject);
            return;
          }
          
          let errorMessage = 'Failed to initialize Firebase reCAPTCHA. ';
          if (error?.code === 'auth/configuration-not-found' || error?.message?.includes('CONFIGURATION_NOT_FOUND')) {
            errorMessage += 'Phone Authentication is not enabled in Firebase Console. Please enable it in Firebase Authentication settings.';
          } else if (error?.message?.includes('already been rendered') || error?.code === 'auth/recaptcha-already-rendered') {
            errorMessage += 'reCAPTCHA is already initialized. Please refresh the page if this persists.';
          } else {
            errorMessage += error?.message || 'Please check your Firebase configuration.';
          }
          reject(new Error(errorMessage));
        });
      } catch (error: any) {
        this.isInitializing = false;
        
        // Check if error is about already rendered reCAPTCHA
        if ((error?.message?.includes('already been rendered') || error?.code === 'auth/recaptcha-already-rendered') && retryCount === 0) {
          // Try to cleanup and retry once
          this.cleanup();
          const container = document.getElementById(containerId);
          if (container) {
            container.innerHTML = '';
            this.initializeRecaptcha(containerId, retryCount + 1).then(resolve).catch(reject);
            return;
          }
        }
        
        let errorMessage = 'Failed to initialize Firebase reCAPTCHA. ';
        if (error?.code === 'auth/configuration-not-found' || error?.message?.includes('CONFIGURATION_NOT_FOUND')) {
          errorMessage += 'Phone Authentication is not enabled in Firebase Console. Please enable it in Firebase Authentication settings.';
        } else {
          errorMessage += error?.message || 'Please check your Firebase configuration.';
        }
        reject(new Error(errorMessage));
      }
    });
  }

  /**
   * Send OTP to the provided phone number
   */
  sendOTP(phoneNumber: string): Observable<string> {
    if (!this.recaptchaVerifier) {
      return throwError(() => new Error('reCAPTCHA verifier not initialized. Please try again.'));
    }

    // Ensure phone number starts with +
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

    return from(signInWithPhoneNumber(this.auth, formattedPhone, this.recaptchaVerifier)).pipe(
      map((confirmationResult) => {
        this.confirmationResult = confirmationResult;
        return 'OTP sent successfully';
      }),
      catchError((error) => {
        let errorMessage = 'Failed to send OTP. ';
        if (error.code === 'auth/configuration-not-found' || error.message?.includes('CONFIGURATION_NOT_FOUND')) {
          errorMessage += 'Phone Authentication is not enabled in Firebase Console. Please enable it in Firebase Authentication settings.';
        } else if (error.code === 'auth/recaptcha-already-rendered' || error.message?.includes('already been rendered')) {
          // If reCAPTCHA is already rendered, try to cleanup and retry
          this.cleanup();
          const container = document.getElementById('recaptcha-phone-container');
          if (container) {
            container.innerHTML = '';
          }
          errorMessage += 'reCAPTCHA error. Please try again.';
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage += 'Too many attempts. Please try again later.';
        } else if (error.code === 'auth/invalid-phone-number') {
          errorMessage += 'Invalid phone number format.';
        } else {
          errorMessage += error.message || 'Please try again.';
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Verify the OTP code and return Firebase ID token
   */
  verifyOTP(code: string): Observable<string> {
    if (!this.confirmationResult) {
      return throwError(() => new Error('No verification in progress. Please send OTP first.'));
    }

    return from(this.confirmationResult.confirm(code)).pipe(
      map((userCredential) => {
        if (!userCredential.user) {
          throw new Error('Verification failed. User credential is null.');
        }
        return userCredential.user;
      }),
      switchMap((user) => {
        return from(user.getIdToken()).pipe(
          map((idToken) => {
            this.cleanup();
            return idToken;
          })
        );
      }),
      catchError((error) => {
        let errorMessage = 'Invalid OTP code. ';
        if (error.code === 'auth/invalid-verification-code') {
          errorMessage += 'The code you entered is incorrect.';
        } else if (error.code === 'auth/code-expired') {
          errorMessage += 'The code has expired. Please request a new one.';
        } else {
          errorMessage += error.message || 'Please try again.';
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Verify OTP (simplified version that directly returns the token)
   */
  async verifyOTPAsync(code: string): Promise<string> {
    if (!this.confirmationResult) {
      throw new Error('No verification in progress. Please send OTP first.');
    }

    try {
      const userCredential = await this.confirmationResult.confirm(code);
      if (!userCredential.user) {
        throw new Error('Verification failed. User credential is null.');
      }
      const idToken = await userCredential.user.getIdToken();
      this.cleanup();
      return idToken;
    } catch (error: any) {
      let errorMessage = 'Invalid OTP code. ';
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage += 'The code you entered is incorrect.';
      } else if (error.code === 'auth/code-expired') {
        errorMessage += 'The code has expired. Please request a new one.';
      } else {
        errorMessage += error.message || 'Please try again.';
      }
      throw new Error(errorMessage);
    }
  }

  /**
   * Clean up recaptcha verifier and confirmation result
   */
  cleanup(): void {
    if (this.recaptchaVerifier) {
      try {
        this.recaptchaVerifier.clear();
      } catch (error) {
        // Ignore errors during cleanup
        console.warn('Error during reCAPTCHA cleanup:', error);
      }
      this.recaptchaVerifier = null;
    }
    this.confirmationResult = null;
  }

  /**
   * Reset the verification process
   */
  reset(): void {
    this.cleanup();
  }
}

