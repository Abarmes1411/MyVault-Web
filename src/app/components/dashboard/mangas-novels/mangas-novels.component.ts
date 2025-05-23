import {Component, OnInit} from '@angular/core';
import {DecimalPipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {Content} from '../../../models/Content.model';
import {GamesService} from '../../../services/games.service';
import {MangasService} from '../../../services/mangas.service';
import {NovelsService} from '../../../services/novels.service';

@Component({
  selector: 'app-mangas-novels',
  imports: [
    DecimalPipe,
    NgForOf,
    NgIf,
    NgClass
  ],
  templateUrl: './mangas-novels.component.html',
  styleUrl: './mangas-novels.component.css'
})
export class MangasNovelsComponent implements OnInit {
  selectedType: 'manga' | 'novel' = 'manga';
  newsMangas: Content[] = [];
  topOngoingMangas: Content[] = [];
  bestMangas: Content[] = [];
  newsNovels: Content[] = [];
  topOngoingNovels: Content[] = [];
  bestNovels: Content[] = [];
  loading: boolean = true;

  constructor(private mangasService: MangasService, private novelsService: NovelsService) {}

  ngOnInit(): void {
    if (hasAlreadyFetchedToday('mangaFetchedDate')) {
      this.loadMangasFromFirebase();
      return;
    }

    let newsDone = false;
    let topOngoingDone = false;
    let bestDone = false;

    const checkAndLoad = () => {
      if (newsDone && topOngoingDone && bestDone) {
        markAsFetchedToday('mangaFetchedDate');
        this.loadMangasFromFirebase();
      }
    };

    this.mangasService.fetchNewsMangasAndSave(() => {
      newsDone = true;
      checkAndLoad();
    });

    this.mangasService.fetchTopOngoingMangasAndSave(() => {
      topOngoingDone = true;
      checkAndLoad();
    });

    this.mangasService.fetchBestMangaYearlyAndSave(() => {
      bestDone = true;
      checkAndLoad();
    });
  }


  onTypeChange(type: 'manga' | 'novel') {
    this.selectedType = type;

    if (type === 'novel' && this.newsNovels.length === 0 && this.topOngoingNovels.length === 0 && this.bestNovels.length === 0) {
      this.loading = true;

      if (hasAlreadyFetchedToday('novelFetchedDate')) {
        this.loadNovelsFromFirebase();
        return;
      }

      let newsDone = false;
      let topOngoingDone = false;
      let bestDone = false;

      const checkAndLoad = () => {
        if (newsDone && topOngoingDone && bestDone) {
          markAsFetchedToday('novelFetchedDate');
          this.loadNovelsFromFirebase();
        }
      };

      this.novelsService.fetchNewsNovelsAndSave(() => {
        newsDone = true;
        checkAndLoad();
      });

      this.novelsService.fetchTopOngoingNovelsAndSave(() => {
        topOngoingDone = true;
        checkAndLoad();
      });

      this.novelsService.fetchBestNovelsYearlyAndSave(() => {
        bestDone = true;
        checkAndLoad();
      });
    }

  }


  private async loadMangasFromFirebase(): Promise<void> {
    try {
      const allContentRef = this.mangasService['db'];
      const contentSnapshot = await import('firebase/database').then(({ ref, get, child }) =>
        get(child(ref(allContentRef), 'content'))
      );

      const news: Content[] = [];
      const topOpngoing: Content[] = [];
      const best: Content[] = [];

      contentSnapshot.forEach((childSnap) => {
        const data = childSnap.val() as Content;

        if (data.categoryID === 'cat_5') {
          if (data.origin?.startsWith('new_manga_')) {
            news.push(data);
          } else if (data.origin?.startsWith('ongoing_')) {
            topOpngoing.push(data);
          } else if (data.origin?.startsWith('bestof_')) {
            best.push(data);
          }
        }
      });

      this.newsMangas = news;
      this.topOngoingMangas = topOpngoing;
      this.bestMangas = best;
      this.loading = false;
    } catch (error) {
      console.error('Error cargando las mangas desde Firebase:', error);
    }
  }

  private async loadNovelsFromFirebase(): Promise<void> {
    try {
      const allContentRef = this.novelsService['db'];
      const contentSnapshot = await import('firebase/database').then(({ ref, get, child }) =>
        get(child(ref(allContentRef), 'content'))
      );

      const news: Content[] = [];
      const topOpngoing: Content[] = [];
      const best: Content[] = [];

      contentSnapshot.forEach((childSnap) => {
        const data = childSnap.val() as Content;

        if (data.categoryID === 'cat_6') {
          if (data.origin?.startsWith('new_novel_')) {
            news.push(data);
          } else if (data.origin?.startsWith('ongoing_')) {
            topOpngoing.push(data);
          } else if (data.origin?.startsWith('bestof_')) {
            best.push(data);
          }
        }
      });

      this.newsNovels = news;
      this.topOngoingNovels = topOpngoing;
      this.bestNovels = best;
      this.loading = false;
    } catch (error) {
      console.error('Error cargando las novelas desde Firebase:', error);
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
