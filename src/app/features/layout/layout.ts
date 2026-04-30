import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  private readonly activatedRoute = inject(Router);
  protected readonly isSearchMenuActive = signal(false);

  constructor() {
    this.activatedRoute.events.pipe(takeUntilDestroyed(), filter(value => value instanceof NavigationEnd)).subscribe((value) => {
      this.isSearchMenuActive.set(value.url === '/' || value.url.startsWith('/search'));
    });
  }
}
