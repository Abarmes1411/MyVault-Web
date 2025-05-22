import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, query, orderByChild, equalTo, onValue } from 'firebase/database';
import {Content} from '../models/Content.model';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MoviesService {
  private firebaseApp = initializeApp(environment.firebaseConfig);
  private db = getDatabase(this.firebaseApp);
  private apiKey = '87bb7efee694a2a79d9514b2c909e544';

  constructor(private http: HttpClient) {}

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
            id: ''
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

  private async insertMovie(content: Content): Promise<string> {
    if (!content.title) {
      console.warn('El título es undefined');
    }else{

    }
    const normalizedTitle = content.title!.toLowerCase().replace(/[^a-z0-9]/g, '');
    const releaseDate = content.releaseDate;
    const uniqueKey = `${normalizedTitle}_${releaseDate![2]}${releaseDate![3]}`;
    content.id = uniqueKey;

    const contentRef = ref(this.db, `content/${uniqueKey}`);
    await set(contentRef, content);
    console.log(`Contenido insertado correctamente con ID: ${content.id}`);

    return uniqueKey;
  }

  private pad(num: number): string {
    return num.toString().padStart(2, '0');
  }
}
