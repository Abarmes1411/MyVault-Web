import {Component, OnInit} from '@angular/core';
import {Content} from '../../../models/Content.model';
import {MoviesService} from '../../../services/movies.service';
import {DecimalPipe, NgForOf, NgIf} from '@angular/common';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-movies',
  imports: [
    NgIf,
    NgForOf,
    DecimalPipe,
    RouterLink
  ],
  templateUrl: './movies.component.html',
  styleUrl: './movies.component.css'
})
export class MoviesComponent implements OnInit {
  recentMovies: Content[] = [];
  popularMovies: Content[] = [];
  upcomingMovies: Content[] = [];
  loading: boolean = true;

  constructor(private moviesService: MoviesService) {}

  ngOnInit(): void {
    if (hasAlreadyFetchedToday('movieFetchedDate')) {
      this.loadMoviesFromFirebase();
      return;
    }


    // Ejecutar peticiones a TMDB: recent, popular y upcoming
    let recentDone = false;
    let popularDone = false;
    let upcomingDone = false;

    const checkAndLoad = () => {
      if (recentDone && popularDone && upcomingDone) {
        markAsFetchedToday("movieFetchedDate")
        this.loadMoviesFromFirebase();
      }
    };

    this.moviesService.fetchRecentMoviesAndSave(() => {
      recentDone = true;
      checkAndLoad();
    });

    this.moviesService.fetchPopularMoviesAndSave(() => {
      popularDone = true;
      checkAndLoad();
    });

    this.moviesService.fetchUpcomingMoviesAndSave(() => {
      upcomingDone = true;
      checkAndLoad();
    });
  }

  private async loadMoviesFromFirebase(): Promise<void> {
    try {
      const allContentRef = this.moviesService['db'];
      const contentSnapshot = await import('firebase/database').then(({ ref, get, child }) =>
        get(child(ref(allContentRef), 'content'))
      );

      const recent: Content[] = [];
      const popular: Content[] = [];
      const upcoming: Content[] = [];

      contentSnapshot.forEach((childSnap) => {
        const data = childSnap.val() as Content;

        if (data.categoryID === 'cat_1') {
          if (data.origin?.startsWith('recent_') || data.origin?.startsWith('release_')) {
            recent.push(data);
          } else if (data.origin?.startsWith('popular_')) {
            popular.push(data);
          } else if (data.origin?.startsWith('upcoming_')) {
            upcoming.push(data);
          }
        }
      });

      this.recentMovies = recent;
      this.popularMovies = popular;
      this.upcomingMovies = upcoming;
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
