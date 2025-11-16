import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';

import { UserListActions } from './user-list.actions';
import {
  selectUserList,
  selectUserListError,
  selectUserListLoading
} from './user-list.selectors';

@Injectable({ providedIn: 'root' })
export class UserListFacade {
  private readonly store = inject(Store);

  readonly users$ = this.store.select(selectUserList);
  readonly isLoading$ = this.store.select(selectUserListLoading);
  readonly error$ = this.store.select(selectUserListError);

  load(): void {
    this.store.dispatch(UserListActions.loadUsers({}));
  }
}

