import { Injectable } from '@angular/core';
import {initializeApp} from 'firebase/app';
import {environment} from '../../environments/environment';
import {equalTo, get, getDatabase, orderByChild, query, ref, set} from 'firebase/database';
import {HttpClient} from '@angular/common/http';
import {Content} from '../models/Content.model';

@Injectable({
  providedIn: 'root'
})
export class ShowsService {

  private firebaseApp = initializeApp(environment.firebaseConfig);
  private db = getDatabase(this.firebaseApp);
  private apiKey = '87bb7efee694a2a79d9514b2c909e544';

  constructor(private http: HttpClient) {}


  private pad(num: number): string {
    return num.toString().padStart(2, '0');
  }

  fetchRecentShowsAndSave(onComplete?: () => void): void {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    const startDate = `${year}-${this.pad(month)}-01`;
    const endDate = `${year}-${this.pad(month)}-${this.pad(day)}`;

    const url = `https://api.themoviedb.org/3/discover/tv?api_key=${this.apiKey}&language=es-ES&sort_by=popularity.desc&first_air_date.gte=${startDate}&first_air_date.lte=${endDate}&page=1`;

    this.http.get<any>(url).subscribe({
      next: async (response) => {
        const results = response.results;

        for (const show of results) {
          const originalLanguage = show.original_language ?? '';
          const originCountries: string[] = show.origin_country ?? [];

          let isJapanese = originalLanguage === 'ja' || originCountries.includes('JP');
          if (isJapanese) {
            console.log(`Omitida serie japonesa (posible anime): ${show.name}`);
            continue;
          }

          const tmdbTVID = show.id.toString();
          const title = show.name;
          const description = show.overview;
          const releaseDate = show.first_air_date;
          const posterPath = show.poster_path;
          const rating = show.vote_average?.toString() ?? '0.0';
          const coverImage = `https://image.tmdb.org/t/p/w500${posterPath}`;
          const origin = `recent_tv_${year}`;
          const genres: string[] = show.genre_ids?.map((id: number) => id.toString()) ?? [];

          const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
          const yearSuffix = releaseDate.slice(2, 4);
          const id = `${normalizedTitle}_${yearSuffix}`;

          const content: Content = {
            categoryID: 'cat_2',
            title,
            description,
            releaseDate,
            genresTMDB: genres,
            rating,
            coverImage,
            source: 'TMDB',
            tmdbTVID,
            origin,
            id
          };

          await this.checkAndInsertShow(content);
        }

        if (onComplete) onComplete();
      },
      error: (err) => {
        console.error('Error en la solicitud TMDb', err);
      }
    });
  }


  fetchPopularShowsAndSave(onComplete?: () => void): void {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    const date = `${year - 1}-${this.pad(month)}-${this.pad(day)}`;
    const url = `https://api.themoviedb.org/3/discover/tv?api_key=${this.apiKey}&language=es-ES&sort_by=popularity.desc&first_air_date.gte=${date}&page=1`;

    this.http.get<any>(url).subscribe({
      next: async (response) => {
        const results = response.results;

        for (const show of results) {
          const originalLanguage = show.original_language ?? '';
          const originCountries: string[] = show.origin_country ?? [];

          const isJapanese = originalLanguage === 'ja' || originCountries.includes('JP');
          if (isJapanese) {
            console.log(`Omitida serie japonesa: ${show.name}`);
            continue;
          }

          const tmdbTVID = show.id.toString();
          const title = show.name;
          const description = show.overview;
          const releaseDate = show.first_air_date;
          const posterPath = show.poster_path;
          const rating = show.vote_average?.toString() ?? '0.0';
          const coverImage = `https://image.tmdb.org/t/p/w500${posterPath}`;
          const origin = `popular_tv_${year}`;
          const genres: string[] = show.genre_ids?.map((id: number) => id.toString()) ?? [];

          const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
          const id = `${normalizedTitle}_${releaseDate}`;

          const content: Content = {
            categoryID: 'cat_2',
            title,
            description,
            releaseDate,
            genresTMDB: genres,
            rating,
            coverImage,
            source: 'TMDB',
            tmdbTVID,
            origin,
            id
          };

          await this.checkAndInsertShow(content);
        }

        if (onComplete) onComplete();
      },
      error: (err) => {
        console.error('Error en la solicitud TMDb', err);
      }
    });
  }


  fetchUpcomingShowsAndSave(onComplete?: () => void): void {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    const date = `${year}-${this.pad(month)}-${this.pad(day)}`;
    const url = `https://api.themoviedb.org/3/discover/tv?api_key=${this.apiKey}&language=es-ES&sort_by=popularity.desc&first_air_date.gte=${date}&page=1`;

    this.http.get<any>(url).subscribe({
      next: async (response) => {
        const results = response.results;

        for (const show of results) {
          const originalLanguage = show.original_language ?? '';
          const originCountries: string[] = show.origin_country ?? [];

          const isJapanese = originalLanguage === 'ja' || originCountries.includes('JP');
          if (isJapanese) {
            console.log(`Omitida serie japonesa: ${show.name}`);
            continue;
          }

          const tmdbTVID = show.id.toString();
          const title = show.name;
          const description = show.overview;
          const releaseDate = show.first_air_date;
          const posterPath = show.poster_path;
          const rating = show.vote_average?.toString() ?? '0.0';
          const coverImage = `https://image.tmdb.org/t/p/w500${posterPath}`;
          const origin = `upcoming_tv_${year}`;
          const genres: string[] = show.genre_ids?.map((id: number) => id.toString()) ?? [];

          const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
          const id = `${normalizedTitle}_${releaseDate}`;

          const content: Content = {
            categoryID: 'cat_2',
            title,
            description,
            releaseDate,
            genresTMDB: genres,
            rating,
            coverImage,
            source: 'TMDB',
            tmdbTVID,
            origin,
            id
          };

          await this.checkAndInsertShow(content);
        }

        if (onComplete) onComplete();
      },
      error: (err) => {
        console.error('Error en la solicitud TMDb', err);
      }
    });
  }



  private async checkAndInsertShow(content: Content): Promise<void> {
    if (!content.tmdbTVID) {
      console.warn(`tmdbTVID está vacío o undefined para el contenido:`, content);
      return;
    }

    const refPath = ref(this.db, 'content');
    const showQuery = query(refPath, orderByChild('tmdbTVID'), equalTo(content.tmdbTVID));

    const snapshot = await get(showQuery);
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
          JSON.stringify(existing.genresTMDB) !== JSON.stringify(content.genresTMDB);

        if (needsUpdate) {
          console.log(`Actualizando serie: ${content.title}`);
          set(childSnapshot.ref, content);
        } else {
          console.log(`Serie sin cambios: ${content.title}`);
        }
      }
    });

    if (!exists) {
      await this.insertShow(content);
      console.log(`Serie añadida: ${content.title}`);
    }
  }


  private async insertShow(content: Content): Promise<void> {
    const normalizedTitle = content.title?.toLowerCase().replace(/[^a-z0-9]/g, '');
    const releaseDate = content.releaseDate;
    const uniqueKey = `${normalizedTitle}_${releaseDate}`;
    content.id = uniqueKey;

    const newRef = ref(this.db, `content/${uniqueKey}`);

    const snapshot = await get(newRef);
    if (!snapshot.exists()) {
      await set(newRef, content);
      console.log(`Insertado: ${uniqueKey} con origin: ${content.origin}`);
    } else {
      console.log(`Contenido ya existe: ${uniqueKey}`);
    }
  }

}
