import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CustomlistsService} from '../../services/customlists.service';
import {Database, ref} from '@angular/fire/database';
import {NgForOf, NgIf} from '@angular/common';
import {get} from 'firebase/database';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-customlist-detail',
  imports: [
    NgForOf,
    NgIf
  ],
  templateUrl: './customlist-detail.component.html',
  styleUrl: './customlist-detail.component.css'
})
export class CustomlistDetailComponent implements OnInit {

  listID!: string;
  listName: string = '';
  itemsContent: any[] = [];
  userID: string | null = null;


  constructor(
    private route: ActivatedRoute,
    private customlistService: CustomlistsService,
    private database: Database,
    private authService:AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    this.listID = this.route.snapshot.paramMap.get('id')!;
    this.loadListItemsAndContent();
    this.userID = await this.authService.getUserId();
  }


  async loadListItemsAndContent(): Promise<void> {
    try {
      //Obtener el mapa de items de la lista personalizada a partir del ID de la lista
      const itemsMap = await this.customlistService.getListItems(this.listID);

      //Si no hay items o el ID de usuario no esta definido, termina la función
      if (!itemsMap || !this.userID) return;

      //Extraer los IDs de contenido del mapa
      const contentIDs = Object.values(itemsMap) as string[];

      //Obtener los datos de contenido para cada ID de forma paralela
      const contentArray = await Promise.all(
        contentIDs.map(id => this.customlistService.getContentByID(id))
      );

      //Obtener las reviews del usuario para poder asociarlas al contenido
      const userReviews = await this.customlistService.getUserReviews(this.userID);

      //Juntar el contenido con la valoración del usuario (si existe)
      this.itemsContent = contentArray
        .filter(item => item) // Filtrar elementos nulos o indefinidos
        .map(content => {
          //Buscar si hay una review del usuario para este contenido
          const contentID = content.mangaID || content.tmdbID || content.animeID || content.tmdbTVID || content.gameID || content.id;
          const userReview = userReviews.find(
            review => review.contentID === contentID
          );

          //Devolver el objeto de contenido incluyendo la valoración del usuario
          return {
            ...content,
            userRating: userReview ? userReview.rating : null
          };
        });

    } catch (error) {
      console.error('Error al cargar contenido:', error);
    }
  }



  getCategoryName(categoryID: string): string {
    const categories: { [key: string]: string } = {
      cat_1: 'Película',
      cat_2: 'Serie',
      cat_3: 'Videojuego',
      cat_4: 'Anime',
      cat_5: 'Manga',
      cat_6: 'Novela Ligera'
    };
    return categories[categoryID] || 'Desconocido';
  }

  getStarIcons(rating: number): string[] {
    const stars: string[] = [];

    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push('full_star.PNG');
      } else if (rating >= i - 0.5) {
        stars.push('half_star.PNG');
      } else {
        stars.push('empty_star.png');
      }
    }

    return stars;
  }

  async deleteItem(contentID: string): Promise<void> {
    const confirmed = confirm(`¿Estás seguro de que deseas eliminar el contenido de la lista?`);
    if (!confirmed) return;

    if (!this.listID) return;

    try {
      await this.customlistService.removeItemFromList(this.listID, contentID);

      // Eliminar el ítem de la lista
      this.itemsContent = this.itemsContent.filter(item => {
        const id = item.mangaID || item.tmdbID || item.animeID || item.tmdbTVID || item.gameID || item.id;
        return id !== contentID;
      });
    } catch (error) {
      console.error('Error al eliminar el ítem:', error);
    }
  }

}
