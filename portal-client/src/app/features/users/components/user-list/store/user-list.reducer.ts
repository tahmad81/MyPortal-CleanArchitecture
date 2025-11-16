import { createFeature, createReducer, on } from '@ngrx/store';

import { UserSummary } from '../../../../../core/models/user.models';
import { UserListActions } from './user-list.actions';

export const userListFeatureKey = 'userList';

export interface UserListState {
  isLoading: boolean;
  users: UserSummary[];
  error: string | null;
}

const initialState: UserListState = {
  isLoading: false,
  users: [],
  error: null
};

const userListReducer = createReducer(
  initialState,
  on(UserListActions.loadUsers, state => ({
    ...state,
    isLoading: true,
    error: null
  })),
  on(UserListActions.loadUsersSuccess, (state, { users }) => ({
    ...state,
    isLoading: false,
    users,
    error: null
  })),
  on(UserListActions.loadUsersFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  }))
);

export const userListFeature = createFeature({
  name: userListFeatureKey,
  reducer: userListReducer
});

