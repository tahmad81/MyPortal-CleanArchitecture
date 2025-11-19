import { Injectable, inject } from '@angular/core';
import { environment } from '../config/environment';

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      render: (container: string | HTMLElement, options: any) => number;
      reset: (widgetId?: number) => void;
      getResponse: (widgetId?: number) => string;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class RecaptchaService {
  private readonly siteKey = environment.recaptcha.siteKey;
  private widgetId: number | null = null;
  private scriptLoaded = false;
  private scriptLoading = false;

  /**
   * Load reCAPTCHA script if not already loaded
   */
  loadScript(): Promise<void> {
    if (this.scriptLoaded) {
      return Promise.resolve();
    }

    if (this.scriptLoading) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (this.scriptLoaded) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      });
    }

    this.scriptLoading = true;

    return new Promise((resolve, reject) => {
      if (window.grecaptcha) {
        this.scriptLoaded = true;
        this.scriptLoading = false;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=explicit`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        window.grecaptcha.ready(() => {
          this.scriptLoaded = true;
          this.scriptLoading = false;
          resolve();
        });
      };

      script.onerror = () => {
        this.scriptLoading = false;
        reject(new Error('Failed to load reCAPTCHA script'));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Render reCAPTCHA v2 checkbox
   */
  async render(containerId: string): Promise<number> {
    await this.loadScript();

    return new Promise((resolve, reject) => {
      window.grecaptcha.ready(() => {
        try {
          const widgetId = window.grecaptcha.render(containerId, {
            sitekey: this.siteKey,
            callback: () => {
              // reCAPTCHA verified - response is now available
            },
            'expired-callback': () => {
              // reCAPTCHA expired - but keep widgetId so we can still access it
              // The response will be empty until user verifies again
            },
            'error-callback': () => {
              // reCAPTCHA error - but keep widgetId so we can still access it
              // The response will be empty until user verifies again
            }
          });
          this.widgetId = widgetId;
          resolve(widgetId);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * Get reCAPTCHA response token
   */
  getResponse(): string {
    if (!this.widgetId) {
      return '';
    }
    return window.grecaptcha.getResponse(this.widgetId);
  }

  /**
   * Reset reCAPTCHA (but keep widgetId so we can get response after re-verification)
   */
  reset(): void {
    if (this.widgetId !== null) {
      window.grecaptcha.reset(this.widgetId);
      // Don't set widgetId to null - keep it so we can get response after re-verification
    }
  }

  /**
   * Check if reCAPTCHA is verified
   */
  isVerified(): boolean {
    return this.getResponse().length > 0;
  }

  /**
   * Get the current widget ID
   */
  getWidgetId(): number | null {
    return this.widgetId;
  }
}

