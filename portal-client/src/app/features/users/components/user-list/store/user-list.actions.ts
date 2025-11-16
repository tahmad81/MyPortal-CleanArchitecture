import { createActionGroup, props } from '@ngrx/store';

import { UserSummary } from '../../../../../core/models/user.models';

export const UserListActions = createActionGroup({
  source: 'UserList',
  events: {
    'Load Users': props<{ force?: boolean }>(),
    'Load Users Success': props<{ users: UserSummary[] }>(),
    'Load Users Failure': props<{ error: string }>()
  }
});

