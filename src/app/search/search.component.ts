import { Component, HostListener } from '@angular/core';
import {
  MovieResultsResponse,
  SearchMovieRequest,
  SearchMultiRequest,
  SearchMultiResponse,
  SearchPersonResponse,
  SearchTvRequest,
  TvResultsResponse,
} from 'moviedb-promise';
import { interval, take } from 'rxjs';
import { MovieDbService } from '../service/moviedb.service';
import { SearchResult, SearchResults } from './search-result';
import { SearchSetting } from './search-setting';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent {
  searchCriteria = '';
  settingsVisible = false;

  settings: SearchSetting[] = [
    new SearchSetting('all', 'All'),
    new SearchSetting('movie', 'Movies'),
    new SearchSetting('tv', 'Tv series'),
    new SearchSetting('person', 'Persons'),
  ];

  searchResults: SearchResults = [];
  trendingResults: SearchResults = [];
  focusedTrendingItem?: SearchResult;
  lastTrendingCriteria = '';
  trendingVisible = false;
  currentSetting: SearchSetting = this.settings[0];
  searchData: {
    criteria?: string;
    setting?: SearchSetting;
    currentPage?: number;
    totalPages?: number;
  } = {};
  searchInProgress = false;
  topBarShadow = false;

  constructor(private movieDb: MovieDbService) {}

  private createSearchPromise(
    type: 'all' | 'movie' | 'tv' | 'person',
    criteria: string,
    language: string,
    page?: number
  ): Promise<
    | SearchMultiResponse
    | MovieResultsResponse
    | TvResultsResponse
    | SearchPersonResponse
  > {
    switch (type) {
      case 'all':
        return this.movieDb.searchMulti(<SearchMultiRequest>{
          query: criteria,
          language: language,
          page: page,
        });
      case 'movie':
        return this.movieDb.searchMovie(<SearchMovieRequest>{
          query: criteria,
          language: language,
          page: page,
        });
      case 'tv':
        return this.movieDb.searchTv(<SearchTvRequest>{
          query: criteria,
          language: language,
          page: page,
        });
      case 'person':
        return this.movieDb.searchPerson(<SearchMultiRequest>{
          query: criteria,
          language: 'hu-HU',
          page: page,
        });
    }
  }

  search(page?: number) {
    if (!page) {
      if (!this.currentSetting || !this.searchCriteria) {
        return;
      }
      this.searchData.criteria = this.searchCriteria;
      this.searchData.setting = this.currentSetting;
      this.searchData.currentPage = 1;
      this.searchResults = [];
    } else {
      if (
        !this.searchData.criteria ||
        !this.searchData.setting ||
        !this.searchData.totalPages ||
        page > this.searchData.totalPages
      ) {
        return;
      }
    }
    this.searchData.currentPage = (this.searchData.currentPage ?? 0) + 1;
    this.searchInProgress = true;
    this.trendingResults = [];
    this.createSearchPromise(
      this.searchData.setting.id,
      this.searchData.criteria,
      'hu-HU',
      page
    )
      .then((value) =>
        this.processSearchResults(
          value,
          this.searchData.setting?.id != 'all'
            ? this.searchData.setting?.id
            : undefined
        )
      )
      .finally(() => (this.searchInProgress = false));
  }

  private searchNextPage() {
    if (this.searchData.currentPage) {
      this.search(this.searchData.currentPage + 1);
    }
  }

  onSearch() {
    if (this.focusedTrendingItem) {
      this.searchCriteria =
        this.getTitle(this.focusedTrendingItem) ?? this.searchCriteria;
    }
    this.search();
  }

  private fixMediaType(
    arr: SearchResults,
    mediaType: 'movie' | 'tv' | 'person'
  ): SearchResults {
    return arr
      ? arr.map((item) => {
          item.media_type = mediaType;
          return item;
        })
      : [];
  }

  private processSearchResults(
    results:
      | SearchMultiResponse
      | MovieResultsResponse
      | TvResultsResponse
      | SearchPersonResponse,
    mediaType?: 'movie' | 'tv' | 'person'
  ) {
    let resultArr: SearchResults = results.results;
    this.searchData.totalPages = results.total_pages;
    if (!resultArr) {
      return;
    }
    if (mediaType) {
      resultArr = this.fixMediaType(resultArr, mediaType);
    }
    if (this.searchResults) {
      this.searchResults = this.searchResults.concat(resultArr ?? []);
    } else {
      this.searchResults = resultArr;
    }
  }

  trending() {
    if (!this.searchCriteria) {
      this.trendingResults = [];
      return;
    }
    if (this.lastTrendingCriteria == this.searchCriteria) {
      return;
    }
    this.lastTrendingCriteria = this.searchCriteria;
    this.createSearchPromise(
      this.currentSetting.id,
      this.searchCriteria,
      'hu-HU'
    )
      .then((value) => {
        if (this.currentSetting.id != 'all') {
          value.results = this.fixMediaType(
            value.results,
            this.currentSetting.id
          );
        }
        this.trendingResults = value.results?.slice(0, 10);
        this.trendingVisible = true;
      })
      .finally(() => (this.focusedTrendingItem = undefined));
  }

  trendingResultsDelayedHide() {
    interval(100)
      .pipe(take(1))
      .subscribe(() => (this.trendingVisible = false));
  }

  prevTrending() {
    if (!this.trendingResults || this.trendingResults.length == 0) {
      return;
    }
    if (!this.focusedTrendingItem) {
      this.focusedTrendingItem =
        this.trendingResults[this.trendingResults.length - 1];
    } else {
      let index = this.trendingResults.indexOf(this.focusedTrendingItem) - 1;
      if (index < 0) {
        this.focusedTrendingItem = undefined;
      } else {
        this.focusedTrendingItem = this.trendingResults[index];
      }
    }
  }

  nextTrending() {
    if (!this.trendingResults || this.trendingResults.length == 0) {
      return;
    }
    if (!this.focusedTrendingItem) {
      this.focusedTrendingItem = this.trendingResults[0];
    } else {
      let index = this.trendingResults.indexOf(this.focusedTrendingItem) + 1;
      if (index >= this.trendingResults.length) {
        this.focusedTrendingItem = undefined;
      } else {
        this.focusedTrendingItem = this.trendingResults[index];
      }
    }
  }

  getTitle(searchResult: SearchResult): string | undefined {
    switch (searchResult.media_type) {
      case 'movie':
        return searchResult.title;
      case 'tv':
        return searchResult.name;
      case 'person':
        return searchResult.name;
    }
  }

  getYear(searchResult: SearchResult): string | undefined {
    switch (searchResult.media_type) {
      case 'movie':
        return searchResult.release_date?.substring(0, 4);
      case 'tv':
        return searchResult.first_air_date?.substring(0, 4);
      case 'person':
        return undefined;
    }
  }

  searchByTrendingResult(item: SearchResult) {
    let title = this.getTitle(item);
    if (!title) {
      return;
    }
    this.searchCriteria = title;
    this.search();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    const pageHeight = Math.max(
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.offsetHeight
    );
    const limit =
      Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      ) - pageHeight;
    if (!this.searchInProgress && window.scrollY >= limit - pageHeight / 2) {
      this.searchNextPage();
    }
    this.topBarShadow = window.scrollY > 20;
  }

  isFocused(a: any) {
    return a == document.activeElement;
  }
}
