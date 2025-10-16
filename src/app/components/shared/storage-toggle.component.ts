import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedStorageService } from '../../services/shared-storage.service';

@Component({
  selector: 'app-storage-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="storage-toggle">
      <div class="storage-status">
        <span class="status-icon" [class.connected]="isCloudConnected()">
          {{ isCloudConnected() ? '🌐' : '💾' }}
        </span>
        <span class="status-text">
          {{ isCloudConnected() ? 'Cloud Storage Active' : 'Local Storage Only' }}
        </span>
      </div>
      
      <button 
        class="toggle-btn"
        (click)="toggleStorageMode()"
        [disabled]="isLoading()"
        [title]="isCloudConnected() ? 'Switch to local storage' : 'Connect to cloud storage'"
      >
        {{ isLoading() ? 'Connecting...' : (isCloudConnected() ? 'Go Offline' : 'Go Online') }}
      </button>
    </div>
  `,
  styles: [`
    .storage-toggle {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.5rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .storage-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
    }

    .status-icon {
      font-size: 1.2rem;
    }

    .status-icon.connected {
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }

    .toggle-btn {
      padding: 0.25rem 0.75rem;
      background: var(--primary-color, #007bff);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.2s ease;
    }

    .toggle-btn:hover:not(:disabled) {
      background: var(--primary-color-dark, #0056b3);
      transform: translateY(-1px);
    }

    .toggle-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .status-text {
      font-weight: 500;
      color: rgba(255, 255, 255, 0.9);
    }
  `]
})
export class StorageToggleComponent {
  isCloudConnected = signal(false);
  isLoading = signal(false);

  constructor(private sharedStorage: SharedStorageService) {
    this.checkCloudConnection();
  }

  private checkCloudConnection(): void {
    this.sharedStorage.checkServerStatus().subscribe({
      next: (connected) => {
        this.isCloudConnected.set(connected);
      },
      error: () => {
        this.isCloudConnected.set(false);
      }
    });
  }

  toggleStorageMode(): void {
    this.isLoading.set(true);
    
    if (this.isCloudConnected()) {
      // Going offline - just update the status
      this.isCloudConnected.set(false);
      this.isLoading.set(false);
    } else {
      // Going online - check connection first
      this.sharedStorage.checkServerStatus().subscribe({
        next: (connected) => {
          this.isCloudConnected.set(connected);
          this.isLoading.set(false);
          
          if (connected) {
            // Optionally trigger a data sync here
            console.log('Connected to cloud storage');
          } else {
            alert('Unable to connect to cloud storage. Check your internet connection.');
          }
        },
        error: () => {
          this.isCloudConnected.set(false);
          this.isLoading.set(false);
          alert('Failed to connect to cloud storage.');
        }
      });
    }
  }
}