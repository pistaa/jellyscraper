import { MovieResult } from './movie-result';
import { PaginatedResponse } from './paginated-response';
import { PersonResult } from './person-result';
import { TvResult } from './tv-result';

export interface SearchMultiResponse extends PaginatedResponse {
  results?: Array<MovieResult | TvResult | PersonResult>;
}
