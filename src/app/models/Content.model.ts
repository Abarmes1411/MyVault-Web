import {UserReview} from './UserReview.model';

export class Content {
  // Comunes
  id: string | undefined;
  categoryID?: string;
  title?: string;
  description?: string;
  releaseDate?: string;
  coverImage?: string;
  rating?: string;
  source?: string;
  origin?: string;
  originalTitle?: string;
  userReviews?: UserReview[];

  // Películas
  tmdbID?: string;
  genresTMDB?: string[];

  // Series
  tmdbTVID?: string;
  genresTVTMDB?: string[];

  // Libros
  bookID?: string;
  publisher?: string;
  authors?: string[];
  isEbook?: boolean;
  saleability?: string;
  pages?: string;
  language?: string;
  retailPrice?: string;
  currency?: string;

  // Videojuegos
  gameID?: string;
  platforms?: string[];
  website?: string;
  genresGame?: string[];
  developers?: string[];
  added?: string;

  // Anime
  animeID?: string;
  episodes?: string;
  genresAnime?: string[];
  studios?: string[];

  // Manga / Novelas
  mangaID?: string;
  genresManga?: string[];
  popularity?: string;

  constructor(init?: Partial<Content>) {
    Object.assign(this, init);
  }

  // Constructor estático para películas o series
  static fromTMDB(data: {
    id: string;
    categoryID: string;
    title: string;
    description: string;
    releaseDate: string;
    genresTMDB?: string[];
    rating: string;
    coverImage: string;
    source: string;
    tmdbID?: string;
    tmdbTVID?: string;
  }): Content {
    return new Content(data);
  }

  // Constructor para libros
  static fromBook(data: {
    id: string;
    categoryID: string;
    title: string;
    description: string;
    releaseDate: string;
    coverImage: string;
    rating: string;
    source: string;
    origin: string;
    publisher: string;
    authors: string[];
    isEbook: boolean;
    saleability: string;
    pages: string;
    language: string;
    retailPrice: string;
    currency: string;
    bookID: string;
  }): Content {
    return new Content(data);
  }

  // Constructor para videojuegos
  static fromGame(data: {
    id: string;
    categoryID: string;
    title: string;
    description: string;
    releaseDate: string;
    rating: string;
    coverImage: string;
    source: string;
    platforms: string[];
    website: string;
    genresGame: string[];
    developers: string[];
    added: string;
    gameID: string;
  }): Content {
    return new Content(data);
  }

  // Constructor para anime
  static fromAnime(data: {
    id: string;
    categoryID: string;
    title: string;
    description: string;
    releaseDate: string;
    rating: string;
    coverImage: string;
    source: string;
    episodes: string;
    genresAnime: string[];
    studios: string[];
    animeID: string;
  }): Content {
    return new Content(data);
  }

  // Constructor para mangas o novelas ligeras
  static fromManga(data: {
    id: string;
    categoryID: string;
    title: string;
    originalTitle: string;
    description: string;
    releaseDate: string;
    rating: string;
    coverImage: string;
    source: string;
    genresManga: string[];
    popularity: string;
    mangaID: string;
  }): Content {
    return new Content(data);
  }

  // Constructor para búsquedas rápidas
  static fromSearch(data: {
    id: string;
    tmdbID: string;
    title: string;
    date: string;
    image: string;
    categoryID: string;
  }): Content {
    return new Content({
      id: data.id,
      tmdbID: data.tmdbID,
      title: data.title,
      releaseDate: data.date,
      coverImage: data.image,
      categoryID: data.categoryID
    });
  }
}
