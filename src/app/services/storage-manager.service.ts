import { Injectable, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

export type StorageMode = 'local' | 'cloud';

@Injectable({
  providedIn: 'root',
})
export class StorageManagerService {
  private platformId = inject(PLATFORM_ID);
  private storageMode = signal<StorageMode>('local');

  constructor() {
    this.loadStorageMode();
  }

  // Get current storage mode
  getStorageMode(): StorageMode {
    return this.storageMode();
  }

  // Set storage mode
  setStorageMode(mode: StorageMode): void {
    this.storageMode.set(mode);
    this.saveStorageMode();
  }

  // Save data based on current mode
  async saveData(key: string, data: any): Promise<boolean> {
    if (this.storageMode() === 'local') {
      return this.saveToLocalStorage(key, data);
    } else {
      return this.saveToCloud(key, data);
    }
  }

  // Load data based on current mode
  async loadData(key: string): Promise<any> {
    if (this.storageMode() === 'local') {
      return this.loadFromLocalStorage(key);
    } else {
      return this.loadFromCloud(key);
    }
  }

  // Local storage methods
  private saveToLocalStorage(key: string, data: any): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  }

  private loadFromLocalStorage(key: string): any {
    if (!isPlatformBrowser(this.platformId)) return null;
    
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return null;
    }
  }

  // Cloud storage methods (to be implemented)
  private async saveToCloud(key: string, data: any): Promise<boolean> {
    // TODO: Implement cloud storage
    console.log('Cloud storage not yet implemented');
    return false;
  }

  private async loadFromCloud(key: string): Promise<any> {
    // TODO: Implement cloud storage
    console.log('Cloud storage not yet implemented');
    return null;
  }

  // Save/load storage mode preference
  private saveStorageMode(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    try {
      localStorage.setItem('wh40k-storage-mode', this.storageMode());
    } catch (error) {
      console.error('Failed to save storage mode:', error);
    }
  }

  private loadStorageMode(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    try {
      const mode = localStorage.getItem('wh40k-storage-mode') as StorageMode;
      if (mode === 'local' || mode === 'cloud') {
        this.storageMode.set(mode);
      }
    } catch (error) {
      console.error('Failed to load storage mode:', error);
    }
  }
}