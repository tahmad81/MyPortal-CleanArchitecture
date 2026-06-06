import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { LoginFacade } from './store/login.facade';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly loginFacade = inject(LoginFacade);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  
  toastMessage: { type: 'success' | 'error'; message: string } | null = null;

  readonly isSubmitting$ = this.loginFacade.isSubmitting$;
  readonly response$ = this.loginFacade.response$;
  readonly error$ = this.loginFacade.error$;

  readonly loginForm = this.fb.group({
    userName: ['', [Validators.required, Validators.pattern(/\S+/)]],
    password: ['', [Validators.required, Validators.pattern(/\S+/)]]
  });

  ngOnInit(): void {
    this.loginFacade.reset();
    this.loginFacade.response$.subscribe(response => {
      if (response?.success) {
            this.showToast('success', response.message ?? 'Login successful.');
            // Redirect to returnUrl or default to dashboard after showing success message
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
            setTimeout(() => {
              this.router.navigate([returnUrl]);
            }, 1500);
      }
    });

    this.loginFacade.error$.subscribe(error => {
      if (error) {
        this.showToast('error', error);
      }
    });
  }
  
  showToast(type: 'success' | 'error', message: string): void {
    this.toastMessage = { type, message };
    setTimeout(() => {
      this.toastMessage = null;
    }, 4000);
  }

  submit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const userName = (this.loginForm.get('userName')?.value as string | null)?.trim() ?? '';
    const password = (this.loginForm.get('password')?.value as string | null)?.trim() ?? '';

    if (!userName || !password) {
      this.loginForm.get('userName')?.markAsTouched();
      this.loginForm.get('password')?.markAsTouched();
      return;
    }

    this.loginFacade.submit({ userName, password });
  }

  loginWithGoogle(): void {
    this.loginFacade.loginWithGoogle();
  }

  loginWithFacebook(): void {
    this.loginFacade.loginWithFacebook();
  }

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!control && control.invalid && control.touched;
  }
}

