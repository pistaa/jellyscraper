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

  settingAll = new SearchSetting('all', 'All', true);
  settingMovies = new SearchSetting('movie', 'Movies', false);
  settingTv = new SearchSetting('tv', 'Tv series', false);
  setting?: SearchSetting;
  settings: SearchSetting[] = [
    this.settingAll,
    this.settingMovies,
    this.settingTv,
  ];

  search() {
    alert('search pressed');
  }
}
