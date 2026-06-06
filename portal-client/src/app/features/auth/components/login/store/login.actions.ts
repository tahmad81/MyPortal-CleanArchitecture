import { createActionGroup, emptyProps, props } from '@ngrx/store';

import { AuthResponse, LoginRequest } from '../../../../../core/models/auth.models';

export const LoginActions = createActionGroup({
  source: 'Login',
  events: {
    Submit: props<{ payload: LoginRequest }>(),
    LoginWithGoogle: emptyProps(),
    LoginWithFacebook: emptyProps(),
    'Submit Success': props<{ response: AuthResponse }>(),
    'Submit Failure': props<{ error: string }>(),
    Reset: emptyProps()
  }
});

