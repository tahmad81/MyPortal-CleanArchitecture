import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';

@Injectable()
export class WorkflowEffects {
  private readonly actions$ = inject(Actions);

  // Add any side effects here if needed in the future
  // For now, this is a placeholder for potential future effects
}

