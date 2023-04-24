import { Pipe, PipeTransform } from '@angular/core';
import { SearchResult } from '../types';

@Pipe({
  name: 'mediaTitle',
})
export class MediaTitlePipe implements PipeTransform {
  transform(value: SearchResult | undefined): string | undefined {
    switch (value?.media_type) {
      case 'movie':
        return value.title;
      case 'tv':
        return value.name;
      case 'person':
        return value.name;
    }
    return undefined;
  }
}
