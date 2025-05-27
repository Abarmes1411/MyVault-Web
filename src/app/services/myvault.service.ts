import { Injectable } from '@angular/core';
import {Database, ref, remove} from '@angular/fire/database';
import {get} from 'firebase/database';
import {Content} from '../models/Content.model';
import {take} from 'rxjs';
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MyvaultService {

  constructor(private database: Database, private authService: AuthService) {

  }

  async getMyVaultContentIDs(uid: string | null): Promise<string[]> {
    const snapshot = await get(ref(this.database, `users/${uid}/myVault`));
    if (snapshot.exists()) {
      return Object.values(snapshot.val());
    }
    return [];
  }

  async getContentByID(contentID: string): Promise<Content> {
    const snapshot = await get(ref(this.database, `content/${contentID}`));
    if (snapshot.exists()) {
      return snapshot.val();
    }
    throw new Error(`No se encontró el contenido con ID ${contentID}`);
  }

  async removeItemFromVault(contentID: string): Promise<void> {
    const userData = await this.authService.getUserDataAuth().pipe(take(1)).toPromise();
    if (!userData || !userData.userVault?.id) throw new Error('No hay usuario autenticado');

    const uid = userData.userVault.id;

    const vaultRef = ref(this.database, `/users/${uid}/myVault`);
    const snapshot = await get(vaultRef);

    if (!snapshot.exists()) return;

    const items = snapshot.val();

    // Buscar la clave correspondiente al valor del contentID
    const itemKey = Object.keys(items).find(key => items[key] === contentID);

    if (!itemKey) return;

    const itemRef = ref(this.database, `/users/${uid}/myVault/${itemKey}`);
    await remove(itemRef);
  }

}
