import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SearchParam } from '../interfaces';
import {
  MovieResultsResponse,
  Person,
  SearchMultiResponse,
  SearchPersonResponse,
  TvResultsResponse,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class MovieDbService {
  private readonly basePath = 'https://api.themoviedb.org/3/';
  private readonly searchPath = this.basePath + 'search/';
  private readonly personPath = this.basePath + 'person/';
  private http = inject(HttpClient);
  private translate = inject(TranslateService);

  async search(params: SearchParam) {
    let url =
      this.searchPath +
      params.media_type +
      '?api_key=' +
      environment.movieDbApiKey +
      '&language=' +
      this.translate.currentLang;
    if (params.page) {
      url += '&page=' + params.page;
    }
    if (params.query) {
      url += '&query=' + params.query;
    }
    if (params.id) {
      url += '&id=' + params.id;
    }
    return await firstValueFrom(
      this.http
        .get<
          | SearchMultiResponse
          | MovieResultsResponse
          | TvResultsResponse
          | SearchPersonResponse
        >(url, undefined)
        .pipe(
          map((value) => {
            value.results?.forEach(
              (item) =>
                (item.media_type =
                  params.media_type != 'multi'
                    ? params.media_type
                    : item.media_type)
            );
            return value;
          })
        )
    );
  }

  async personInfo(id: number) {
    return await firstValueFrom(
      this.http.get<Person>(
        this.personPath +
          id +
          '?api_key=' +
          environment.movieDbApiKey +
          '&language=' +
          this.translate.currentLang,
        undefined
      )
    );
  }
}
