import { MovieResult } from './movie-result';
import { TvResult } from './tv-result';

export interface PersonResult {
  profile_path?: string;
  adult?: boolean;
  id?: number;
  name?: string;
  media_type: 'person';
  popularity?: number;
  known_for?: Array<MovieResult | TvResult>;
}
