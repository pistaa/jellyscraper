import { Clipboard } from '@angular/cdk/clipboard';
import { Component, Input } from '@angular/core';
import { MovieResult, PersonResult, TvResult } from 'moviedb-promise';

@Component({
  selector: 'app-media-card',
  templateUrl: './media-card.component.html',
  styleUrls: ['./media-card.component.scss'],
})
export class MediaCardComponent {
  private _media?: MovieResult | TvResult | PersonResult;
  get media(): MovieResult | TvResult | PersonResult | undefined {
    return this._media;
  }
  @Input() set media(value: MovieResult | TvResult | PersonResult | undefined) {
    this._media = value;
    switch (value?.media_type) {
      case 'movie':
        this.fetchMovie(value);
        break;
      case 'person':
        this.fetchPerson(value);
        break;
      case 'tv':
        this.fetchTv(value);
        break;
      default:
        break;
    }
  }

  data?: {
    id: string;
    icon: string;
    title: string;
    subtitle: string;
    year: string;
    originalTitle: string;
    description: string;
    posterUrl: string;
    backdropUrl: string;
    infoUrl: string;
    folderName: string;
  };

  copyIcon = 'content_copy';

  constructor(private clipboard: Clipboard) {}

  private fetchMovie(value: MovieResult) {
    this.data = {
      id: String(value.id) ?? '',
      icon: 'movie',
      title: value.title ?? '',
      subtitle: value.original_title ?? '',
      year: value.release_date?.includes('-')
        ? value.release_date.substring(0, value.release_date.indexOf('-'))
        : '',
      originalTitle: value.original_title ?? '',
      description: value.overview ?? '',
      posterUrl: value.poster_path
        ? 'https://image.tmdb.org/t/p/w500/' + value.poster_path
        : '',
      backdropUrl: value.backdrop_path
        ? 'https://image.tmdb.org/t/p/w500/' + value.backdrop_path
        : '',
      infoUrl: value.id ? 'https://www.themoviedb.org/movie/' + value.id : '',
      folderName: '',
    };
    this.data.folderName = (
      this.data.title +
      (this.data.year ? ' (' + this.data.year + ')' : '') +
      (this.data.id ? ' [tmdbid-' + this.data.id + ']' : '')
    )
      .replaceAll('\\', '')
      .replaceAll('/', '')
      .replaceAll(':', '')
      .trim();
  }

  private fetchPerson(value: PersonResult) {
    this.data = {
      id: String(value.id) ?? '',
      icon: 'person',
      title: value.name ?? '',
      subtitle: '',
      year: '',
      originalTitle: '',
      description: '',
      posterUrl: value.profile_path
        ? 'https://www.themoviedb.org/t/p/w300_and_h450_bestv2' +
          value.profile_path
        : '',
      backdropUrl: '',
      infoUrl: value.id ? 'https://www.themoviedb.org/person/' + value.id : '',
      folderName: '',
    };
  }

  private fetchTv(value: TvResult) {
    this.data = {
      id: String(value.id) ?? '',
      icon: 'tv',
      title: value.name ?? '',
      subtitle: value.original_name ?? '',
      year: value.first_air_date?.includes('-')
        ? value.first_air_date.substring(0, value.first_air_date.indexOf('-'))
        : '',
      originalTitle: value.original_name ?? '',
      description: value.overview ?? '',
      posterUrl: value.poster_path
        ? 'https://image.tmdb.org/t/p/original/' + value.poster_path
        : '',
      backdropUrl: value.backdrop_path
        ? 'https://image.tmdb.org/t/p/w500/' + value.backdrop_path
        : '',
      infoUrl: value.id ? 'https://www.themoviedb.org/tv/' + value.id : '',
      folderName: '',
    };
    this.data.folderName = (
      this.data.title +
      (this.data.year ? ' (' + this.data.year + ')' : '') +
      (this.data.id ? ' [tmdbid-' + this.data.id + ']' : '')
    )
      .replaceAll('\\', '')
      .replaceAll('/', '')
      .replaceAll(':', '')
      .trim();
  }

  openNewTab(url: string) {
    window.open(url, '_blank');
  }

  copyToClipboard(s: string) {
    this.clipboard.copy(s);
    this.copyIcon = 'done';
    setTimeout(() => (this.copyIcon = 'content_copy'), 2000);
  }
}
