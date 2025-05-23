import { Injectable } from '@angular/core';
import {type DataSnapshot, equalTo, get, getDatabase, orderByChild, query, ref, set} from 'firebase/database';
import {Content} from '../models/Content.model';
import {initializeApp} from 'firebase/app';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NovelsService {
  private firebaseApp = initializeApp(environment.firebaseConfig);
  private db = getDatabase(this.firebaseApp);

  constructor(private http: HttpClient) { }

  fetchNewsNovelsAndSave(onComplete?: () => void): void {
    const now = new Date();
    const year = now.getFullYear();

    const startDate = year * 10000 + 101;  // 1 de enero YYYYMMDD
    const endDate = year * 10000 + 1231;   // 31 de diciembre YYYYMMDD

    const queryAniList = `
  query {
    Page(perPage: 20) {
      media(type: MANGA, format: NOVEL, sort: POPULARITY_DESC, startDate_greater: ${startDate}, startDate_lesser: ${endDate}) {
        id
        title { romaji english native }
        startDate { year month day }
        coverImage { large }
        siteUrl
        popularity
        description
        genres
        averageScore
      }
    }
  }
`;


    const options = {
      headers: { 'Content-Type': 'application/json' }
    };

    this.http.post<any>('https://graphql.anilist.co', { query: queryAniList }, options).subscribe({
      next: async (response) => {
        const novels = response.data.Page.media;
        const contentRef = ref(this.db, 'content');

        for (const novel of novels) {
          const mangaID = novel.id.toString();
          const title = novel.title.english;
          const originalTitle = novel.title.romaji;

          const y = novel.startDate?.year ?? 0;
          const m = novel.startDate?.month ?? 0;
          const d = novel.startDate?.day ?? 0;
          const releaseDate = `${y}-${this.pad(m)}-${this.pad(d)}`;

          const normalizedTitle = (title && title.toLowerCase().replace(/[^a-z0-9]/g, '')) ||
            (originalTitle && originalTitle.toLowerCase().replace(/[^a-z0-9]/g, '')) ||
            'unknown';
          const uniqueKey = `${normalizedTitle}_${releaseDate}`;

          const rating = (novel.averageScore ?? 0).toString();
          const popularity = (novel.popularity ?? 0).toString();
          const genresManga: string[] = novel.genres ?? [];
          const coverImage = novel.coverImage?.large ?? '';
          const description = novel.description ?? 'Descripción no disponible';

          // Query para comprobar si ya existe novel con mismo mangaID
          const mangaQuery = query(contentRef, orderByChild('mangaID'), equalTo(mangaID));
          const snapshot = await get(mangaQuery);

          let exists = false;
          let existsWithOngoing = false;

          snapshot.forEach((childSnap: DataSnapshot) => {
            const existingContent = childSnap.val() as Content;
            if (existingContent && existingContent.mangaID === mangaID) {
              exists = true;
              if (existingContent.origin && existingContent.origin.startsWith('ongoing')) {
                existsWithOngoing = true;
                return true;
              }
            }
            return false;
          });

          if (!exists || !existsWithOngoing) {
            const content: Content = {
              id: uniqueKey,
              categoryID: 'cat_6',
              title,
              originalTitle,
              description,
              releaseDate,
              rating,
              coverImage,
              source: 'AniList',
              genresManga,
              popularity,
              mangaID: mangaID,
              origin: `new_novel_${year}`
            };

            await this.insertManga(content);
            console.log('Novela añadido desde new_mangas: ' + title);
          } else {
            console.log('Duplicado omitido con el mismo mangaID: ' + title);
          }
        }

        if (onComplete) onComplete();
      },
      error: (err) => {
        console.error('Error en la solicitud AniList para novelas', err);
        if (onComplete) onComplete();
      }
    });
  }


  fetchTopOngoingNovelsAndSave(onComplete?: () => void): void {
    const now = new Date();
    const year = now.getFullYear();

    const queryAniList = `
  query {
    Page(perPage: 20) {
      media(type: MANGA, format: NOVEL, status: RELEASING, sort: POPULARITY_DESC) {
        id
        title { romaji english native }
        startDate { year month day }
        coverImage { large }
        siteUrl
        popularity
        description
        genres
        averageScore
      }
    }
  }
`;

    const options = {
      headers: { 'Content-Type': 'application/json' }
    };

    this.http.post<any>('https://graphql.anilist.co', { query: queryAniList }, options).subscribe({
      next: async (response) => {
        const novels = response.data.Page.media;
        const contentRef = ref(this.db, 'content');

        for (const novel of novels) {
          const mangaID = novel.id.toString();
          const title = novel.title.english;
          const originalTitle = novel.title.romaji;

          const y = novel.startDate?.year ?? 0;
          const m = novel.startDate?.month ?? 0;
          const d = novel.startDate?.day ?? 0;
          const releaseDate = `${y}-${this.pad(m)}-${this.pad(d)}`;

          const normalizedTitle = (title && title.toLowerCase().replace(/[^a-z0-9]/g, '')) ||
            (originalTitle && originalTitle.toLowerCase().replace(/[^a-z0-9]/g, '')) ||
            'unknown';
          const uniqueKey = `${normalizedTitle}_${releaseDate}`;

          const rating = (novel.averageScore ?? 0).toString();
          const popularity = (novel.popularity ?? 0).toString();
          const genresManga: string[] = novel.genres ?? [];
          const coverImage = novel.coverImage?.large ?? '';
          const description = novel.description ?? 'Descripción no disponible';

          const mangaQuery = query(contentRef, orderByChild('mangaID'), equalTo(mangaID));
          const snapshot = await get(mangaQuery);

          let exists = false;

          snapshot.forEach((childSnap: DataSnapshot) => {
            const existingContent = childSnap.val() as Content;
            if (existingContent && existingContent.mangaID === mangaID) {
              exists = true;
              return true;
            }
            return false;
          });

          if (!exists) {
            const content: Content = {
              id: uniqueKey,
              categoryID: 'cat_6',
              title,
              originalTitle,
              description,
              releaseDate,
              rating,
              coverImage,
              source: 'AniList',
              genresManga,
              popularity,
              mangaID,
              origin: `ongoing_${year}`
            };

            await this.insertManga(content);
            console.log('Novela añadido desde ongoing: ' + title);
          } else {
            console.log('Duplicado omitido con el mismo mangaID: ' + title);
          }
        }

        if (onComplete) onComplete();
      },
      error: (err) => {
        console.error('Error en la solicitud AniList para novelas en emisión', err);
        if (onComplete) onComplete();
      }
    });
  }

  fetchBestNovelsYearlyAndSave(onComplete?: () => void): void {
    const now = new Date();
    const currentYear = now.getFullYear();
    const lastYear = currentYear - 1;

    const startDate = lastYear * 10000 + 101;   // 01/01 del año anterior
    const endDate = lastYear * 10000 + 1231;    // 31/12 del año anterior

    const queryAniList = `
  query {
    Page(perPage: 20) {
      media(
        type: MANGA,
        format: NOVEL,
        sort: POPULARITY_DESC,
        startDate_greater: ${lastYear}0101,
        startDate_lesser: ${lastYear}1231
      ) {
        id
        title { romaji english native }
        startDate { year month day }
        coverImage { large }
        siteUrl
        popularity
        description
        genres
        averageScore
      }
    }
  }
`;


    const options = {
      headers: { 'Content-Type': 'application/json' }
    };

    this.http.post<any>('https://graphql.anilist.co', { query: queryAniList }, options).subscribe({
      next: async (response) => {
        const novels = response.data.Page.media;
        const contentRef = ref(this.db, 'content');

        for (const novel of novels) {
          const mangaID = novel.id.toString();
          const title = novel.title.english;
          const originalTitle = novel.title.romaji;

          const y = novel.startDate?.year ?? 0;
          const m = novel.startDate?.month ?? 0;
          const d = novel.startDate?.day ?? 0;
          const releaseDate = `${y}-${this.pad(m)}-${this.pad(d)}`;

          const normalizedTitle = (title && title.toLowerCase().replace(/[^a-z0-9]/g, '')) ||
            (originalTitle && originalTitle.toLowerCase().replace(/[^a-z0-9]/g, '')) ||
            'unknown';
          const uniqueKey = `${normalizedTitle}_${releaseDate}`;

          const rating = (novel.averageScore ?? 0).toString();
          const popularity = (novel.popularity ?? 0).toString();
          const genresManga: string[] = novel.genres ?? [];
          const coverImage = novel.coverImage?.large ?? '';
          const description = novel.description ?? 'Descripción no disponible';

          const mangaQuery = query(contentRef, orderByChild('mangaID'), equalTo(mangaID));
          const snapshot = await get(mangaQuery);

          let exists = false;
          let existsWithBestOf = false;

          snapshot.forEach((childSnap: DataSnapshot) => {
            const existingContent = childSnap.val() as Content;
            if (existingContent && existingContent.mangaID === mangaID) {
              exists = true;
              if (existingContent.origin && existingContent.origin.startsWith(`new_manga_`)) {
                existsWithBestOf = true;
                return true;
              }
            }
            return false;
          });

          if (!exists || !existsWithBestOf) {
            const content: Content = {
              id: uniqueKey,
              categoryID: 'cat_6',
              title,
              originalTitle,
              description,
              releaseDate,
              rating,
              coverImage,
              source: 'AniList',
              genresManga,
              popularity,
              mangaID,
              origin: `bestof_${lastYear}`
            };

            await this.insertManga(content);
            console.log('Novela añadido desde bestof_' + lastYear + ': ' + title);
          } else {
            console.log('Duplicado omitido con el mismo mangaID: ' + title);
          }
        }

        if (onComplete) onComplete();
      },
      error: (err) => {
        console.error('Error en la solicitud AniList para best Novelas del año anterior', err);
        if (onComplete) onComplete();
      }
    });
  }

  async insertManga(content: Content): Promise<string> {
    try {
      let baseTitle = content.title;
      if (!baseTitle || baseTitle.toLowerCase() === 'null') {
        baseTitle = content.originalTitle;
        content.title = baseTitle;
      }

      const normalizedTitle = baseTitle!.toLowerCase().replace(/[^a-z0-9]/g, '');
      const releaseDate = content.releaseDate;
      const uniqueKey = `${normalizedTitle}_${releaseDate}`;

      content.id = uniqueKey;

      const contentRef = ref(this.db, `content/${uniqueKey}`);

      const snapshot = await get(contentRef);
      const existing = snapshot.val() as Content | null;

      if (!existing) {
        await set(contentRef, content);
        console.log(`Insertado: ${uniqueKey} con origin: ${content.origin}`);
      } else {
        const existingPriority = this.getOriginMangaPriority(existing.origin ?? '');
        const newPriority = this.getOriginMangaPriority(content.origin ?? '');

        if (newPriority < existingPriority) {
          await set(contentRef, content);
          console.log(`Sobrescrito por: ${content.origin}`);
        } else {
          console.log(`No sobrescrito, origin existente con mayor o igual prioridad: ${existing.origin}`);
        }
      }

      return uniqueKey;
    } catch (error) {
      console.error('Error al comprobar existencia o insertar manga:', error);
      throw error;
    }
  }


  private getOriginMangaPriority(origin: string): number {
    if (origin.startsWith('ongoing')) return 0;
    if (origin.startsWith('news')) return 1;
    if (origin.startsWith('bestof')) return 2;
    return 99;
  }

  private pad(n: number): string {
    return n < 10 ? '0' + n : n.toString();
  }
}
