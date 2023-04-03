export class SearchSetting {
  constructor(
    public id: 'all' | 'movie' | 'tv',
    public label: string,
    public checked: boolean
  ) {}
}
