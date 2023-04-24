import { PaginatedResponse } from './paginated-response';
import { PersonResult } from './person-result';

export interface SearchPersonResponse extends PaginatedResponse {
  results?: Array<PersonResult>;
}
