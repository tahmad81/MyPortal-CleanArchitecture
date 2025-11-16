import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
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
  
  toastMessage: { type: 'success' | 'error'; message: string } | null = null;

  readonly isSubmitting$ = this.registerFacade.isSubmitting$;
  readonly successMessage$ = this.registerFacade.successMessage$;
  readonly errorMessage$ = this.registerFacade.errorMessage$;

  readonly registerForm = this.fb.group(
    {
      userName: ['', [Validators.required, Validators.minLength(3)]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, Validators.requiredTrue]
    },
    { validators: passwordMatchValidator('password', 'confirmPassword') }
  );

  ngOnInit(): void {
    this.registerFacade.reset();

    this.successMessage$
      .pipe(
        filter(message => !!message),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(message => {
        this.showToast('success', message!);
        this.registerForm.reset({
          userName: '',
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: '',
          acceptTerms: false
        });
      });

    this.errorMessage$
      .pipe(filter(Boolean), takeUntilDestroyed(this.destroyRef))
      .subscribe(error => {
        this.showToast('error', error!);
      });
  }
  
  showToast(type: 'success' | 'error', message: string): void {
    this.toastMessage = { type, message };
    setTimeout(() => {
      this.toastMessage = null;
    }, 4000);
  }

  submit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { userName, firstName, lastName, email, password } = this.registerForm.getRawValue();

    this.registerFacade.submit({
      userName: userName!,
      firstName: firstName!,
      lastName: lastName!,
      email: email!,
      password: password!
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

