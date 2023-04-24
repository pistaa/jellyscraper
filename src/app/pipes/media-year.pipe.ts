import { Pipe, PipeTransform } from '@angular/core';
import { SearchResult } from '../types';

@Pipe({
  name: 'mediaYear',
})
export class MediaYearPipe implements PipeTransform {
  transform(value: SearchResult | undefined): unknown {
    switch (value?.media_type) {
      case 'movie':
        return value.release_date?.substring(0, 4);
      case 'tv':
        return value.first_air_date?.substring(0, 4);
      case 'person':
        return undefined;
    }
    return undefined;
  }
}
