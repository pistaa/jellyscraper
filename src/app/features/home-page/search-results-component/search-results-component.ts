import { Component, computed, inject, input, model, signal } from '@angular/core';
import { MultiSearchResult, Search } from 'tmdb-ts';
import { MediaCardComponent } from './media-card-component/media-card-component';
import { TmdbService } from '../service/tmdb-service';

@Component({
  selector: 'app-search-results-component',
  imports: [MediaCardComponent],
  templateUrl: './search-results-component.html',
  styleUrl: './search-results-component.scss',
})
export class SearchResultsComponent {
  private readonly _tmdbService = inject(TmdbService);

  public results = model<Search<MultiSearchResult>>();
  public criteria = input('');
  public loading = model(false);
  protected items = computed<MultiSearchResult[]>(() => {
    return this.results()?.results ?? [];
  });
  protected page = computed(() => {
    return this.results()?.page ?? 0;
  });
  protected hasNextPage = computed(() => {
    const currentPage = this.results()?.page;
    const totalPages = this.results()?.total_pages;
    if (currentPage == undefined || totalPages == undefined) {
      return false;
    }
    return currentPage < totalPages;
  })

  protected async loadNextPage() {
    if (!this.hasNextPage()) {
      return;
    }
    this.loading.set(true);
    try {
      const response = await this._tmdbService.search(this.criteria(), this.page() + 1);
      if (!response.results.length) {
        return;
      }
      this.results.set({...response, results: [...this.items(), ...response.results]});
    } finally {
      this.loading.set(false);
    }
  }
}
