import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStateService } from './core/services/auth-state.service';
import { TokenStorageService } from './core/services/token-storage.service';

interface MenuItem {
  title: string;
  icon: string;
  link: string;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private readonly authState = inject(AuthStateService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly router = inject(Router);
  
  showLogoutDialog = false;
  
  private readonly allMenuItems: MenuItem[] = [
    { title: 'Dashboard', icon: '🏠', link: '/' },
    { title: 'My Ads', icon: '📋', link: '/properties/my-ads' },
    { title: 'Login', icon: '🔐', link: '/auth/login' },
    { title: 'Register', icon: '👤', link: '/auth/register' },
    { title: 'Logout', icon: '🚪', link: '/logout' },
    { title: 'Users', icon: '👥', link: '/users' },
    { title: 'Settings', icon: '⚙️', link: '/settings' }
  ];
  
  // Getter that filters menu items based on login status and superadmin
  protected get menuItems(): MenuItem[] {
    const isLoggedIn = this.authState.currentUser() !== null;
    const isSuperAdmin = this.isSuperAdmin();
    
    return this.allMenuItems.filter(item => {
      // Hide Login if logged in
      if (item.link === '/auth/login' && isLoggedIn) {
        return false;
      }
      // Hide Logout if not logged in
      if (item.link === '/logout' && !isLoggedIn) {
        return false;
      }
      // Hide Register if logged in
      if (item.link === '/auth/register' && isLoggedIn) {
        return false;
      }
      // Hide My Ads if not logged in
      if (item.link === '/properties/my-ads' && !isLoggedIn) {
        return false;
      }
      // Hide Users and Settings if not superadmin
      if ((item.link === '/users' || item.link === '/settings') && !isSuperAdmin) {
        return false;
      }
      return true;
    });
  }

  private isSuperAdmin(): boolean {
    const token = this.tokenStorage.getToken();
    if (!token) {
      return false;
    }
    
    try {
      // Decode JWT token to get IsSuperAdmin claim
      const base64Url = token.split('.')[1];
      if (!base64Url) {
        return false;
      }
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      return payload.IsSuperAdmin === 'true';
    } catch (error) {
      console.error('Error decoding token:', error);
      return false;
    }
  }
  
  sidebarOpen = true;
  userMenuOpen = false;
  
  // Expose currentUser signal for template
  readonly currentUser = this.authState.currentUser;
  
  ngOnInit(): void {
    // User state is already loaded from localStorage by the service
  }
  
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
  
  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }
  
  closeUserMenu() {
    this.userMenuOpen = false;
  }
  
  getUserName(): string {
    return this.authState.getUserName() || 'Guest';
  }
  
  getUserEmail(): string | null {
    const user = this.authState.currentUser();
    return user?.email || null;
  }
  
  getUserInitials(): string {
    return this.authState.getInitials();
  }
  
  isLoggedIn(): boolean {
    return this.authState.getUserName() !== null;
  }
  
  get isDashboardRoute(): boolean {
    const url = this.router.url;
    return url === '/' || url === '/home' || url.startsWith('/?');
  }
  
  navigateToCreateProperty(): void {
    this.router.navigate(['/properties/create']);
  }
  
  logout(): void {
    this.userMenuOpen = false;
    this.showLogoutDialog = true;
  }
  
  confirmLogout(): void {
    this.showLogoutDialog = false;
    this.authState.clearUser();
    this.tokenStorage.clearToken();
    this.router.navigate(['/auth/login']);
  }
  
  cancelLogout(): void {
    this.showLogoutDialog = false;
  }
}
