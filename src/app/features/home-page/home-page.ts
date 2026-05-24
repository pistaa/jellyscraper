import {
  AfterViewInit,
  Component,
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
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home-page',
  imports: [SearchResultsComponent],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage implements AfterViewInit {
  private readonly _tmdbService = inject(TmdbService);
  private readonly _location = inject(Location);
  private readonly _activatedRoute = inject(ActivatedRoute);
  protected searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  protected searchQuery = signal('');
  protected searchResults = signal<Search<MultiSearchResult> | undefined>(undefined);
  protected loading = signal(false);
  private readonly _searchQueryChanged = toObservable(this.searchQuery);

  constructor() {
    this._searchQueryChanged
      .pipe(takeUntilDestroyed(), debounceTime(300))
      .subscribe((queryCriteria) => {
        this.window()?.scrollTo?.({ top: 0 });
        if (!queryCriteria) {
          this.searchResults.set(undefined);
          return;
        }
        this.loading.set(true);
        this._tmdbService
          .search(queryCriteria)
          .then((resposne) => {
            this.searchResults.set(resposne);
            this._location.replaceState(`/?search=${encodeURIComponent(queryCriteria)}`);
          })
          .catch((err) => {
            console.error(err);
          })
          .finally(() => {
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
    const searchQuery = this._activatedRoute.snapshot.queryParams['search'];
    const searchInput = this.searchInput();
    if (searchQuery && searchInput) {
      searchInput.nativeElement.value = searchQuery;
      searchInput.nativeElement.selectionStart = searchQuery.length;
      searchInput.nativeElement.selectionEnd = searchQuery.length;
      this.onSearchInput().finally();
    }
  }

  protected async onSearchInput() {
    this.searchQuery.set(this.searchInput()?.nativeElement.value ?? '');
  }

  private window() {
    return typeof window !== 'undefined' ? window : undefined;
  }
}
