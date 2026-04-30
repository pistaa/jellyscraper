import { Component, computed, effect, inject, input, model, signal } from '@angular/core';
import { MovieDetails, MultiSearchResult } from 'tmdb-ts';
import { TmdbService } from '../../service/tmdb-service';
import { DecimalPipe } from '@angular/common';
import { TvShowDetails } from 'tmdb-ts/dist/types';

@Component({
  selector: 'app-media-card-component',
  imports: [DecimalPipe],
  templateUrl: './media-card-component.html',
  styleUrl: './media-card-component.scss',
})
export class MediaCardComponent {
  private readonly _tmdbService = inject(TmdbService);
  private readonly FALLBACK_LANGUAGE = 'en-US';
  private _rescraped = false;
  public data = model<MultiSearchResult>();
  protected copied = signal(false);
  protected title = computed(() => {
    const data = this.data();
    switch (data?.media_type) {
      case 'movie':
        return data.title;
      case 'tv':
        return data.name;
      case 'person':
        return data.name;
      default:
        return '';
    }
  });
  protected year = computed(() => {
    const data = this.data();
    switch (data?.media_type) {
      case 'movie':
        return data.release_date ? new Date(data.release_date).getFullYear() : undefined;
      case 'tv':
        return data.first_air_date ? new Date(data.first_air_date).getFullYear() : undefined;
      default:
        return undefined;
    }
  });
  protected subtitle = computed(() => {
    const data = this.data();
    switch (data?.media_type) {
      case 'movie':
      case 'tv':
        return `${this.year()} • ${data.genre_ids
          .map((item) => this._tmdbService.getHumanReadableGenre(item))
          .filter((item) => item != undefined)
          .map((item) => item?.toString())
          .join(', ')}`;
      case 'person':
        return `${data.known_for_department}`;
      default:
        return '';
    }
  });
  protected poster = computed(() => {
    const data = this.data();
    switch (data?.media_type) {
      case 'movie':
      case 'tv':
        return data.poster_path
          ? `https://image.tmdb.org/t/p/w300_and_h450_face${data.poster_path}`
          : '/img/no-image.svg';
      case 'person':
        return data.profile_path
          ? `https://image.tmdb.org/t/p/w300_and_h450_face${data.profile_path}`
          : '/img/no-image.svg';
      default:
        return '';
    }
  });
  protected rating = computed(() => {
    const data = this.data();
    switch (data?.media_type) {
      case 'movie':
      case 'tv':
        return data.vote_average;
      default:
        return '';
    }
  });
  protected overview = computed(() => {
    const data = this.data();
    switch (data?.media_type) {
      case 'movie':
      case 'tv':
        return data.overview;
      default:
        return '';
    }
  });
  protected folderName = computed(() => {
    const title = this.title();
    const id = this.data()?.id;
    const year = this.year();
    return `${this._tmdbService.sanitizeFilename(title)} (${year}) [tmdbid-${id}]`;
  });

  constructor() {
    effect(async () => {
      const data = this.data();
      const title = this.title();
      if (!data || !title || !this._tmdbService.hasForeignCharacters(title) || this._rescraped) {
        return;
      }
      this._rescraped = true;
      let response: MovieDetails | TvShowDetails | undefined;
      switch (data.media_type) {
        case 'movie':
          response = await this._tmdbService.movie(data.id, this.FALLBACK_LANGUAGE);
          if (!response) {
            break;
          }
          this.data.set({
            ...data,
            title: response.title,
            overview: response.overview,
          });
          break;
        case 'tv':
          response = await this._tmdbService.tvShow(data.id, this.FALLBACK_LANGUAGE);
          if (!response) {
            break;
          }
          this.data.set({
            ...data,
            name: response.name,
            overview: response.overview,
          });
          break;
      }
    });
  }

  protected copyToClipboard() {
    navigator.clipboard.writeText(this.folderName()).then((r) => {
      this.copied.set(true);
      setTimeout(() => {
        this.copied.set(false);
      }, 1500);
    });
  }

  protected redirectToInfoPage() {
    const data = this.data();
    if (data?.id == undefined) {
      return;
    }
    switch (data.media_type) {
      case 'movie':
        window.open(`https://www.themoviedb.org/movie/${data.id}`, '_blank');
        break;
      case 'tv':
        window.open(`https://www.themoviedb.org/tv/${data.id}`, '_blank');
        break;
      case 'person':
        window.open(`https://www.themoviedb.org/person/${data.id}`, '_blank');
        break;
    }
  }
}
