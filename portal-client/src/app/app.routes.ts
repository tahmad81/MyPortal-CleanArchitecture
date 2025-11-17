import { Routes } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';

import { LoginEffects } from './features/auth/components/login/store/login.effects';
import { loginFeature } from './features/auth/components/login/store/login.reducer';
import { RegisterEffects } from './features/auth/components/register/store/register.effects';
import { registerFeature } from './features/auth/components/register/store/register.reducer';
import { UserListEffects } from './features/users/components/user-list/store/user-list.effects';
import { userListFeature } from './features/users/components/user-list/store/user-list.reducer';
import { MyAdsEffects } from './features/properties/components/my-ads/store/my-ads.effects';
import { myAdsFeature } from './features/properties/components/my-ads/store/my-ads.reducer';
import { CreateAdEffects } from './features/properties/components/create-ad/store/create-ad.effects';
import { createAdFeature } from './features/properties/components/create-ad/store/create-ad.reducer';
import { DashboardEffects } from './features/properties/components/dashboard/store/dashboard.effects';
import { dashboardFeature } from './features/properties/components/dashboard/store/dashboard.reducer';
import { SearchEffects } from './features/properties/components/search/store/search.effects';
import { searchFeature } from './features/properties/components/search/store/search.reducer';
import { PropertyDetailEffects } from './features/properties/components/property-detail/store/property-detail.effects';
import { propertyDetailFeature } from './features/properties/components/property-detail/store/property-detail.reducer';
import { EditPropertyEffects } from './features/properties/components/edit-property/store/edit-property.effects';
import { editPropertyFeature } from './features/properties/components/edit-property/store/edit-property.reducer';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./features/auth/components/register/register.component').then(m => m.RegisterComponent),
    providers: [provideState(registerFeature), provideEffects(RegisterEffects)]
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/components/login/login.component').then(m => m.LoginComponent),
    providers: [provideState(loginFeature), provideEffects(LoginEffects)]
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./features/users/components/user-list/user-list.component').then(m => m.UserListComponent),
    providers: [provideState(userListFeature), provideEffects(UserListEffects)],
    canActivate: [authGuard]
  },
  {
    path: 'properties/my-ads',
    loadComponent: () =>
      import('./features/properties/components/my-ads/my-ads.component').then(m => m.MyAdsComponent),
    providers: [provideState(myAdsFeature), provideEffects(MyAdsEffects)],
    canActivate: [authGuard]
  },
  {
    path: 'properties/create',
    loadComponent: () =>
      import('./features/properties/components/create-ad/create-ad.component').then(m => m.CreateAdComponent),
    providers: [provideState(createAdFeature), provideEffects(CreateAdEffects)],
    canActivate: [authGuard]
  },
  {
    path: 'properties/edit/:id',
    loadComponent: () =>
      import('./features/properties/components/edit-property/edit-property.component').then(m => m.EditPropertyComponent),
    providers: [provideState(editPropertyFeature), provideEffects(EditPropertyEffects)],
    canActivate: [authGuard]
  },
  {
    path: 'properties/search',
    loadComponent: () =>
      import('./features/properties/components/search/search.component').then(m => m.SearchComponent),
    providers: [provideState(searchFeature), provideEffects(SearchEffects)]
  },
  {
    path: 'properties/:id',
    loadComponent: () =>
      import('./features/properties/components/property-detail/property-detail.component').then(m => m.PropertyDetailComponent),
    providers: [provideState(propertyDetailFeature), provideEffects(PropertyDetailEffects)]
  },
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/properties/components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    providers: [provideState(dashboardFeature), provideEffects(DashboardEffects)]
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./features/properties/components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    providers: [provideState(dashboardFeature), provideEffects(DashboardEffects)]
  },
  {
    path: '**',
    redirectTo: '/'
  }
];
