import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class FileDataService {
  private readonly DATA_PATH = 'data/';

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {}

  // Read JSON file
  readJsonFile<T>(filename: string): Observable<T[]> {
    if (!isPlatformBrowser(this.platformId)) {
      return of([]);
    }

    return this.http.get<T[]>(`${this.DATA_PATH}${filename}`).pipe(
      catchError((error) => {
        console.error(`Error reading ${filename}:`, error);
        return of([]);
      })
    );
  }

  // Write JSON file (this requires a backend API)
  writeJsonFile<T>(filename: string, data: T[]): Observable<boolean> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(false);
    }

    // For now, we'll use the browser's download functionality
    this.downloadJsonFile(filename, data);
    return of(true);
  }

  // Download JSON file to user's downloads folder
  private downloadJsonFile<T>(filename: string, data: T[]): void {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Load JSON file from user's file system
  loadJsonFile<T>(): Promise<T[]> {
    return new Promise((resolve, reject) => {
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
              resolve(data);
            } catch (error) {
              reject(error);
            }
          };
          reader.readAsText(file);
        } else {
          reject(new Error('No file selected'));
        }
      };

      input.click();
    });
  }
}
