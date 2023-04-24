export interface MovieResult {
  poster_path?: string;
  adult?: boolean;
  overview?: string;
  release_date?: string;
  genre_ids?: Array<number>;
  id?: number;
  media_type: 'movie';
  original_title?: string;
  original_language?: string;
  title?: string;
  backdrop_path?: string;
  popularity?: number;
  vote_count?: number;
  video?: boolean;
  vote_average?: number;
}
