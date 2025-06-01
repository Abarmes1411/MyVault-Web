import {Component, OnInit} from '@angular/core';
import {DecimalPipe, NgForOf, NgIf} from '@angular/common';
import {Content} from '../../models/Content.model';
import {MyvaultService} from '../../services/myvault.service';
import {AuthService} from '../../services/auth.service';
import {Auth} from "@angular/fire/auth";
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-myvault',
  imports: [
    NgForOf,
    NgIf,
    RouterLink
  ],
  templateUrl: './myvault.component.html',
  styleUrl: './myvault.component.css'
})
export class MyVaultComponent implements OnInit {

  uid: string | null = null;

  vaultMovies: Content[] = [];
  vaultShows: Content[] = [];
  vaultGames: Content[] = [];
  vaultAnimes: Content[] = [];
  vaultMangas: Content[] = [];
  vaultNovels: Content[] = [];

  constructor(private vaultService: MyvaultService, private auth: Auth) {}

  async ngOnInit(): Promise<void> {
    this.uid = this.auth.currentUser?.uid || null;
    if (!this.uid) return;

    try {
      const contentIDs = await this.vaultService.getMyVaultContentIDs(this.uid);
      const contentPromises = contentIDs.map(id => this.vaultService.getContentByID(id));
      const allContent = await Promise.all(contentPromises);

      // Clasificar por categoría
      this.vaultMovies = allContent.filter(c => c.categoryID === 'cat_1');
      this.vaultShows = allContent.filter(c => c.categoryID === 'cat_2');
      this.vaultGames = allContent.filter(c => c.categoryID === 'cat_3');
      this.vaultAnimes = allContent.filter(c => c.categoryID === 'cat_4');
      this.vaultMangas = allContent.filter(c => c.categoryID === 'cat_5');
      this.vaultNovels = allContent.filter(c => c.categoryID === 'cat_6');

    } catch (error) {
      console.error('Error cargando contenido del baúl:', error);
    }
  }

  async deleteItem(contentID: string | undefined): Promise<void> {
    if (!contentID) {
      console.error('El contentID es undefined. No se puede eliminar.');
      return;
    }

    const confirmed = confirm('¿Estás seguro de que deseas eliminar el contenido del Baúl?');
    if (!confirmed) return;

    try {
      await this.vaultService.removeItemFromVault(contentID);
      // Recargar el contenido
      await this.ngOnInit();
    } catch (error) {
      console.error('Error al eliminar el ítem:', error);
    }
  }
}
