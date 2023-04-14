export interface SearchSetting {
  id: 'all' | 'movie' | 'tv' | 'person';
  label: string;
}

export const SearchSettings: SearchSetting[] = [
  { id: 'all', label: 'All' },
  { id: 'movie', label: 'Movies' },
  { id: 'tv', label: 'Tv series' },
  { id: 'person', label: 'Persons' },
];
