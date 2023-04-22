import { Component, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from './services/local-storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  private localStorage = inject(LocalStorageService);
  private translate = inject(TranslateService);

  constructor() {
    this.translate.setDefaultLang(this.localStorage.lastUsedLanguage);
    this.translate.use(this.translate.getDefaultLang());
  }
}
