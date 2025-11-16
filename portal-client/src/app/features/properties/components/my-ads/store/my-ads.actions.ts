import { createActionGroup, emptyProps, props } from '@ngrx/store';

import { PropertyListResponse } from '../../../../../core/models/property.models';

export const MyAdsActions = createActionGroup({
  source: 'My Ads',
  events: {
    Load: emptyProps(),
    'Load Success': props<{ response: PropertyListResponse }>(),
    'Load Failure': props<{ error: string }>(),
    Reset: emptyProps()
  }
});

