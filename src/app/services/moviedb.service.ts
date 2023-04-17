import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AxiosRequestConfig } from 'axios';
import {
  MovieDb,
  MovieResultsResponse,
  SearchMultiResponse,
  SearchPersonResponse,
  TvResultsResponse,
} from 'moviedb-promise';
import { environment } from 'src/environments/environment';
import { SearchParam } from '../interfaces';
import { MediaTypes } from '../types';

@Injectable({
  providedIn: 'root',
})
export class MovieDbService extends MovieDb {
  constructor(private translate: TranslateService) {
    super(environment.movieDbApiKey);
  }

  search(
    params: SearchParam,
    axiosConfig?: AxiosRequestConfig
  ): Promise<
    | SearchMultiResponse
    | MovieResultsResponse
    | TvResultsResponse
    | SearchPersonResponse
  > {
    params.language = params.language ?? this.translate.currentLang;
    switch (params.media_type) {
      case 'all':
        return this.searchMulti(params, axiosConfig);
      case 'movie':
        return this.searchMovie(params, axiosConfig);
      case 'tv':
        return this.searchTv(params, axiosConfig);
      case 'person':
        return this.searchPerson(params, axiosConfig);
    }
  }

  fillMissingMediaTypes(
    response:
      | SearchMultiResponse
      | MovieResultsResponse
      | TvResultsResponse
      | SearchPersonResponse
  ):
    | SearchMultiResponse
    | MovieResultsResponse
    | TvResultsResponse
    | SearchPersonResponse {
    if (
      response.results &&
      response.results.length > 0 &&
      !response.results[0].media_type
    ) {
      let mediaType: MediaTypes | undefined;
      if (response.results[0]['title']) {
        mediaType = 'movie';
      } else if (response.results[0]['profile_path']) {
        mediaType = 'person';
      } else if (response.results[0]['name']) {
        mediaType = 'tv';
      }
      if (mediaType) {
        response.results.forEach(
          (value) =>
            (value.media_type =
              mediaType && mediaType != 'all' ? mediaType : value.media_type)
        );
      }
    }
    return response;
  }
}
