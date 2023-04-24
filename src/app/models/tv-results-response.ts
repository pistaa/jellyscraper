import { PaginatedResponse } from './paginated-response';
import { TvResult } from './tv-result';

export interface TvResultsResponse extends PaginatedResponse {
  results?: Array<TvResult>;
}
