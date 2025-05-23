import { Injectable } from '@angular/core';
import {equalTo, get, getDatabase, orderByChild, query, ref, set} from 'firebase/database';
import {initializeApp} from 'firebase/app';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Content} from '../models/Content.model';
import {push} from '@angular/fire/database';

@Injectable({
  providedIn: 'root'
})
export class GamesService {

  private firebaseApp = initializeApp(environment.firebaseConfig);
  private db = getDatabase(this.firebaseApp);
  private apiKey = 'bd8a21ccc892473cbb6c36919b2a9e56';

  constructor(private http: HttpClient) {}

  private pad(num: number): string {
    return num.toString().padStart(2, '0');
  }

  fetchRecentGamesAndSave(onComplete?: () => void): void {
    const now = new Date();
    const currentYear = now.getFullYear();

    const pastMonthDate = new Date(now);
    pastMonthDate.setMonth(now.getMonth() - 1);

    const startDate = `${pastMonthDate.getFullYear()}-${this.pad(pastMonthDate.getMonth() + 1)}-${this.pad(pastMonthDate.getDate())}`;
    const endDate = `${now.getFullYear()}-${this.pad(now.getMonth() + 1)}-${this.pad(now.getDate())}`;

    const urlRecent = `https://api.rawg.io/api/games?key=${this.apiKey}&dates=${startDate},${endDate}&ordering=-added&page_size=10`;

    this.http.get<any>(urlRecent).subscribe({
      next: (response) => {
        const results = response.results;

        results.forEach((game: any) => {
          const rawgID = game.id.toString();
          const detailUrl = `https://api.rawg.io/api/games/${rawgID}?key=${this.apiKey}`;

          this.http.get<any>(detailUrl).subscribe({
            next: async (detailResponse) => {
              const title = detailResponse.name ?? 'Sin título';
              const description = detailResponse.description_raw ?? 'Sin descripción';
              const releaseDate = detailResponse.released ?? 'Desconocida';
              const rating = detailResponse.rating?.toString() ?? '0.0';
              const added = detailResponse.added ?? 'Desconocida';
              const coverImage = detailResponse.background_image ?? '';
              const website = detailResponse.website ?? 'Sin sitio web';


              const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
              const yearSuffix = releaseDate.slice(2, 4);
              const id = `${normalizedTitle}_${yearSuffix}`;

              const platforms: string[] = [];
              if (detailResponse.platforms) {
                detailResponse.platforms.forEach((p: any) => {
                  if (p.platform?.name) platforms.push(p.platform.name);
                });
              }

              const genresGame: string[] = [];
              if (detailResponse.genresGame) {
                detailResponse.genresGame.forEach((g: any) => {
                  if (g.name) genresGame.push(g.name);
                });
              }

              const developers: string[] = [];
              if (detailResponse.developers) {
                detailResponse.developers.forEach((d: any) => {
                  if (d.name) developers.push(d.name);
                });
              }

              const origin = `recent_game_${currentYear}`;

              const content: Content = {
                categoryID: 'cat_3',
                title,
                description,
                releaseDate,
                rating,
                coverImage,
                source: 'RAWG',
                platforms,
                website,
                genresGame,
                developers,
                added,
                gameID: rawgID.toString(),
                origin,
                id,
              };

              await this.insertGame(content);
              console.log('Juego reciente añadido:', title);
            },
            error: (detailError) => {
              console.error('Error solicitando detalles del juego:', detailError);
            }
          });
        });

        if (onComplete) onComplete();
      },
      error: (error) => {
        console.error('Error en la solicitud RAWG:', error);
        if (onComplete) onComplete();
      }
    });
  }

  fetchPopularGamesAndSave(onComplete?: () => void): void {
    const now = new Date();
    const currentYear = now.getFullYear();

    // Fecha inicio: 1 de enero del año actual
    const startDate = `${currentYear}-01-01`;

    // Fecha hoy
    const endDate = `${now.getFullYear()}-${this.pad(now.getMonth() + 1)}-${this.pad(now.getDate())}`;

    const urlPopular = `https://api.rawg.io/api/games?key=${this.apiKey}&dates=${startDate},${endDate}&ordering=-rating&page_size=10`;

    this.http.get<any>(urlPopular).subscribe({
      next: (response) => {
        const results = response.results;

        results.forEach((game: any) => {
          const rawgID = game.id.toString();
          const detailUrl = `https://api.rawg.io/api/games/${rawgID}?key=${this.apiKey}`;

          this.http.get<any>(detailUrl).subscribe({
            next: async (detailResponse) => {
              const title = detailResponse.name ?? 'Sin título';
              const description = detailResponse.description_raw ?? 'Sin descripción';
              const releaseDate = detailResponse.released ?? 'Desconocida';
              const rating = detailResponse.rating?.toString() ?? '0.0';
              const added = detailResponse.added ?? 'Desconocida';
              const coverImage = detailResponse.background_image ?? '';
              const website = detailResponse.website ?? 'Sin sitio web';

              // Plataformas
              const platforms: string[] = [];
              if (detailResponse.platforms) {
                detailResponse.platforms.forEach((p: any) => {
                  if (p.platform?.name) platforms.push(p.platform.name);
                });
              }

              // Géneros
              const genresGame: string[] = [];
              if (detailResponse.genresGame) {
                detailResponse.genresGame.forEach((g: any) => {
                  if (g.name) genresGame.push(g.name);
                });
              }

              // Developers
              const developers: string[] = [];
              if (detailResponse.developers) {
                detailResponse.developers.forEach((d: any) => {
                  if (d.name) developers.push(d.name);
                });
              }

              // Normalizar título para ID único
              const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
              const uniqueKey = `${normalizedTitle}_${releaseDate}`;

              // Origen con año para prioridad
              const origin = `popular_game_${currentYear}`;

              const content: Content = {
                categoryID: 'cat_3',
                title,
                description,
                releaseDate,
                rating,
                coverImage,
                source: 'RAWG',
                platforms,
                website,
                genresGame,
                developers,
                added,
                gameID: rawgID,
                origin,
                id: uniqueKey,
              };

              await this.insertGame(content);
              console.log('Juego popular añadido:', title);
            },
            error: (detailError) => {
              console.error('Error solicitando detalles del juego:', detailError);
            }
          });
        });

        if (onComplete) onComplete();
      },
      error: (error) => {
        console.error('Error en la solicitud RAWG:', error);
        if (onComplete) onComplete();
      }
    });
  }


  fetchUpcomingGamesAndSave(onComplete?: () => void): void {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();

    // Fecha inicio (hoy)
    const startDate = `${year}-${this.pad(month + 1)}-${this.pad(day)}`;

    // Fecha fin (un mes después)
    const futureDate = new Date(now);
    futureDate.setMonth(month + 1);

    // Ajustar día si el día del mes excede el máximo en el mes futuro
    const maxDay = new Date(futureDate.getFullYear(), futureDate.getMonth() + 1, 0).getDate();
    const futureDay = day > maxDay ? maxDay : day;

    const endDate = `${futureDate.getFullYear()}-${this.pad(futureDate.getMonth() + 1)}-${this.pad(futureDay)}`;

    const urlUpcoming = `https://api.rawg.io/api/games?key=${this.apiKey}&dates=${startDate},${endDate}&ordering=-added&page_size=10`;

    this.http.get<any>(urlUpcoming).subscribe({
      next: (response) => {
        const results = response.results;

        results.forEach((game: any) => {
          const rawgID = game.id.toString();
          const detailUrl = `https://api.rawg.io/api/games/${rawgID}?key=${this.apiKey}`;

          this.http.get<any>(detailUrl).subscribe({
            next: async (detailResponse) => {
              const title = detailResponse.name ?? 'Sin título';
              const description = detailResponse.description_raw ?? 'Sin descripción';
              const releaseDate = detailResponse.released ?? 'Desconocida';
              const rating = detailResponse.rating?.toString() ?? '0.0';
              const added = detailResponse.added ?? 'Desconocida';
              const coverImage = detailResponse.background_image ?? '';
              const website = detailResponse.website ?? '';

              const platforms: string[] = [];
              if (detailResponse.platforms) {
                detailResponse.platforms.forEach((p: any) => {
                  if (p.platform?.name) platforms.push(p.platform.name);
                });
              }

              const genres: string[] = [];
              if (detailResponse.genres) {
                detailResponse.genres.forEach((g: any) => {
                  if (g.name) genres.push(g.name);
                });
              }

              const developers: string[] = [];
              if (detailResponse.developers) {
                detailResponse.developers.forEach((d: any) => {
                  if (d.name) developers.push(d.name);
                });
              }

              const origin = `upcoming_game_${year}`;

              const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
              const yearSuffix = releaseDate.slice(2, 4);
              const id = `${normalizedTitle}_${yearSuffix}`;

              const content: Content = {
                categoryID: 'cat_3',
                title,
                description,
                releaseDate,
                rating,
                coverImage,
                source: 'RAWG',
                platforms,
                website,
                genresGame: genres,
                developers,
                added,
                gameID: rawgID,
                origin,
                id
              };

              await this.insertGame(content);
              console.log('Juego próximo añadido:', title);
            },
            error: (detailError) => {
              console.error('Error solicitando detalles del juego:', detailError);
            }
          });
        });

        if (onComplete) onComplete();
      },
      error: (error) => {
        console.error('Error en la solicitud RAWG:', error);
        if (onComplete) onComplete();
      }
    });
  }




  private async insertGame(content: Content): Promise<string | null> {
    const baseTitle = content.title;
    if (!baseTitle) {
      console.error('El título es nulo o vacío. No se puede insertar.');
      return null;
    }

    const normalizedTitle = baseTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
    const releaseDate = content.releaseDate ?? 'unknown';
    const uniqueKey = `${normalizedTitle}_${releaseDate}`;

    content.id = uniqueKey;

    const reference = ref(this.db, `content/${uniqueKey}`);

    try {
      const snapshot = await get(reference);

      if (!snapshot.exists()) {
        // No existe: insertar nuevo contenido
        await set(reference, content);
        console.log(`Insertado: ${uniqueKey} con origin: ${content.origin}`);
      } else {
        const existing: Content | null = snapshot.val();

        if (existing?.origin) {
          const existingPriority = this.getOriginGamePriority(existing.origin);
          const newPriority = this.getOriginGamePriority(content.origin ?? '');

          if (newPriority < existingPriority) {
            await set(reference, content);
            console.log(`Sobrescrito por: ${content.origin}`);
          } else {
            console.log(`No sobrescrito, origin existente con mayor o igual prioridad: ${existing.origin}`);
          }
        } else {
          // Si no hay origin en el existente, sobrescribir
          await set(reference, content);
          console.log(`Sobrescrito (origin desconocido): ${content.origin}`);
        }
      }

      return uniqueKey;

    } catch (error) {
      console.error('Error al comprobar existencia o insertar:', error);
      return null;
    }
  }


  private getOriginGamePriority(origin: string): number {
    if (origin.startsWith('recent')) return 0;
    if (origin.startsWith('popular')) return 1;
    if (origin.startsWith('upcoming')) return 2;
    return 99;
  }

}
