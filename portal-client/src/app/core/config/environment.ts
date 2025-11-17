export const environment = {
  production: false,
  /**
   * Central definition of API endpoints. Update these paths when backend routes change.
   */
  endpoints: {
    auth: {
      register: '/auth/register',
      login: '/auth/login'
    },
    users: {
      list: '/users'
    },
    properties: {
      myAds: '/properties/my-ads',
      create: '/properties',
      latest: '/properties/latest',
      search: '/properties/search',
      detail: '/properties'
    }
  }
};

