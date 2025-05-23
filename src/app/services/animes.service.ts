import { Injectable } from '@angular/core';
import {Content} from '../models/Content.model';
import {HttpClient} from '@angular/common/http';
import {equalTo, get, getDatabase, orderByChild, query, ref, set} from 'firebase/database';
import {initializeApp} from 'firebase/app';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnimesService {
  private firebaseApp = initializeApp(environment.firebaseConfig);
  private db = getDatabase(this.firebaseApp);

  constructor(private http: HttpClient) { }

  private pad(num: number): string {
    return num.toString().padStart(2, '0');
  }

  fetchSeasonedAnimeAndSave(onComplete?: () => void): void {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    let season: string;
    if (month >= 1 && month <= 3) {
      season = 'WINTER';
    } else if (month >= 4 && month <= 6) {
      season = 'SPRING';
    } else if (month >= 7 && month <= 9) {
      season = 'SUMMER';
    } else {
      season = 'FALL';
    }

    const query = `
    query {
      Page(page: 1, perPage: 20) {
        media(season: ${season}, seasonYear: ${year}, type: ANIME, sort: POPULARITY_DESC) {
          id
          title { english }
          startDate { year month day }
          status
          episodes
          genres
          averageScore
          studios { nodes { name } }
          siteUrl
          description
          coverImage { large }
        }
      }
    }
  `;

    const options = {
      headers: { 'Content-Type': 'application/json' }
    };

    this.http.post<any>('https://graphql.anilist.co', { query }, options).subscribe({
      next: async (response) => {
        const mediaList = response.data.Page.media;

        for (const anime of mediaList) {
          const animeID = anime.id.toString();
          const title = anime.title.english ?? 'Título desconocido';
          const releaseDate = `${anime.startDate.year}-${this.pad(anime.startDate.month)}-${this.pad(anime.startDate.day)}`;
          const rating = anime.averageScore?.toString() ?? '0';
          const episodes = anime.episodes?.toString() ?? '0';
          const genresAnime: string[] = anime.genres ?? [];
          const studios: string[] = anime.studios?.nodes?.map((n: any) => n.name) ?? [];
          const coverImage = anime.coverImage.large;
          const description = anime.description ?? 'Descripción no disponible';
          const origin = `seasonal_${year}`;

          const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
          const id = `${normalizedTitle}_${releaseDate}`;

          const content: Content = {
            categoryID: 'cat_4',
            title,
            description,
            releaseDate,
            rating,
            coverImage,
            source: 'AniList',
            animeID,
            origin,
            episodes,
            genresAnime,
            studios,
            id
          };

          await this.checkAndInsertAnime(content);
        }

        if (onComplete) onComplete();
      },
      error: (err) => {
        console.error('Error en la solicitud AniList', err);
      }
    });
  }

  fetchPopularAnimeAndSave(onComplete?: () => void): void {
    const now = new Date();
    const year = now.getFullYear();

    const query = `
    query {
      Page(page: 1, perPage: 50) {
        media(seasonYear: ${year}, type: ANIME, sort: POPULARITY_DESC) {
          id
          title { english }
          startDate { year month day }
          status
          episodes
          genres
          averageScore
          studios { nodes { name } }
          siteUrl
          description
          coverImage { large }
        }
      }
    }
  `;

    const options = {
      headers: { 'Content-Type': 'application/json' }
    };

    this.http.post<any>('https://graphql.anilist.co', { query }, options).subscribe({
      next: async (response) => {
        const mediaList = response.data.Page.media;
        const today = new Date();

        for (const anime of mediaList) {
          const yearStart = anime.startDate?.year ?? 0;
          const monthStart = anime.startDate?.month ?? 0;
          const dayStart = anime.startDate?.day ?? 0;

          if (yearStart === 0 || monthStart === 0 || dayStart === 0) continue; // fecha no válida

          const animeDate = new Date(yearStart, monthStart - 1, dayStart);
          if (animeDate > today) continue; // no ha estrenado

          const animeID = anime.id.toString();
          const title = anime.title?.english ?? 'Título desconocido';
          const releaseDate = `${yearStart}-${this.pad(monthStart)}-${this.pad(dayStart)}`;
          const rating = anime.averageScore?.toString() ?? '0';
          const episodes = anime.episodes?.toString() ?? '0';
          const genresAnime: string[] = anime.genres ?? [];
          const studios: string[] = anime.studios?.nodes?.map((n: any) => n.name) ?? [];
          const coverImage = anime.coverImage?.large ?? '';
          const description = anime.description ?? 'Descripción no disponible';
          const origin = `popular_${year}`;

          const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
          const id = `${normalizedTitle}_${releaseDate}`;

          const content: Content = {
            categoryID: 'cat_4',
            title,
            description,
            releaseDate,
            rating,
            coverImage,
            source: 'AniList',
            animeID,
            origin,
            episodes,
            genresAnime,
            studios,
            id
          };

          // Comprobar si existe en Firebase y si hay que insertar o sobrescribir según prioridad
          await this.checkAndInsertAnime(content);
        }

        if (onComplete) onComplete();
      },
      error: (err) => {
        console.error('Error en la solicitud AniList', err);
        if (onComplete) onComplete();
      }
    });
  }



  private async checkAndInsertAnime(content: Content): Promise<void> {
    if (!content.animeID) {
      console.warn(`animeID está vacío o undefined para el contenido:`, content);
      return;
    }

    const refPath = ref(this.db, 'content');
    const animeQuery = query(refPath, orderByChild('animeID'), equalTo(content.animeID));

    const snapshot = await get(animeQuery);
    let exists = false;

    snapshot.forEach((childSnapshot) => {
      const existing = childSnapshot.val() as Content;
      if (existing && existing.origin === content.origin) {
        exists = true;

        const needsUpdate =
          existing.title !== content.title ||
          existing.description !== content.description ||
          existing.releaseDate !== content.releaseDate ||
          existing.rating !== content.rating ||
          existing.coverImage !== content.coverImage ||
          JSON.stringify(existing.genresAnime) !== JSON.stringify(content.genresAnime) ||
          JSON.stringify(existing.studios) !== JSON.stringify(content.studios);

        if (needsUpdate) {
          console.log(`Actualizando anime: ${content.title}`);
          set(childSnapshot.ref, content);
        } else {
          console.log(`Anime sin cambios: ${content.title}`);
        }
      }
    });

    if (!exists) {
      await this.insertAnime(content);
      console.log(`Anime añadido: ${content.title}`);
    }
  }


  fetchBestAnimeYearlyAndSave(onComplete?: () => void): void {
    const now = new Date();
    const year = now.getFullYear() - 1; // El año anterior

    const query = `
    query {
      Page(page: 1, perPage: 50) {
        media(seasonYear: ${year}, type: ANIME, sort: SCORE_DESC, status: FINISHED) {
          id
          title { english romaji native }
          startDate { year month day }
          status
          episodes
          genres
          averageScore
          studios { nodes { name } }
          siteUrl
          description
          coverImage { large }
        }
      }
    }
  `;

    const options = {
      headers: { 'Content-Type': 'application/json' }
    };

    this.http.post<any>('https://graphql.anilist.co', { query }, options).subscribe({
      next: async (response) => {
        const mediaList = response.data.Page.media;

        for (const anime of mediaList) {
          const yearStart = anime.startDate?.year ?? 0;
          const monthStart = anime.startDate?.month ?? 0;
          const dayStart = anime.startDate?.day ?? 0;

          if (yearStart === 0 || monthStart === 0 || dayStart === 0) continue;

          const animeDate = new Date(yearStart, monthStart - 1, dayStart);
          const today = new Date();
          if (animeDate > today) continue;

          const animeID = anime.id.toString();
          const title = anime.title.english ?? 'Título desconocido';
          const releaseDate = `${yearStart}-${this.pad(monthStart)}-${this.pad(dayStart)}`;
          const rating = anime.averageScore?.toString() ?? '0';
          const episodes = anime.episodes?.toString() ?? '0';
          const genresAnime: string[] = anime.genres ?? [];
          const studios: string[] = anime.studios?.nodes?.map((n: any) => n.name) ?? [];
          const coverImage = anime.coverImage.large;
          const description = anime.description ?? 'Descripción no disponible';
          const origin = `best_${year}`;

          // Construir id único (opcional, depende de tu modelo)
          const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
          const id = `${normalizedTitle}_${releaseDate}`;

          const content: Content = {
            categoryID: 'cat_4',
            title,
            description,
            releaseDate,
            rating,
            coverImage,
            source: 'AniList',
            animeID,
            origin,
            episodes,
            genresAnime,
            studios,
            id
          };

          await this.checkAndInsertAnime(content);
        }

        if (onComplete) onComplete();
      },
      error: (err) => {
        console.error('Error en la solicitud AniList', err);
      }
    });
  }




  private async insertAnime(content: Content): Promise<string> {
    const baseTitle = content.title || '';
    // Normalizar el título: minúsculas y sin caracteres especiales
    const normalizedTitle = baseTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
    const releaseDate = content.releaseDate || '';
    const uniqueKey = `${normalizedTitle}_${releaseDate}`;

    content.id = uniqueKey;

    const newRef = ref(this.db, `content/${uniqueKey}`);

    try {
      const snapshot = await get(newRef);

      if (!snapshot.exists()) {
        // No existe, insertamos directamente
        await set(newRef, content);
        console.log(`Insertado: ${uniqueKey} con origin: ${content.origin}`);
      } else {
        // Existe, comprobamos prioridad
        const existing = snapshot.val() as Content;

        if (existing?.origin) {
          const existingPriority = this.getOriginAnimePriority(existing.origin);
          const newPriority = this.getOriginAnimePriority(content.origin!);

          if (newPriority < existingPriority) {
            await set(newRef, content);
            console.log(`Sobrescrito por: ${content.origin}`);
          } else {
            console.log(`No sobrescrito, origin existente con mayor o igual prioridad: ${existing.origin}`);
          }
        } else {
          // Origin desconocido, sobrescribimos
          await set(newRef, content);
          console.log(`Sobrescrito (origin desconocido): ${content.origin}`);
        }
      }
    } catch (error) {
      console.error('Error al comprobar existencia:', error);
    }

    return uniqueKey;
  }

  private getOriginAnimePriority(origin: string): number {
    if (origin.startsWith('seasonal')) return 0;
    if (origin.startsWith('popular')) return 1;
    if (origin.startsWith('best')) return 2;
    return 99;
  }

}
