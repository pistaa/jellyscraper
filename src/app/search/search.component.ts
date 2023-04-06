import { Component } from '@angular/core';
import {
  SearchMovieRequest,
  SearchMultiRequest,
  SearchTvRequest,
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
    new SearchSetting('all', 'All', true),
    new SearchSetting('movie', 'Movies', false),
    new SearchSetting('tv', 'Tv series', false),
    new SearchSetting('person', 'Persons', false),
  ];

  searchResults: SearchResults = [];
  currentSetting: SearchSetting = this.settings[0];

  constructor(private movieDb: MovieDbService) {}

  search() {
    switch (this.currentSetting?.id) {
      case 'all':
        this.movieDb
          .searchMulti(<SearchMultiRequest>{
            query: this.searchCriteria,
            language: 'hu-HU',
          })
          .then((value) => this.processSearchResults(value.results));
        break;
      case 'movie':
        this.movieDb
          .searchMovie(<SearchMovieRequest>{
            query: this.searchCriteria,
            language: 'hu-HU',
          })
          .then((value) =>
            this.processSearchResults(
              value.results?.map((item) => {
                item.media_type = 'movie';
                return item;
              })
            )
          );
        break;
      case 'tv':
        this.movieDb
          .searchTv(<SearchTvRequest>{
            query: this.searchCriteria,
            language: 'hu-HU',
          })
          .then((value) =>
            this.processSearchResults(
              value.results?.map((item) => {
                item.media_type = 'tv';
                return item;
              })
            )
          );
        break;
      case 'person':
        this.movieDb
          .searchPerson(<SearchMultiRequest>{
            query: this.searchCriteria,
            language: 'hu-HU',
          })
          .then((value) =>
            this.processSearchResults(
              value.results?.map((item) => {
                item.media_type = 'person';
                return item;
              })
            )
          );
        break;
      default:
        break;
    }
  }

  private processSearchResults(results: SearchResults) {
    this.searchResults = results ?? [];
  }
}
