import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { TmdbService } from './service/tmdb-service';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';
import { SearchResultsComponent } from './search-results-component/search-results-component';
import { MultiSearchResult, Search } from 'tmdb-ts';

@Component({
  selector: 'app-home-page',
  imports: [SearchResultsComponent],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage implements AfterViewInit {
  private readonly _tmdbService = inject(TmdbService);
  protected searchInput = viewChild<ElementRef>('searchInput');
  protected searchQuery = signal('');
  protected searchResults = signal<Search<MultiSearchResult> | undefined>(undefined);
  protected loading = signal(false);
  private readonly _searchQueryChanged = toObservable(this.searchQuery);

  constructor() {
    this._searchQueryChanged
      .pipe(takeUntilDestroyed(), debounceTime(400))
      .subscribe((queryCriteria) => {
        window.scrollTo({ top: 0 });
        if (!queryCriteria) {
          this.searchResults.set(undefined);
          return;
        }
        this.loading.set(true);
        this._tmdbService
          .search(queryCriteria)
          .then((resposne) => {
            this.searchResults.set(resposne);
            this.loading.set(false);
          })
          .catch((err) => {
            console.error(err);
            this.loading.set(false);
          });
      });
    effect(() => {
      if (this.searchQuery() && !this.searchResults()) {
        setTimeout(() => {
          if (this.searchQuery() && !this.searchResults()) {
            this.loading.set(true);
          }
        }, 1000);
      }
    });
  }

  ngAfterViewInit() {
    this.searchInput()?.nativeElement.focus();
  }

  protected async onSearchInput() {
    this.searchQuery.set(this.searchInput()?.nativeElement.value ?? '');
  }
}
