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
    userName: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.loginFacade.reset();

    this.loginFacade.response$.subscribe(response => {
      if (response?.success) {
            this.showToast('success', response.message ?? 'Login successful.');
            // Redirect to returnUrl or default to /users page after a short delay
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/users';
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

    const { userName, password } = this.loginForm.getRawValue();
    this.loginFacade.submit({
      userName: userName!,
      password: password!
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!control && control.invalid && control.touched;
  }
}

