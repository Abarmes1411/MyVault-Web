import {Component, OnInit} from '@angular/core';
import {Content} from '../../models/Content.model';
import {ActivatedRoute} from '@angular/router';
import {DetailContentsService} from '../../services/detail-contents.service';
import {DecimalPipe, NgClass, NgForOf, NgIf, NgSwitch, NgSwitchCase} from '@angular/common';
import {AuthService} from '../../services/auth.service';
import {Database, get, ref, update} from '@angular/fire/database';
import {SelectListModalComponent} from '../../components/select-list-modal/select-list-modal.component';
import {
  UserreviewsDetailcontentResumeComponent
} from '../../components/userreviews-detailcontent-resume/userreviews-detailcontent-resume.component';
import {FormsModule} from '@angular/forms';
import {UserReview} from '../../models/UserReview.model';

@Component({
  selector: 'app-detail-content',
  imports: [
    NgSwitchCase,
    NgSwitch,
    NgIf,
    SelectListModalComponent,
    NgForOf,
    DecimalPipe,
    UserreviewsDetailcontentResumeComponent,
    FormsModule,
    NgClass,
  ],
  templateUrl: './detail-content.component.html',
  styleUrl: './detail-content.component.css'
})
export class DetailContentComponent implements OnInit {
  content: Content | null = null;
  vaultStatus: 'idle' | 'checking' | 'exists' | 'added' = 'idle';
  listStatus: 'idle' | 'checking' | 'exists' | 'added' = 'idle';
  selectedContentId: string | null = null;
  userLists: string[] = [];
  showListModal = false;
  showOriginalRating = false;
  userReviews: any[] = [];
  showReviewModal = false;
  canReview = false;
  userID = '';
  newReview = new UserReview('', '', 0, '', '');
  reviewWarningMessage: string = '';
  summaryAI: string = '';
  summaryLoading: boolean = false;
  summaryError: string = '';


  constructor(
    private route: ActivatedRoute,
    private contentService: DetailContentsService,
    private authService: AuthService,
    private db:Database,
  ) {}

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    this.userID = (await this.authService.getUserId())!;

    if (id && this.userID) {
      this.content = await this.contentService.getContentById(id);
      this.contentService.selectedContentId = id;

      const rawDescription = this.content?.description || '';
      const cleanDesc = this.cleanDescription(rawDescription);

      if (cleanDesc.length > 20 && this.isEnglish(cleanDesc)) {
        try {
          const translated = await this.translateDescription(cleanDesc);
          this.content!.description = translated;
           await update(ref(this.db, `content/${id}`), { description: translated });
        } catch (err) {
          this.content!.description = cleanDesc || 'Sinopsis no disponible';
          console.error('Error al traducir descripción:', err);
        }
      } else {
        this.content!.description = cleanDesc || 'Sinopsis no disponible';
      }

      await this.checkIfUserCanReview(id);
      await this.loadUserReviews(id);

      await this.loadSummary(id);
    }
  }

  async loadSummary(contentId: string): Promise<void> {
    this.summaryLoading = true;
    this.summaryError = '';
    this.summaryAI = '';

    try {
      // Lee resumen guardado en Firebase
      const summarySnap = await get(ref(this.db, `content/${contentId}/summaryAI`));
      if (summarySnap.exists()) {
        this.summaryAI = summarySnap.val();
      } else {
        this.summaryAI = 'No hay resumen disponible.';
      }

      // Llamar a servicio para actualizar el resumen solo si hay 3 reseñas nuevas
      await this.contentService.callGenerateSummary(contentId);

      // Tras la generación, se recarga un resumen actualizado
      const updatedSummarySnap = await get(ref(this.db, `content/${contentId}/summaryAI`));
      if (updatedSummarySnap.exists()) {
        this.summaryAI = updatedSummarySnap.val();
      }
    } catch (error) {
      console.error('Error cargando resumen IA:', error);
      this.summaryError = 'No se pudo cargar el resumen de IA.';
    } finally {
      this.summaryLoading = false;
    }
  }

  async checkIfUserCanReview(contentId: string): Promise<void> {
    const hasReviewed = await this.contentService.hasUserReviewed(contentId, this.userID);

    const releaseDate = new Date(this.content?.releaseDate || '');
    const now = new Date();
    const alreadyReleased = releaseDate <= now;

    if (hasReviewed) {
      this.reviewWarningMessage = 'Ya has hecho una reseña para este contenido.';
    } else if (!alreadyReleased) {
      this.reviewWarningMessage = 'Este contenido aún no se ha estrenado. No puedes hacer una reseña todavía.';
    } else {
      this.reviewWarningMessage = '';
    }

    this.canReview = !hasReviewed && alreadyReleased;
  }


  getContentDatabaseId(content: Content): string {
    return (
      content.tmdbID ||
      content.tmdbTVID ||
      content.gameID ||
      content.mangaID ||
      content.animeID || ''
    );
  }


  openReviewModal(): void {
    const dbId = this.getContentDatabaseId(this.content!);

    this.newReview = new UserReview(
      dbId,
      this.userID,
      0,
      '',
      new Date().toISOString().split('T')[0]
    );
    this.showReviewModal = true;
  }


  closeReviewModal(): void {
    this.showReviewModal = false;
  }

  async submitReview(): Promise<void> {
    if (!this.content?.id || !this.userID) return;

    try {
      await this.contentService.createUserReview(this.content.id, this.newReview);
      this.canReview = false;
      this.closeReviewModal();
    } catch (err) {
      console.error('Error al enviar la reseña:', err);
    }
  }

  async loadUserReviews(contentId: string): Promise<void> {
    const reviewsRef = ref(this.db, `content/${contentId}/userReviews/`);
    const snapshot = await get(reviewsRef);

    const reviews: any[] = [];

    if (snapshot.exists()) {
      const reviewsObj = snapshot.val();

      for (const key in reviewsObj) {
        const review = reviewsObj[key];
        const userID = review.userID;


        const userSnapshot = await get(ref(this.db, `users/${userID}/username`));
        const username = userSnapshot.exists() ? userSnapshot.val() : 'Anónimo';

        reviews.push({
          ...review,
          username
        });
      }
    }

    this.userReviews = reviews;
  }

  async loadContent(id: string): Promise<void> {
    this.content = await this.contentService.getContentById(id);
  }


  cleanDescription(raw: string): string {
    if (!raw) return '';
    const tmp = document.createElement("DIV");
    tmp.innerHTML = raw;
    return tmp.textContent?.trim() || '';
  }

  isEnglish(text: string): boolean {
    const lower = text.toLowerCase();
    return (
      lower.includes('the ') ||
      lower.includes('is ') ||
      lower.includes('with ') ||
      lower.includes('a ') ||
      lower.includes('in ')
    );
  }


  async translateDescription(text: string): Promise<string> {
    const response = await fetch('https://us-central1-myvault-cf31b.cloudfunctions.net/translateText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) throw new Error('Error al traducir');

    const data = await response.json();
    return data.translated;
  }




  toggleOriginalRating(): void {
    this.showOriginalRating = !this.showOriginalRating;
  }


  async addToVault(contentId: string | undefined): Promise<void> {
    if (!contentId) {
      console.error('El contentId es undefined.');
      this.vaultStatus = 'idle';
      return;
    }

    this.vaultStatus = 'checking';
    const userId = await this.authService.getUserId();

    if (!userId) {
      console.error('No hay usuario autenticado.');
      this.vaultStatus = 'idle';
      return;
    }

    const result = await this.contentService.addToVault(userId, contentId);



    this.vaultStatus = result;
    setTimeout(() => this.vaultStatus = 'idle', 3000);
  }

  async openListSelector(contentId: string | undefined) {
    if (!contentId) {
      console.error('El contentId es undefined.');
      this.listStatus = 'idle';
      return;
    }

    this.selectedContentId = contentId;
    this.listStatus = 'checking';

    const userId = await this.authService.getUserId();
    const listsRef = ref(this.db, `users/${userId}/customLists`);
    const snapshot = await get(listsRef);
    const lists = snapshot.val();

    if (!lists) {
      this.listStatus = 'idle';
      return;
    }

    this.userLists = Object.keys(lists);
    this.showListModal = true;
  }


  async confirmAddToList(listName: string) {
    const userId = await this.authService.getUserId();
    const contentId = this.selectedContentId;

    if (!userId || !contentId) return;

    const result = await this.contentService.addToListInSpecificList(userId, contentId, listName);
    this.listStatus = result;
    this.showListModal = false;
    setTimeout(() => this.listStatus = 'idle', 3000);
  }

  cancelListModal() {
    this.showListModal = false;
    this.listStatus = 'idle';
  }

  getUserReviewAverage(): number {
    if (!this.content?.userReviews) return 0;
    const reviews = Object.values(this.content.userReviews);
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0);
    return total / reviews.length;
  }

  getStars(rating: number): string[] {
    const stars: string[] = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push('assets/stars/full_star.PNG');
      } else if (rating >= i - 0.5) {
        stars.push('assets/stars/half_star.PNG');
      } else {
        stars.push('assets/stars/empty_star.png');
      }
    }
    return stars;
  }


  getFormattedRating(): number {
    if (!this.content || this.content.rating == null || !this.content.categoryID) return 0;

    const rating = +this.content.rating;
    const cat = this.content.categoryID;

    if (cat === 'cat_1' || cat === 'cat_2') {
      // TMDB: escala de 0 a 10
      return Math.round((rating / 10) * 5 * 10) / 10;
    } else if (cat === 'cat_3') {
      // RAWG: ya está en escala de 0 a 5
      return Math.round(rating * 10) / 10;
    } else if (cat === 'cat_4' || cat === 'cat_5' || cat === 'cat_6') {
      // AniList: escala de 0 a 100
      return Math.round((rating / 100) * 5 * 10) / 10;
    }

    return 0;
  }


  getCategoryName(catID: string | undefined): string {
    const map: { [key: string]: string } = {
      'cat_1': 'Película',
      'cat_2': 'Serie',
      'cat_3': 'Videojuego',
      'cat_4': 'Anime',
      'cat_5': 'Manga',
      'cat_6': 'Novela Ligera'
    };
    return catID && map[catID] ? map[catID] : 'Desconocida';
  }

  genreMapTMDB: { [key: string]: string } = {
    "28": "Acción",
    "12": "Aventura",
    "16": "Animación",
    "35": "Comedia",
    "80": "Crimen",
    "99": "Documental",
    "18": "Drama",
    "10751": "Familiar",
    "14": "Fantasía",
    "36": "Historia",
    "27": "Terror",
    "10402": "Música",
    "9648": "Misterio",
    "10749": "Romance",
    "878": "Ciencia Ficción",
    "10770": "Película de TV",
    "53": "Suspense",
    "10752": "Bélica",
    "37": "Western"
  };

  genreMapTVTMDB: { [key: string]: string } = {
    "10759": "Acción y Aventura",
    "16": "Animación",
    "35": "Comedia",
    "80": "Crimen",
    "99": "Documental",
    "18": "Drama",
    "10751": "Familiar",
    "10762": "Infantil",
    "9648": "Misterio",
    "10763": "Noticias",
    "10764": "Reality",
    "10765": "Ciencia Ficción y Fantasía",
    "10766": "Telenovela",
    "10767": "Talk Show",
    "10768": "Política y Guerra",
    "37": "Western"
  };

  genreMapAnilist: { [key: string]: string } = {
    "Action": "Acción",
    "Adventure": "Aventura",
    "Comedy": "Comedia",
    "Drama": "Drama",
    "Ecchi": "Ecchi",
    "Fantasy": "Fantasía",
    "Horror": "Terror",
    "Mahou Shoujo": "Chica Mágica",
    "Mecha": "Mecha",
    "Music": "Música",
    "Mystery": "Misterio",
    "Psychological": "Psicológico",
    "Romance": "Romance",
    "Sci-Fi": "Ciencia Ficción",
    "Slice of Life": "Slice of Life",
    "Sports": "Deportes",
    "Supernatural": "Sobrenatural",
    "Thriller": "Thriller"
  };

  genreMapRAWG: { [key: string]: string } = {
    "Action": "Acción",
    "Adventure": "Aventura",
    "RPG": "RPG",
    "Simulation": "Simulación",
    "Massively Multiplayer": "Multijugador Masivo",
    "Family": "Familia",
    "Strategy": "Estrategia",
    "Puzzle": "Rompecabezas",
    "Racing": "Carreras",
    "Board Games": "Juegos de mesa",
    "Indie": "Indie",
    "Shooter": "Disparos",
    "Arcade": "Arcade",
    "Card": "Cartas",
    "Casual": "Casual",
    "Fighting": "Lucha",
    "Educational": "Educativo"
  };

  getGenresTranslated(genreIDs: string[] | undefined, category: string | undefined): string[] {
    if (!genreIDs) return [];

    if (category === 'cat_1') {
      return genreIDs.map(id => this.genreMapTMDB[id] || id);
    } else if (category === 'cat_2') {
      return genreIDs.map(id => this.genreMapTVTMDB[id] || id);
    } else if (category === 'cat_6'|| category === 'cat_4'|| category === 'cat_5') {
      return genreIDs.map(id => this.genreMapAnilist[id] || id);
    } else if (category === 'cat_3') {
      return genreIDs.map(id => this.genreMapRAWG[id] || id);
    }
    return genreIDs;
  }

  goBack() {
    window.history.back();
  }



}
