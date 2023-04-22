import { Component, Input } from '@angular/core';
import { SearchResults } from 'src/app/types';

@Component({
  selector: 'app-media-card-list',
  templateUrl: './media-card-list.component.html',
  styleUrls: ['./media-card-list.component.scss'],
})
export class MediaCardListComponent {
  @Input() mediaList: SearchResults;
}
