import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { SearchParam } from 'src/app/interfaces';
import { MediaTitlePipe } from 'src/app/pipes/media-title.pipe';
import { MovieDbService } from 'src/app/services';
import { SearchResult, SearchResults } from 'src/app/types';

@Component({
  selector: 'app-suggestion-list',
  templateUrl: './suggestion-list.component.html',
  styleUrls: ['./suggestion-list.component.scss'],
})
export class SuggestionListComponent {
  private movieDb = inject(MovieDbService);
  private lastUsedCriteria?: string;
  mediaTitle = inject(MediaTitlePipe);
  suggestions: SearchResults;
  focusedSuggestion?: SearchResult;

  @Output() selectSuggestion = new EventEmitter<string>();

  @Input() mediaTypeId: 'all' | 'movie' | 'tv' | 'person' = 'all';

  @Input() set criteria(value: string | undefined) {
    console.log(value);
    if (!value) {
      this.suggestions = [];
      return;
    }
    if (value === this.lastUsedCriteria) {
      return;
    }
    this.lastUsedCriteria = value;
    this.movieDb
      .search(<SearchParam>{
        media_type: this.mediaTypeId,
        query: value,
      })
      .then(
        (response) =>
          (this.suggestions =
            this.movieDb
              .fillMissingMediaTypes(response)
              .results?.splice(0, 10) ?? [])
      )
      .finally(() => (this.focusedSuggestion = undefined));
  }

  next() {
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

  prev() {
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
}
