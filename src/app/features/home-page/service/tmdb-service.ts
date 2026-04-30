import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MovieDetails, MultiSearchResult, PersonDetails, Search } from 'tmdb-ts';
import { Genres } from 'tmdb-ts/dist/endpoints';
import { AvailableLanguage } from 'tmdb-ts/dist/types/options';
import { TvShowDetails } from 'tmdb-ts/dist/types';

@Injectable({
  providedIn: 'root',
})
export class TmdbService {
  private readonly _httpClient = inject(HttpClient);
  private readonly _genreIds: Map<number, string> = new Map();
  private readonly FOREIGN_CHAR_RANGES = {
    japanese: /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/,
    chinese: /[\u4E00-\u9FFF]/,
    korean: /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7AF]/,
    hindi: /[\u0900-\u097F]/,
    russian: /[\u0400-\u04FF]/,
  };

  constructor() {
    this.init();
  }

  private init() {
    this.fetchGenres().finally();
  }

  private async fetchGenres() {
    const responses = await Promise.allSettled([
      firstValueFrom(this._httpClient.get<Genres>('/api/genres/movies')),
      firstValueFrom(this._httpClient.get<Genres>('/api/genres/tvShows')),
    ]);
    for (const response of responses) {
      if (response.status !== 'fulfilled') {
        continue;
      }
      response.value.genres.forEach((item) => {
        this._genreIds.set(item.id, item.name);
      });
    }
  }

  public async search(criteria: string, page?: number) {
    const params: Record<string, string | number> = {};
    params['criteria'] = criteria;
    if (page != undefined) {
      params['page'] = page;
    }
    return await firstValueFrom(
      this._httpClient.get<Search<MultiSearchResult>>('api/search/multi', { params }),
    );
  }

  public async movie(id: number, language: AvailableLanguage = 'hu-HU') {
    const params: Record<string, string | number> = {
      id,
      language,
    };
    return await firstValueFrom(this._httpClient.get<MovieDetails>(`api/movie`, { params }));
  }

  public async tvShow(id: number, language: AvailableLanguage = 'hu-HU') {
    const params: Record<string, string | number> = {
      id,
      language,
    };
    return await firstValueFrom(this._httpClient.get<TvShowDetails>(`api/tvshow`, { params }));
  }

  public async people(id: number, language: AvailableLanguage = 'hu-HU') {
    const params: Record<string, string | number> = {
      id,
      language,
    };
    return await firstValueFrom(this._httpClient.get<PersonDetails>(`api/people`, { params }));
  }

  public getHumanReadableGenre(id: number) {
    return this._genreIds.has(id) ? this._genreIds.get(id) : undefined;
  }

  public hasForeignCharacters(s: string) {
    return Object.entries(this.FOREIGN_CHAR_RANGES).some((langRange) => {
      return langRange[1].test(s);
    });
  }

  public sanitizeFilename(input: string): string {
    return input
      .replaceAll(/[<>:"/\\|?*\u0000]/g, ' ') //NOSONAR
      .replaceAll(/\s+/g, ' ')
      .trim();
  }
}
