import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {CustomlistsService} from '../../services/customlists.service';
import {Database} from '@angular/fire/database';
import {NgForOf, NgIf} from '@angular/common';
import {AuthService} from '../../services/auth.service';
import {ChatsService} from '../../services/chats.service';

@Component({
  selector: 'app-customlist-detail',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    RouterLink
  ],
  templateUrl: './customlist-detail.component.html',
  styleUrls: ['./customlist-detail.component.css']
})
export class CustomlistDetailComponent implements OnInit {

  listID!: string;
  listName: string = '';
  itemsContent: any[] = [];
  userID: string | null = null;
  listOwnerID: string | null = null;


  constructor(
    private route: ActivatedRoute,
    private customlistService: CustomlistsService,
    private database: Database,
    private authService:AuthService,
    private chatService: ChatsService
  ) {}

  async ngOnInit(): Promise<void> {
    this.listID = this.route.snapshot.paramMap.get('id')!;
    this.userID = await this.authService.getUserId();

    // Buscar la lista y al dueño
    const result = await this.chatService.getCustomListById(this.listID);
    if (!result) {
      console.error('Lista no encontrada');
      return;
    }

    this.listName = result.list.listName;
    this.listOwnerID = result.ownerId;

    this.loadListItemsAndContent(result.list.items);
  }

  async loadListItemsAndContent(itemsMap: any): Promise<void> {
    try {
      if (!itemsMap) return;

      const contentIDs = Object.values(itemsMap) as string[];

      const contentArray = await Promise.all(
        contentIDs.map(id => this.customlistService.getContentByID(id))
      );

      const userReviews = this.userID
        ? await this.customlistService.getUserReviews(this.userID)
        : [];

      this.itemsContent = contentArray
        .filter(item => item)
        .map(content => {
          const contentID = content.mangaID || content.tmdbID || content.animeID || content.tmdbTVID || content.gameID || content.id;
          const userReview = userReviews.find(r => r.contentID === contentID);

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
