import { createActionGroup, emptyProps, props } from '@ngrx/store';

import { RegisterRequest } from '../../../../../core/models/auth.models';

export const RegisterActions = createActionGroup({
  source: 'Register',
  events: {
    'Submit': props<{ payload: RegisterRequest }>(),
    'Submit Success': props<{ message: string }>(),
    'Submit Failure': props<{ error: string }>(),
    'Reset': emptyProps()
  }
});

