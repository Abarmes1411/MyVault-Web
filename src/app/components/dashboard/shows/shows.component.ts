import {Component, OnInit} from '@angular/core';
import {DecimalPipe, NgForOf, NgIf} from '@angular/common';
import {Content} from '../../../models/Content.model';
import {MoviesService} from '../../../services/movies.service';
import {ShowsService} from '../../../services/shows.service';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-shows',
  imports: [
    DecimalPipe,
    NgForOf,
    NgIf,
    RouterLink
  ],
  templateUrl: './shows.component.html',
  styleUrl: './shows.component.css'
})
export class ShowsComponent implements OnInit {
  recentShows: Content[] = [];
  popularShows: Content[] = [];
  upcomingShows: Content[] = [];
  loading: boolean = true;

  constructor(private showsService: ShowsService) {}

  ngOnInit(): void {

    if (hasAlreadyFetchedToday('showFetchedDate')) {
      this.loadShowsFromFirebase();
      return;
    }

    // Ejecutar peticiones a TMDB: recent, popular y upcoming
    let recentDone = false;
    let popularDone = false;
    let upcomingDone = false;

    const checkAndLoad = () => {
      if (recentDone && popularDone && upcomingDone) {
        markAsFetchedToday("showFetchedDate")
        this.loadShowsFromFirebase();
      }
    };

    this.showsService.fetchRecentShowsAndSave(() => {
      recentDone = true;
      checkAndLoad();
    });

    this.showsService.fetchPopularShowsAndSave(() => {
      popularDone = true;
      checkAndLoad();
    });

    this.showsService.fetchUpcomingShowsAndSave(() => {
      upcomingDone = true;
      checkAndLoad();
    });
  }

  private async loadShowsFromFirebase(): Promise<void> {
    try {
      const allContentRef = this.showsService['db'];
      const contentSnapshot = await import('firebase/database').then(({ ref, get, child }) =>
        get(child(ref(allContentRef), 'content'))
      );

      const recent: Content[] = [];
      const popular: Content[] = [];
      const upcoming: Content[] = [];

      contentSnapshot.forEach((childSnap) => {
        const data = childSnap.val() as Content;

        if (data.categoryID === 'cat_2') {
          if (data.origin?.startsWith('recent_') || data.origin?.startsWith('release_')) {
            recent.push(data);
          } else if (data.origin?.startsWith('popular_')) {
            popular.push(data);
          } else if (data.origin?.startsWith('upcoming_')) {
            upcoming.push(data);
          }
        }
      });

      this.recentShows = recent;
      this.popularShows = popular;
      this.upcomingShows = upcoming;
      this.loading = false;
    } catch (error) {
      console.error('Error cargando las películas desde Firebase:', error);
    }
  }

}

function hasAlreadyFetchedToday(key: string): boolean {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const lastFetch = localStorage.getItem(key);
  return lastFetch === today;
}

function markAsFetchedToday(key: string): void {
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem(key, today);
}
