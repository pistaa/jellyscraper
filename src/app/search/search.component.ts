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
import { MovieDbService } from '../service/moviedb.service';
import { SearchResults } from './search-result';
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
    switch (this.searchData.setting.id) {
      case 'all':
        this.movieDb
          .searchMulti(<SearchMultiRequest>{
            query: this.searchData.criteria,
            language: 'hu-HU',
            page: page,
          })
          .then((value) => this.processSearchResults(value))
          .finally(() => (this.searchInProgress = false));
        break;
      case 'movie':
        this.movieDb
          .searchMovie(<SearchMovieRequest>{
            query: this.searchData.criteria,
            language: 'hu-HU',
            page: page,
          })
          .then((value) => this.processSearchResults(value, 'movie'))
          .finally(() => (this.searchInProgress = false));
        break;
      case 'tv':
        this.movieDb
          .searchTv(<SearchTvRequest>{
            query: this.searchData.criteria,
            language: 'hu-HU',
            page: page,
          })
          .then((value) => this.processSearchResults(value, 'tv'))
          .finally(() => (this.searchInProgress = false));
        break;
      case 'person':
        this.movieDb
          .searchPerson(<SearchMultiRequest>{
            query: this.searchData.criteria,
            language: 'hu-HU',
            page: page,
          })
          .then((value) => this.processSearchResults(value, 'person'))
          .finally(() => (this.searchInProgress = false));
        break;
      default:
        break;
    }
  }

  private searchNextPage() {
    if (this.searchData.currentPage) {
      this.search(this.searchData.currentPage + 1);
    }
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
      resultArr = resultArr
        ? resultArr.map((item) => {
            item.media_type = mediaType;
            return item;
          })
        : [];
    }
    if (this.searchResults) {
      this.searchResults = this.searchResults.concat(resultArr);
    } else {
      this.searchResults = resultArr;
    }
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
}
