export const environment = {
  production: false,
  /**
   * Central definition of API endpoints. Update these paths when backend routes change.
   */
  endpoints: {
    auth: {
      register: '/auth/register',
      login: '/auth/login',
      socialLogin: '/auth/social-login'
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
  },
  recaptcha: {
    siteKey: '6LcfzQ8sAAAAALdNoXUT7ewUz-ZVB2Y6JIxOY9Re'
  },
  firebase: {
    apiKey: "AIzaSyDKlT9Op6L1um2FwjwuIhZ8ynytnt02k-Q",
    authDomain: "propertyportal-4c1a3.firebaseapp.com",
    projectId: "propertyportal-4c1a3",
    storageBucket: "propertyportal-4c1a3.firebasestorage.app",
    messagingSenderId: "180091690364",
    appId: "1:180091690364:web:391387602911a7b89158f9",
    measurementId: "G-M1C7KX6ZK3"
  }
};

