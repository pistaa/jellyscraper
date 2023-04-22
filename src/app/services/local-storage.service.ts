import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private readonly keyLanguage = 'language';
  private readonly fallbackLanguage = environment.defaultLanguage;

  get lastUsedLanguage(): string {
    return localStorage.getItem(this.keyLanguage) ?? this.fallbackLanguage;
  }

  set lastUsedLanguage(value: string) {
    localStorage.setItem(this.keyLanguage, value);
  }
}
