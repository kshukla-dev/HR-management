import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { HeaderComponent } from './shared/components/header.component';
import { SidebarComponent } from './shared/components/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  readonly authService = inject(AuthService);
  readonly router = inject(Router);
  isLoading = this.authService.isLoading;

  isLoginPage(): boolean {
    return this.router.url.includes('/login');
  }
}
