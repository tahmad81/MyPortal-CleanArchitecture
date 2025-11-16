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
  
  protected readonly menuItems: MenuItem[] = [
    { title: 'Dashboard', icon: '🏠', link: '/' },
    { title: 'Search', icon: '🔍', link: '/properties/search' },
    { title: 'My Ads', icon: '📋', link: '/properties/my-ads' },
    { title: 'Login', icon: '🔐', link: '/auth/login' },
    { title: 'Register', icon: '👤', link: '/auth/register' },
    { title: 'Users', icon: '👥', link: '/users' },
    { title: 'Settings', icon: '⚙️', link: '/settings' }
  ];
  
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
