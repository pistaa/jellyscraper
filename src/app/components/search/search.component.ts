import { Component, HostListener, inject } from '@angular/core';
import {
  MovieResultsResponse,
  SearchMultiResponse,
  SearchPersonResponse,
  TvResultsResponse,
} from 'moviedb-promise';
import { interval, take } from 'rxjs';
import {
  SearchData,
  SearchParam,
  SearchSetting,
  SearchSettings,
} from '../../interfaces';
import { MovieDbService } from '../../services';
import { SearchResult, SearchResults } from '../../types';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent {
  searchCriteria = '';
  settingsVisible = false;

  settings = SearchSettings;
  searchResults: SearchResults = [];
  suggestions: SearchResults = [];
  focusedSuggestion?: SearchResult;
  lastSuggestionCriteria = '';
  suggestionsVisible = false;
  currentSetting: SearchSetting = this.settings[0];
  searchData: SearchData = {};
  searchInProgress = false;
  topBarShadow = false;

  private movieDb = inject(MovieDbService);

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
    this.suggestions = [];
    this.movieDb
      .search(<SearchParam>{
        media_type: this.searchData.setting.id,
        query: this.searchData.criteria,
        page: page,
      })
      .then((value) => this.processSearchResults(value))
      .finally(() => (this.searchInProgress = false));
  }

  private searchNextPage() {
    if (this.searchData.currentPage) {
      this.search(this.searchData.currentPage + 1);
    }
  }

  onSearch() {
    if (this.focusedSuggestion) {
      this.searchCriteria =
        this.getTitle(this.focusedSuggestion) ?? this.searchCriteria;
    }
    this.search();
  }

  private processSearchResults(
    response:
      | SearchMultiResponse
      | MovieResultsResponse
      | TvResultsResponse
      | SearchPersonResponse
  ) {
    this.searchData.totalPages = response.total_pages;
    const resultArr: SearchResults =
      this.movieDb.fillMissingMediaTypes(response).results;
    if (!resultArr) {
      return;
    }
    if (this.searchResults) {
      this.searchResults = this.searchResults.concat(resultArr ?? []);
    } else {
      this.searchResults = resultArr;
    }
  }

  trending() {
    if (!this.searchCriteria) {
      this.suggestions = [];
      return;
    }
    if (this.lastSuggestionCriteria == this.searchCriteria) {
      return;
    }
    this.lastSuggestionCriteria = this.searchCriteria;
    this.movieDb
      .search(<SearchParam>{
        media_type: this.currentSetting.id,
        query: this.searchCriteria,
      })
      .then((value) => {
        value = this.movieDb.fillMissingMediaTypes(value);
        this.suggestions = value.results?.slice(0, 10);
        this.suggestionsVisible = true;
      })
      .finally(() => (this.focusedSuggestion = undefined));
  }

  suggestionsDelayedHide() {
    interval(100)
      .pipe(take(1))
      .subscribe(() => (this.suggestionsVisible = false));
  }

  prevSuggestion() {
    if (!this.suggestions || this.suggestions.length == 0) {
      return;
    }
    if (!this.focusedSuggestion) {
      this.focusedSuggestion = this.suggestions[this.suggestions.length - 1];
    } else {
      const index = this.suggestions.indexOf(this.focusedSuggestion) - 1;
      if (index < 0) {
        this.focusedSuggestion = undefined;
      } else {
        this.focusedSuggestion = this.suggestions[index];
      }
    }
  }

  nextSuggestion() {
    if (!this.suggestions || this.suggestions.length == 0) {
      return;
    }
    if (!this.focusedSuggestion) {
      this.focusedSuggestion = this.suggestions[0];
    } else {
      const index = this.suggestions.indexOf(this.focusedSuggestion) + 1;
      if (index >= this.suggestions.length) {
        this.focusedSuggestion = undefined;
      } else {
        this.focusedSuggestion = this.suggestions[index];
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

  searchBySuggestion(item: SearchResult) {
    const title = this.getTitle(item);
    if (!title) {
      return;
    }
    this.searchCriteria = title;
    this.search();
  }

  @HostListener('window:scroll')
  onScroll() {
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

  isFocused(a: Element) {
    return a == document.activeElement;
  }
}
