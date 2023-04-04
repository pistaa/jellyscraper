import { MovieResult, PersonResult, TvResult } from 'moviedb-promise';

export type SearchResult = MovieResult | TvResult | PersonResult;
export type SearchResults = SearchResult[] | undefined;
