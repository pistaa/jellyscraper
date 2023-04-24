export interface SearchSetting {
  id: 'multi' | 'movie' | 'tv' | 'person';
  icon: string;
  label: string;
}

export const SearchSettings: SearchSetting[] = [
  { id: 'multi', icon: 'grade', label: 'All' },
  { id: 'movie', icon: 'movie', label: 'Movies' },
  { id: 'tv', icon: 'desktop_windows', label: 'Tv series' },
  { id: 'person', icon: 'person', label: 'Persons' },
];
