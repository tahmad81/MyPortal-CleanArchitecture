import { createSelector } from '@ngrx/store';

import { userListFeature } from './user-list.reducer';

export const selectUserListState = userListFeature.selectUserListState;

export const selectUserList = createSelector(selectUserListState, state => state.users);

export const selectUserListLoading = createSelector(selectUserListState, state => state.isLoading);

export const selectUserListError = createSelector(selectUserListState, state => state.error);

