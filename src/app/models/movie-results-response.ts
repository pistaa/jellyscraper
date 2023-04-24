import { MovieResult } from './movie-result';
import { PaginatedResponse } from './paginated-response';

export interface MovieResultsResponse extends PaginatedResponse {
  results?: Array<MovieResult>;
}
