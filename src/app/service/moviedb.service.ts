import { Injectable } from '@angular/core';
import { MovieDb } from 'moviedb-promise';

@Injectable({
  providedIn: 'root',
})
export class MovieDbService extends MovieDb {
  constructor() {
    super('132ed6cd86538da6c9c9a0ddb3ccbb0b');
  }
}
