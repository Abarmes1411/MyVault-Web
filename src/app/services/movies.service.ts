import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, query, orderByChild, equalTo, onValue } from 'firebase/database';
import {Content} from '../models/Content.model';
import {environment} from '../../environments/environment';
import {push} from "@angular/fire/database";

@Injectable({
  providedIn: 'root'
})
export class MoviesService {
  private firebaseApp = initializeApp(environment.firebaseConfig);
  private db = getDatabase(this.firebaseApp);
  private apiKey = '87bb7efee694a2a79d9514b2c909e544';

  constructor(private http: HttpClient) {}


  private async insertMovie(content: Content): Promise<string | undefined> {
    if (!content.title) {
      console.warn('El título es undefined');
    }else{

    }

    const contentRef = ref(this.db, `content/${content.id}`);
    await set(contentRef, content);
    console.log(`Contenido insertado correctamente con ID: ${content.id}`);


    return content.id;
  }

  private pad(num: number): string {
    return num.toString().padStart(2, '0');
  }



  fetchRecentMoviesAndSave(onComplete?: () => void): void {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    const startDate = `${year}-${this.pad(month)}-01`;
    const endDate = `${year}-${this.pad(month)}-${this.pad(day)}`;

    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${this.apiKey}&language=es-ES&region=ES&sort_by=popularity.desc&primary_release_date.gte=${startDate}&primary_release_date.lte=${endDate}&vote_count.gte=20&page=1`;

    this.http.get<any>(url).subscribe({
      next: async (response) => {
        const results = response.results;

        for (const movie of results) {
          const tmdbID = movie.id.toString();
          const title = movie.title;
          const description = movie.overview;
          const releaseDate = movie.release_date;
          const posterPath = movie.poster_path;
          const rating = movie.vote_average?.toString() ?? "0.0";
          const coverImage = `https://image.tmdb.org/t/p/w500${posterPath}`;
          const origin = `recent_${year}`;
          const genres: string[] = movie.genre_ids?.map((id: number) => id.toString()) ?? [];

          const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
          const yearSuffix = releaseDate.slice(2, 4);
          const id = `${normalizedTitle}_${yearSuffix}`;

          const content: Content = {
            categoryID: 'cat_1',
            title,
            description,
            releaseDate,
            genresTMDB: genres,
            rating,
            coverImage,
            source: 'TMDB',
            tmdbID,
            origin,
            id
          };


          await this.checkAndInsertMovie(content);
        }

        if (onComplete) onComplete();
      },
      error: (err) => {
        console.error('Error en la solicitud TMDb', err);
      }
    });
  }


  fetchPopularMoviesAndSave(onComplete?: () => void): void {
    const year = new Date().getFullYear();

    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${this.apiKey}&language=es-ES&page=1`;

    this.http.get<any>(url).subscribe({
      next: async (response) => {
        const results = response.results;

        for (const movie of results) {
          const tmdbID = movie.id.toString();
          const title = movie.title;
          const description = movie.overview;
          const releaseDate = movie.release_date;
          const posterPath = movie.poster_path;
          const rating = movie.vote_average?.toString() ?? "0.0";
          const coverImage = `https://image.tmdb.org/t/p/w500${posterPath}`;
          const genres: string[] = movie.genre_ids?.map((id: number) => id.toString()) ?? [];

          const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
          const yearSuffix = releaseDate.slice(2, 4);
          const id = `${normalizedTitle}_${yearSuffix}`;

          const content: Content = {
            categoryID: 'cat_1',
            title,
            description,
            releaseDate,
            genresTMDB: genres,
            rating,
            coverImage,
            source: 'TMDB',
            tmdbID,
            origin: `popular_${year}`,
            id
          };

          await this.checkAndInsertMovie(content);
        }

        if (onComplete) onComplete();
      },
      error: (err) => {
        console.error('Error al obtener películas populares de TMDb', err);
      }
    });
  }

  fetchUpcomingMoviesAndSave(onComplete?: () => void): void {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();

    // Fecha de inicio: hoy
    const startDate = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

    // Fecha de fin: mismo día del mes siguiente (ajustando si no existe ese día)
    const future = new Date(now);
    future.setMonth(future.getMonth() + 1);
    const maxDay = new Date(future.getFullYear(), future.getMonth() + 1, 0).getDate();
    const endDay = Math.min(day, maxDay);
    const endDate = `${future.getFullYear()}-${(future.getMonth() + 1).toString().padStart(2, '0')}-${endDay.toString().padStart(2, '0')}`;

    const url = `https://api.themoviedb.org/3/movie/upcoming?api_key=${this.apiKey}&language=es-ES&region=ES&sort_by=popularity.desc&primary_release_date.gte=${startDate}&primary_release_date.lte=${endDate}&vote_count.gte=20&page=1`;

    this.http.get<any>(url).subscribe({
      next: async (response) => {
        const results = response.results;

        for (const movie of results) {
          const tmdbID = movie.id.toString();
          const title = movie.title;
          const description = movie.overview;
          const releaseDate = movie.release_date;
          const posterPath = movie.poster_path;
          const rating = movie.vote_average?.toString() ?? "0.0";
          const coverImage = `https://image.tmdb.org/t/p/w500${posterPath}`;
          const genres: string[] = movie.genre_ids?.map((id: number) => id.toString()) ?? [];

          const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
          const yearSuffix = releaseDate.slice(2, 4);
          const id = `${normalizedTitle}_${yearSuffix}`;

          const content: Content = {
            categoryID: 'cat_1',
            title,
            description,
            releaseDate,
            genresTMDB: genres,
            rating,
            coverImage,
            source: 'TMDB',
            tmdbID,
            origin: `upcoming_${year}`,
            id
          };

          await this.checkAndInsertMovie(content);
        }

        if (onComplete) onComplete();
      },
      error: (err) => {
        console.error('Error al obtener películas próximas de TMDb', err);
      }
    });
  }



  private async checkAndInsertMovie(content: Content): Promise<void> {
    const refPath = ref(this.db, 'content');
    const movieQuery = query(refPath, orderByChild('tmdbID'), equalTo(content.tmdbID!));

    const snapshot = await get(movieQuery);
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
          console.log(`Actualizando película: ${content.title}`);
          set(childSnapshot.ref, content);
        } else {
          console.log(`Película sin cambios: ${content.title}`);
        }
      }
    });

    if (!exists) {
      await this.insertMovie(content);
      console.log(`Película añadida: ${content.title}`);
    }
  }


}
