import { Component, signal, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HomeComponent } from '../pages/home/home.component';
import { PlayersComponent } from '../pages/players/players.component';
import { RankingScoreboardComponent } from '../pages/ranking/ranking-scoreboard.component';
import { GamesComponent } from '../pages/games/games.component';
import { StorageToggleComponent } from '../shared/storage-toggle.component';

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
    StorageToggleComponent,
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
              (click)="setActiveTab('players')"
            >
              <span class="tab-icon">👥</span>
              Players
            </button>
            <button
              class="tab-button"
              [class.active]="activeTab() === 'scoreboard'"
              (click)="setActiveTab('scoreboard')"
              (contextmenu)="showContextMenu($event, 'scoreboard')"
            >
              <span class="tab-icon">🏆</span>
              Scoreboard
            </button>
            <button
              class="tab-button"
              [class.active]="activeTab() === 'games'"
              (click)="setActiveTab('games')"
            >
              <span class="tab-icon">⚔️</span>
              Games
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

          <!-- Storage Toggle -->
          <app-storage-toggle></app-storage-toggle>

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
        <app-ranking-scoreboard *ngIf="activeTab() === 'scoreboard'"></app-ranking-scoreboard>

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

  // Scroll detection for header hiding
  headerHidden = signal(false);
  lastScrollY = 0;

  // Utility menu
  utilityMenuOpen = signal(false);

  isHeaderHidden() {
    return this.headerHidden();
  }

  private platformId = inject(PLATFORM_ID);

  constructor() {
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
            // Imported data loaded successfully

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
    // Context menu functionality can be implemented here if needed
  }

  // Tab State Persistence Methods
  private loadTabState() {
    try {
      const savedTab = localStorage.getItem('wh40k-club-active-tab') as TabType;
      if (savedTab && ['home', 'players', 'scoreboard', 'games'].includes(savedTab)) {
        this.activeTab.set(savedTab);
      }

      // Tab state loaded successfully
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
}
