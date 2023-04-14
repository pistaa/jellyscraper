import { SearchRequest } from 'moviedb-promise';

export interface SearchParam extends SearchRequest {
  media_type: 'all' | 'movie' | 'tv' | 'person';
}
