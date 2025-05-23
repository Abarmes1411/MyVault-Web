import {Component, OnInit} from '@angular/core';
import {DecimalPipe, NgForOf, NgIf, TitleCasePipe} from "@angular/common";
import {Content} from '../../../models/Content.model';
import {ShowsService} from '../../../services/shows.service';
import {AnimesService} from '../../../services/animes.service';

@Component({
  selector: 'app-animes',
  imports: [
    DecimalPipe,
    NgForOf,
    NgIf,
    TitleCasePipe
  ],
  templateUrl: './animes.component.html',
  styleUrl: './animes.component.css'
})
export class AnimesComponent implements OnInit {
  recentAnimes: Content[] = [];
  popularAnimes: Content[] = [];
  upcomingAnimes: Content[] = [];
  loading: boolean = true;

  constructor(private animesService: AnimesService) {}

  ngOnInit(): void {

    if (hasAlreadyFetchedToday('animeFetchedDate')) {
      this.loadAnimesFromFirebase();
      return;
    }

    // Ejecutar peticiones a TMDB: recent, popular y upcoming
    let recentDone = false;
    let popularDone = false;
    let upcomingDone = false;

    const checkAndLoad = () => {
      if (recentDone && popularDone && upcomingDone) {
        markAsFetchedToday("animeFetchedDate")
        this.loadAnimesFromFirebase();
      }
    };

    this.animesService.fetchSeasonedAnimeAndSave(() => {
      recentDone = true;
      checkAndLoad();
    });

    this.animesService.fetchPopularAnimeAndSave(() => {
      popularDone = true;
      checkAndLoad();
    });

    this.animesService.fetchBestAnimeYearlyAndSave(() => {
      upcomingDone = true;
      checkAndLoad();
    });
  }

  temporadaActual(): string {
    const month = new Date().getMonth() + 1;
    if (month >= 1 && month <= 3) return 'invierno';
    if (month >= 4 && month <= 6) return 'primavera';
    if (month >= 7 && month <= 9) return 'verano';
    return 'otoño';
  }

  anioAnterior(): number {
    return new Date().getFullYear() - 1;
  }


  private async loadAnimesFromFirebase(): Promise<void> {
    try {
      const allContentRef = this.animesService['db'];
      const contentSnapshot = await import('firebase/database').then(({ ref, get, child }) =>
        get(child(ref(allContentRef), 'content'))
      );

      const recent: Content[] = [];
      const popular: Content[] = [];
      const upcoming: Content[] = [];

      contentSnapshot.forEach((childSnap) => {
        const data = childSnap.val() as Content;

        if (data.categoryID === 'cat_4') {
          if (data.origin?.startsWith('seasonal_')) {
            recent.push(data);
          } else if (data.origin?.startsWith('popular_')) {
            popular.push(data);
          } else if (data.origin?.startsWith('best_')) {
            upcoming.push(data);
          }
        }
      });

      this.recentAnimes = recent;
      this.popularAnimes = popular;
      this.upcomingAnimes = upcoming;
      this.loading = false;
    } catch (error) {
      console.error('Error cargando los animes desde Firebase:', error);
    }
  }

  protected readonly parseFloat = parseFloat;
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
