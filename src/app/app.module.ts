import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MediaCardListComponent } from './components/media-card-list/media-card-list.component';
import { MediaCardComponent } from './components/media-card/media-card.component';
import { SearchComponent } from './components/search/search.component';
import { SuggestionListComponent } from './components/suggestion-list/suggestion-list.component';
import { MediaTitlePipe } from './pipes/media-title.pipe';
import { MediaYearPipe } from './pipes/media-year.pipe';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

const appRoutes: Routes = [
  { path: '', component: SearchComponent },
  { path: ':type', component: SearchComponent },
  { path: ':type/:criteria', component: SearchComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    SearchComponent,
    MediaCardComponent,
    MediaCardListComponent,
    SuggestionListComponent,
    MediaTitlePipe,
    MediaYearPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    MatIconModule,
    MatRadioModule,
    MatRippleModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    NgxSkeletonLoaderModule.forRoot({
      animation: 'pulse',
      loadingText: 'Loading...',
      theme: { background: '#e8e3e3', height: '16px' },
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    RouterModule.forRoot(appRoutes),
  ],
  providers: [MediaTitlePipe, MediaYearPipe],
  bootstrap: [AppComponent],
})
export class AppModule {}
