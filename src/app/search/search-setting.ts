export class SearchSetting {
  constructor(
    public id: 'all' | 'movie' | 'tv' | 'person',
    public label: string
  ) {}
}
