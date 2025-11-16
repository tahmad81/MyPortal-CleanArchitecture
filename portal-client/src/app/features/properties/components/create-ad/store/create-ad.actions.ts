import { createActionGroup, emptyProps, props } from '@ngrx/store';

import { CreatePropertyRequest, PropertyResponse } from '../../../../../core/models/property.models';

export const CreateAdActions = createActionGroup({
  source: 'Create Ad',
  events: {
    Submit: props<{ request: CreatePropertyRequest }>(),
    'Submit Success': props<{ response: PropertyResponse }>(),
    'Submit Failure': props<{ error: string }>(),
    Reset: emptyProps()
  }
});

