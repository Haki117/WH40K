import { Component, signal, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HomeComponent } from '../pages/home/home.component';
import { PlayersComponent } from '../pages/players/players.component';
import { RankingScoreboardComponent } from '../pages/ranking/ranking-scoreboard.component';
import { GamesComponent } from '../pages/games/games.component';

export type TabType = 'home' | 'players' | 'scoreboard' | 'games';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    HomeComponent,
    PlayersComponent,
    RankingScoreboardComponent,
    GamesComponent,
  ],
  template: `
    <div class="app-shell">
      <!-- Header with Club Branding -->
      <header class="app-header" [class.header-hidden]="isHeaderHidden()">
        <div class="header-content">
          <div class="club-branding">
            <div class="club-logo">
              <div class="logo-placeholder">⚔️</div>
            </div>
            <div class="club-info">
              <h1 class="club-name">WH40K Club Thun</h1>
              <p class="club-tagline">In the grim darkness of the far future, there is only war</p>
            </div>
          </div>

          <!-- Navigation Tabs -->
          <nav class="tab-navigation" *ngIf="activeTab() !== 'home'">
            <button
              class="tab-button"
              [class.active]="activeTab() === 'players'"
              [class.has-content]="playerCount() > 0"
              (click)="setActiveTab('players')"
            >
              <span class="tab-indicator" *ngIf="playerCount() > 0"></span>
              <span class="tab-icon">👥</span>
              Players
              <span class="tab-badge" *ngIf="playerCount() > 0">{{ playerCount() }}</span>
            </button>
            <button
              class="tab-button"
              [class.active]="activeTab() === 'scoreboard'"
              [class.has-new]="hasNewScores()"
              (click)="setActiveTab('scoreboard')"
              (contextmenu)="showContextMenu($event, 'scoreboard')"
            >
              <span class="tab-indicator new" *ngIf="hasNewScores()"></span>
              <span class="tab-icon">🏆</span>
              Scoreboard
              <span class="tab-badge new" *ngIf="hasNewScores()">!</span>
            </button>
            <button
              class="tab-button"
              [class.active]="activeTab() === 'games'"
              [class.has-content]="activeGames() > 0"
              (click)="setActiveTab('games')"
            >
              <span class="tab-indicator" *ngIf="activeGames() > 0"></span>
              <span class="tab-icon">⚔️</span>
              Games
              <span class="tab-badge" *ngIf="activeGames() > 0">{{ activeGames() }}</span>
            </button>
          </nav>

          <!-- Utility Menu -->
          <div class="utility-menu" *ngIf="activeTab() !== 'home'">
            <button class="utility-button" (click)="toggleUtilityMenu()">
              <span class="utility-icon">⚙️</span>
            </button>
            <div class="utility-dropdown" *ngIf="showUtilityMenu()">
              <button class="utility-item" (click)="exportData()">
                <span class="item-icon">📤</span>
                Export Data
              </button>
              <button class="utility-item" (click)="importData()">
                <span class="item-icon">📥</span>
                Import Data
              </button>
              <button class="utility-item" (click)="resetData()">
                <span class="item-icon">🔄</span>
                Reset Data
              </button>
            </div>
          </div>

          <!-- Home Button (when not on home) -->
          <button class="home-button" *ngIf="activeTab() !== 'home'" (click)="setActiveTab('home')">
            <span class="home-icon">🏠</span>
            Home
          </button>
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="main-content">
        <!-- Home Component -->
        <app-home *ngIf="activeTab() === 'home'" (tabChange)="setActiveTab($event)"> </app-home>

        <!-- Players Component -->
        <app-players *ngIf="activeTab() === 'players'"></app-players>

        <!-- Scoreboard Component -->
        <app-scoreboard *ngIf="activeTab() === 'scoreboard'"></app-scoreboard>

        <!-- Games Component -->
        <app-games *ngIf="activeTab() === 'games'"></app-games>
      </main>
    </div>
  `,
  styleUrl: './app-shell.component.css',
})
export class AppShellComponent {
  activeTab = signal<TabType>('home');

  setActiveTab(tab: TabType) {
    this.activeTab.set(tab);
    this.saveTabState(tab);
  }

  // Badge methods for tab indicators
  playerCount = signal(0);
  activeGames = signal(0);
  newScores = signal(false);

  // Scroll detection for header hiding
  headerHidden = signal(false);
  lastScrollY = 0;

  // Utility menu
  utilityMenuOpen = signal(false);

  hasNewScores() {
    return this.newScores();
  }

  isHeaderHidden() {
    return this.headerHidden();
  }

  private platformId = inject(PLATFORM_ID);

  // Mock data - in a real app, these would be connected to services
  constructor() {
    // Simulate some initial data
    this.playerCount.set(12);
    this.activeGames.set(3);
    this.newScores.set(true);

    // Browser-only functionality
    if (isPlatformBrowser(this.platformId)) {
      // Load saved tab state
      this.loadTabState();
      // Add keyboard navigation
      this.setupKeyboardNavigation();
      // Add click-outside handler for utility menu
      this.setupClickOutsideHandler();
      // Setup scroll detection for header hiding
      this.setupScrollDetection();
    }
  }

  private setupKeyboardNavigation() {
    if (typeof document === 'undefined') return;

    document.addEventListener('keydown', (event) => {
      // Only handle keyboard shortcuts when Ctrl is pressed
      if (event.ctrlKey && !event.shiftKey && !event.altKey) {
        switch (event.key) {
          case '1':
            event.preventDefault();
            this.setActiveTab('home');
            break;
          case '2':
            event.preventDefault();
            this.setActiveTab('players');
            break;
          case '3':
            event.preventDefault();
            this.setActiveTab('scoreboard');
            break;
          case '4':
            event.preventDefault();
            this.setActiveTab('games');
            break;
        }
      }
    });
  }

  private setupClickOutsideHandler() {
    if (typeof document === 'undefined') return;

    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const utilityMenu = target.closest('.utility-menu');

      if (!utilityMenu && this.utilityMenuOpen()) {
        this.utilityMenuOpen.set(false);
      }
    });
  }

  private setupScrollDetection() {
    if (typeof window === 'undefined') return;

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;

      // Show header when at top or scrolling up
      if (currentScrollY === 0 || currentScrollY < this.lastScrollY) {
        this.headerHidden.set(false);
      }
      // Hide header when scrolling down and past 100px
      else if (currentScrollY > 100 && currentScrollY > this.lastScrollY) {
        this.headerHidden.set(true);
      }

      this.lastScrollY = currentScrollY;
    });
  }

  // Utility Menu Methods
  showUtilityMenu() {
    return this.utilityMenuOpen();
  }

  toggleUtilityMenu() {
    this.utilityMenuOpen.set(!this.utilityMenuOpen());
  }

  exportData() {
    try {
      const data = {
        timestamp: new Date().toISOString(),
        activeTab: this.activeTab(),
        notifications: {
          playerCount: this.playerCount(),
          activeGames: this.activeGames(),
          newScores: this.newScores(),
        },
        // In a real app, this would include actual data from services
        version: '1.0.0',
      };

      const dataStr = JSON.stringify(data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `wh40k-club-data-${new Date().toISOString().split('T')[0]}.json`;
      link.click();

      URL.revokeObjectURL(url);
      this.utilityMenuOpen.set(false);

      alert('Data exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  }

  importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          try {
            const data = JSON.parse(e.target.result);

            // Validate and import data
            if (data.activeTab) {
              this.setActiveTab(data.activeTab);
            }
            if (data.notifications) {
              this.playerCount.set(data.notifications.playerCount || 0);
              this.activeGames.set(data.notifications.activeGames || 0);
              this.newScores.set(data.notifications.newScores || false);
            }

            this.utilityMenuOpen.set(false);
            alert('Data imported successfully!');
          } catch (error) {
            console.error('Import failed:', error);
            alert('Import failed. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };

    input.click();
  }

  resetData() {
    const confirmed = confirm('Are you sure you want to reset all data? This cannot be undone.');
    if (confirmed) {
      // Reset to defaults
      this.activeTab.set('home');
      this.playerCount.set(0);
      this.activeGames.set(0);
      this.newScores.set(false);
      this.headerHidden.set(false);

      // Clear localStorage
      if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem('wh40k-club-active-tab');
        localStorage.removeItem('wh40k-club-notifications');
      }

      this.utilityMenuOpen.set(false);
      alert('All data has been reset to defaults.');
    }
  }

  showContextMenu(event: MouseEvent, tab: string) {
    event.preventDefault();

    // Simple context menu for demonstration
    if (tab === 'scoreboard' && this.hasNewScores()) {
      const confirmed = confirm('Mark scoreboard notifications as read?');
      if (confirmed) {
        this.newScores.set(false);
        this.saveNotificationState();
      }
    }
  }

  // Tab State Persistence Methods
  private loadTabState() {
    try {
      const savedTab = localStorage.getItem('wh40k-club-active-tab') as TabType;
      if (savedTab && ['home', 'players', 'scoreboard', 'games'].includes(savedTab)) {
        this.activeTab.set(savedTab);
      }

      // Load notification states
      const savedNotifications = localStorage.getItem('wh40k-club-notifications');
      if (savedNotifications) {
        const notifications = JSON.parse(savedNotifications);
        this.newScores.set(notifications.newScores || false);
        this.playerCount.set(notifications.playerCount || 0);
        this.activeGames.set(notifications.activeGames || 0);
      }
    } catch (error) {
      console.warn('Failed to load saved tab state:', error);
    }
  }

  private saveTabState(tab: TabType) {
    try {
      localStorage.setItem('wh40k-club-active-tab', tab);
    } catch (error) {
      console.warn('Failed to save tab state:', error);
    }
  }

  private saveNotificationState() {
    try {
      const notifications = {
        newScores: this.newScores(),
        playerCount: this.playerCount(),
        activeGames: this.activeGames(),
      };
      localStorage.setItem('wh40k-club-notifications', JSON.stringify(notifications));
    } catch (error) {
      console.warn('Failed to save notification state:', error);
    }
  }
}
