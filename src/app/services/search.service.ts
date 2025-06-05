import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {lastValueFrom, map, Observable} from 'rxjs';
import {Content} from '../models/Content.model';
import {Categories} from '../models/Category.model';
import {Database, ref, set} from '@angular/fire/database';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private readonly TMDB_API_KEY = '87bb7efee694a2a79d9514b2c909e544';
  private readonly RAWG_API_KEY = 'bd8a21ccc892473cbb6c36919b2a9e56';

  constructor(private http: HttpClient, private db:Database) {}


  async insertContent(content: Content): Promise<string | undefined> {
    // 1. Escoger título base
    let baseTitle = content.title;
    if (!baseTitle || baseTitle.toLowerCase() === 'null') {
      baseTitle = content.originalTitle;
      content.title = baseTitle;
    }

    // 2. Normalizar el título
    const normalizedTitle = baseTitle!.toLowerCase().replace(/[^a-z0-9]/g, '');

    // 3. Formatear la fecha según categoría
    let uniqueKey = '';
    const releaseDate = content.releaseDate || '0000-00-00';

    if (content.categoryID === 'cat_1') {
      // Películas → dos últimos dígitos del año
      const yearSuffix = releaseDate.slice(2, 4) || 'xx'; // ej: 2023 → 23
      uniqueKey = `${normalizedTitle}_${yearSuffix}`;
    } else {
      // Resto → fecha completa
      uniqueKey = `${normalizedTitle}_${releaseDate}`;
    }

    // 4. Asignar ID e insertar en Firebase
    content.id = uniqueKey;
    const contentRef = ref(this.db, `content/${uniqueKey}`);
    await set(contentRef, content);

    console.log(`Contenido insertado correctamente con ID: ${uniqueKey}`);
    return uniqueKey;
  }




  searchMinimal(query: string, category: Categories | undefined): Observable<Content[]> {
    switch (category) {
      case Categories.PELICULAS:
        return this.buscarEnTMDb(query, 'movie');
      case Categories.SERIES:
        return this.buscarEnTMDb(query, 'tv');
      case Categories.VIDEOJUEGOS:
        return this.buscarEnRAWG(query);
      case Categories.ANIME:
        return this.buscarEnAniList(query, 'ANIME');
      case Categories.MANGAS:
        return this.buscarEnAniList(query, 'MANGA');
      case Categories.NOVELAS_LIGERAS:
        return this.buscarEnAniList(query, 'MANGA', 'NOVEL');
      default:
        return new Observable();
    }
  }

  async fetchDetails(content: Content): Promise<Content> {
    switch (content.categoryID) {
      case 'cat_1':
        return await this.obtenerDetallesTMDb(content, 'movie');
      case 'cat_2':
        return await this.obtenerDetallesTMDb(content, 'tv');
      case 'cat_3':
        return await this.obtenerDetallesRAWG(content);
      case 'cat_4':
      case 'cat_5':
      case 'cat_6':
        return await this.obtenerDetallesAniList(content);
      default:
        throw new Error('Categoría desconocida');
    }
  }

  private buscarEnTMDb(query: string, type: string): Observable<Content[]> {
    const url = `https://api.themoviedb.org/3/search/${type}?api_key=87bb7efee694a2a79d9514b2c909e544&language=es-ES&query=${encodeURIComponent(query)}`;
    return this.http.get<any>(url).pipe(
      map(response => {
        return response.results
          .filter((item: any) => {
            const isJapanese = item.original_language === 'ja' ||
              (item.origin_country || []).includes('JP');
            return !isJapanese;
          })
          .map((item: any) => {
            const id = item.id.toString();
            const title = item.title || item.name || '';
            const date = item.release_date || item.first_air_date || '';
            const image = `https://image.tmdb.org/t/p/w500${item.poster_path || ''}`;
            const cat = type === 'movie' ? Categories.PELICULAS : Categories.SERIES;
            return { id, title, date, image, categoryID: cat } as Content;
          });
      })
    );
  }

  private buscarEnRAWG(query: string): Observable<Content[]> {
    const url = `https://api.rawg.io/api/games?key=bd8a21ccc892473cbb6c36919b2a9e56&search=${encodeURIComponent(query)}`;
    return this.http.get<any>(url).pipe(
      map(response => {
        return response.results.map((item: any) => {
          return {
            id: item.id.toString(),
            title: item.name,
            date: item.released || '',
            image: item.background_image || '',
            categoryID: Categories.VIDEOJUEGOS
          } as Content;
        });
      })
    );
  }

  private buscarEnAniList(query: string, mediaType: string, format?: string): Observable<Content[]> {
    const graphql = `
      query ($search: String) {
        Page(perPage: 20) {
          media(search: $search, type: ${mediaType}${format ? `, format: ${format}` : ''}) {
            id
            title { romaji }
            startDate { year month day }
            coverImage { large }
            siteUrl
            isAdult
          }
        }
      }
    `;
    const variables = { search: query };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<any>('https://graphql.anilist.co', {
      query: graphql,
      variables
    }, { headers }).pipe(
      map(response => {
        return response.data.Page.media
          .filter((item: any) => !item.isAdult)
          .map((item: any) => {
            const date = `${item.startDate.year || 0}-${item.startDate.month || 0}-${item.startDate.day || 0}`;
            const cat = mediaType === 'ANIME'
              ? Categories.ANIME
              : format === 'NOVEL'
                ? Categories.NOVELAS_LIGERAS
                : Categories.MANGAS;
            return {
              id: item.id.toString(),
              title: item.title.romaji || 'Sin título',
              date,
              image: item.coverImage.large,
              categoryID: cat
            } as Content;
          });
      })
    );
  }



  private async obtenerDetallesTMDb(content: Content, type: 'movie' | 'tv'): Promise<Content> {
    const url = `https://api.themoviedb.org/3/${type}/${content.id}?api_key=${this.TMDB_API_KEY}&language=es-ES`;
    const res: any = await lastValueFrom(this.http.get(url));

    const title = res.title || res.name || 'Sin título';
    const description = res.overview || 'Sin descripción';
    const releaseDate = res.release_date || res.first_air_date || '';
    const posterPath = res.poster_path;
    const rating = res.vote_average?.toString() ?? '0.0';
    const coverImage = posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : '';

    const genres = res.genres?.map((g: any) => g.name) ?? [];

    return {
      ...content,
      title,
      description,
      releaseDate,
      rating,
      coverImage,
      ...(type === 'movie'
        ? {
          genresTMDB: genres,
          tmdbID: content.id
        }
        : {
          genresTVTMDB: genres,
          tmdbTVID: content.id
        }),
      source: 'TMDB'
    };
  }


  private async obtenerDetallesRAWG(content: Content): Promise<Content> {
    const url = `https://api.rawg.io/api/games/${content.id}?key=${this.RAWG_API_KEY}`;
    const res: any = await lastValueFrom(this.http.get(url));

    const rawgID = res.id.toString();
    const title = res.name;
    const description = res.description_raw ?? 'Sin descripción';
    const releaseDate = res.released ?? 'Desconocida';
    const rating = res.rating?.toString() ?? '0.0';
    const coverImage = res.background_image ?? '';
    const website = res.website ?? 'Sin sitio web';
    const added = res.added?.toString() ?? 'Desconocido';

    const platforms = res.platforms?.map((p: any) => p.platform.name) ?? [];
    const genresGame = res.genresGame?.map((g: any) => g.name) ?? [];
    const developers = res.developers?.map((d: any) => d.name) ?? [];

    return {
      ...content,
      title,
      description,
      releaseDate,
      rating,
      coverImage,
      website,
      added,
      source: 'RAWG',
      platforms,
      genresGame,
      developers,
      gameID: rawgID,
    };
  }

  async obtenerDetallesAniList(content: Content): Promise<Content> {
    const isAnime = content.categoryID === 'cat_4';
    const mediaType = isAnime ? 'ANIME' : 'MANGA';

    const query = `
    query ($id: Int) {
      Media(id: $id, type: ${mediaType}) {
        id
        title { romaji english native }
        startDate { year month day }
        description
        coverImage { large }
        siteUrl
        genres
        averageScore
        episodes
        chapters
        volumes
        format
        popularity
        ${isAnime ? 'studios { nodes { name } }' : ''}
      }
    }
  `;

    const variables = { id: Number(content.id) };

    const body = {
      query: query,
      variables: variables
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    try {
      const res: any = await lastValueFrom(
        this.http.post('https://graphql.anilist.co', body, { headers })
      );

      const media = res.data.Media;
      const title = media.title.english || media.title.romaji || 'Sin título';
      const originalTitle = media.title.romaji || 'Sin título original';

      const year = media.startDate?.year || 0;
      const month = media.startDate?.month || 0;
      const day = media.startDate?.day || 0;
      const releaseDate = `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

      const image = media.coverImage?.large || '';
      const description = (media.description || '').replace(/<[^>]*>/g, '');
      const rating = media.averageScore?.toString() || '0';
      const popularity = media.popularity?.toString() || '0';
      const episodes = media.episodes?.toString() || '';
      const format = media.format || '';

      const genres = media.genres || [];
      const studios = isAnime && media.studios?.nodes?.map((n: any) => n.name) || [];

      if (isAnime) {
        return {
          ...content,
          title,
          description,
          releaseDate,
          rating,
          coverImage: image,
          genresAnime: genres,
          source: 'AniList',
          animeID: content.id,
          developers: studios,
          added: episodes
        };
      } else {
        const category = format.toUpperCase() === 'NOVEL' ? 'cat_6' : 'cat_5';
        return {
          ...content,
          categoryID: category,
          title,
          description,
          releaseDate,
          rating,
          coverImage: image,
          genresManga: genres,
          source: 'AniList',
          mangaID: content.id,
          developers: [originalTitle],
          added: popularity
        };
      }

    } catch (error) {
      console.error('Error al obtener detalles de AniList', error);
      throw error;
    }
  }



}
