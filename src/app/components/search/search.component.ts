import {
  Component,
  HostListener,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { interval, take } from 'rxjs';
import {
  MovieResultsResponse,
  SearchMultiResponse,
  SearchPersonResponse,
  TvResultsResponse,
} from 'src/app/models';
import { MediaTitlePipe } from 'src/app/pipes/media-title.pipe';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import {
  SearchData,
  SearchParam,
  SearchSetting,
  SearchSettings,
} from '../../interfaces';
import { MovieDbService } from '../../services';
import { SearchResults } from '../../types';
import { SuggestionListComponent } from '../suggestion-list/suggestion-list.component';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private movieDb = inject(MovieDbService);
  private translate = inject(TranslateService);
  private localStorage = inject(LocalStorageService);
  private mediaTitle = inject(MediaTitlePipe);
  @ViewChild('suggestionList') suggestionList?: SuggestionListComponent;

  searchCriteria = '';
  settings = SearchSettings;
  searchResults: SearchResults = [];
  suggestionsHidden = true;
  currentSetting: SearchSetting = this.settings[0];
  searchData: SearchData = {};
  searchInProgress = false;
  topBarShadow = false;

  ngOnInit(): void {
    this.activatedRoute.params.subscribe({
      next: (params: Params) => {
        const settingId = params['type'];
        const criteria = params['criteria'];
        if (settingId) {
          this.currentSetting =
            this.settings.find((item) => item.id === settingId) ??
            this.currentSetting;
        }
        this.searchCriteria = criteria ?? this.searchCriteria;
        if (this.searchCriteria) {
          this.search();
        }
      },
    });
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
    this.suggestionsHidden = true;
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
    if (this.suggestionList?.focusedSuggestion) {
      this.searchCriteria =
        this.mediaTitle.transform(this.suggestionList.focusedSuggestion) ??
        this.searchCriteria;
    }
    this.router.navigate(['/' + this.currentSetting.id, this.searchCriteria]);
  }

  private processSearchResults(
    response:
      | SearchMultiResponse
      | MovieResultsResponse
      | TvResultsResponse
      | SearchPersonResponse
  ) {
    this.searchData.totalPages = response.total_pages;
    if (!response.results) {
      return;
    }
    if (this.searchResults) {
      this.searchResults = this.searchResults.concat(response.results ?? []);
    } else {
      this.searchResults = response.results;
    }
  }

  suggestionsDelayedHide() {
    interval(100)
      .pipe(take(1))
      .subscribe(() => (this.suggestionsHidden = true));
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

  changeLanguage() {
    const language = this.translate.currentLang === 'hu-HU' ? 'en-US' : 'hu-HU';
    this.translate.use(language);
    this.localStorage.lastUsedLanguage = language;
  }

  suggestionCriteria(value: string) {
    if (this.suggestionList) {
      this.suggestionList.criteria = value;
      this.suggestionsHidden = false;
    }
  }
}
