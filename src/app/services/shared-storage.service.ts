import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
  lastUpdated?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SharedStorageService {
  private platformId = inject(PLATFORM_ID);
  private readonly API_BASE = '/api';

  constructor(private http: HttpClient) {}

  // Load all shared data from the server
  loadSharedData(): Observable<any> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(null);
    }

    return this.http.get<ApiResponse>(`${this.API_BASE}/data`).pipe(
      map(response => response.success ? response.data : null),
      catchError((error) => {
        console.error('Failed to load shared data:', error);
        return of(null);
      })
    );
  }

  // Save specific data type to the server
  saveSharedData(type: 'players' | 'games' | 'seasons' | 'full', data: any): Observable<boolean> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(false);
    }

    return this.http.post<ApiResponse>(`${this.API_BASE}/data`, { type, data }).pipe(
      map(response => response.success),
      catchError((error) => {
        console.error('Failed to save shared data:', error);
        return of(false);
      })
    );
  }

  // Save all data at once
  saveAllData(allData: any): Observable<boolean> {
    return this.saveSharedData('full', allData);
  }

  // Check if server is available
  checkServerStatus(): Observable<boolean> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(false);
    }

    return this.http.get<ApiResponse>(`${this.API_BASE}/data`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
}