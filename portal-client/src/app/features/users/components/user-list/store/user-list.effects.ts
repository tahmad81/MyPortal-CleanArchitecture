import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';

import { UserService } from '../../../../../core/services/user.service';
import { UserListActions } from './user-list.actions';

@Injectable()
export class UserListEffects {
  private readonly actions$ = inject(Actions);
  private readonly userService = inject(UserService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserListActions.loadUsers),
      switchMap(() =>
        this.userService.getUsers().pipe(
          map(users => UserListActions.loadUsersSuccess({ users })),
          catchError(error =>
            of(
              UserListActions.loadUsersFailure({
                error: this.resolveError(error)
              })
            )
          )
        )
      )
    )
  );

  private resolveError(error: unknown): string {
    if (typeof error === 'string') {
      return error;
    }
    if (error && typeof error === 'object' && 'error' in error) {
      const httpError = error as { error?: { message?: string } };
      return httpError.error?.message ?? 'Unable to load users.';
    }
    return 'Unable to load users.';
  }
}

