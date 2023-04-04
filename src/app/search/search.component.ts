import { Component } from '@angular/core';
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
  ];

  get currentSetting(): SearchSetting | undefined {
    return this.settings.find((item) => item.checked);
  }

  set currentSetting(value: SearchSetting | undefined) {
    this.settings.every((item) => (item.checked = item.id == value?.id));
  }

  search() {
    alert('search pressed');
  }
}
