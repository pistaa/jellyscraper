export interface SearchParam {
  media_type: 'multi' | 'movie' | 'tv' | 'person';
  query: string;
  page?: number;
  id?: string | number;
}
