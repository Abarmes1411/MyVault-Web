import {Component, OnInit} from '@angular/core';
import {DecimalPipe, NgForOf, NgIf} from "@angular/common";
import {Content} from '../../../models/Content.model';
import {MoviesService} from '../../../services/movies.service';
import {GamesService} from '../../../services/games.service';

@Component({
  selector: 'app-games',
    imports: [
        DecimalPipe,
        NgForOf,
        NgIf
    ],
  templateUrl: './games.component.html',
  styleUrl: './games.component.css'
})
export class GamesComponent implements OnInit {
  recentGames: Content[] = [];
  popularGames: Content[] = [];
  upcomingGames: Content[] = [];
  loading: boolean = true;

  constructor(private gamesService: GamesService) {}

  ngOnInit(): void {

    if (hasAlreadyFetchedToday('gameFetchedDate')) {

      this.loadGamesFromFirebase();
      return;
    }

    // Ejecutar peticiones a RAWG: recent, popular y upcoming
    let recentDone = false;
    let popularDone = false;
    let upcomingDone = false;

    const checkAndLoad = () => {
      if (recentDone && popularDone && upcomingDone) {
        markAsFetchedToday("gameFetchedDate")
        this.loadGamesFromFirebase();
      }
    };

    this.gamesService.fetchRecentGamesAndSave(() => {
      recentDone = true;
      checkAndLoad();
    });

    this.gamesService.fetchPopularGamesAndSave(() => {
      popularDone = true;
      checkAndLoad();
    });

    this.gamesService.fetchUpcomingGamesAndSave(() => {
      upcomingDone = true;
      checkAndLoad();
    });
  }

  private async loadGamesFromFirebase(): Promise<void> {
    try {
      const allContentRef = this.gamesService['db'];
      const contentSnapshot = await import('firebase/database').then(({ ref, get, child }) =>
        get(child(ref(allContentRef), 'content'))
      );

      const recent: Content[] = [];
      const popular: Content[] = [];
      const upcoming: Content[] = [];

      contentSnapshot.forEach((childSnap) => {
        const data = childSnap.val() as Content;

        if (data.categoryID === 'cat_3') {
          if (data.origin?.startsWith('recent_') || data.origin?.startsWith('release_')) {
            recent.push(data);
          } else if (data.origin?.startsWith('popular_')) {
            popular.push(data);
          } else if (data.origin?.startsWith('upcoming_')) {
            upcoming.push(data);
          }
        }
      });

      this.recentGames = recent;
      this.popularGames = popular;
      this.upcomingGames = upcoming;
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
