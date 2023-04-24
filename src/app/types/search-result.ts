import { MovieResult, PersonResult, TvResult } from '../models';

export type SearchResult = MovieResult | TvResult | PersonResult;
export type SearchResults = SearchResult[] | undefined;
export type MediaTypes = 'multi' | 'movie' | 'tv' | 'person';
