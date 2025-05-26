import { Injectable } from '@angular/core';
import {Database, objectVal, ref, remove, set} from '@angular/fire/database';
import {map, Observable, switchMap, take} from 'rxjs';
import {User} from '@angular/fire/auth';
import {AuthService} from './auth.service';
import {UserVault} from '../models/UserVault.model';
import {get} from 'firebase/database';

@Injectable({
  providedIn: 'root'
})
export class CustomlistsService {


  userData: Observable<{ user: User | null, userVault: UserVault | null }> | undefined;

  constructor(private database:Database,private authService: AuthService) { }

  getAllAustomLists(): Observable<any[]> {
    return this.authService.getUserDataAuth().pipe(
      switchMap(userData => {
        if (!userData || !userData.userVault?.id) return [];
        const uid = userData.userVault.id;
        const customlistsRef = ref(this.database, `/users/${uid}/customLists`);
        return objectVal(customlistsRef).pipe(
          map((customlists: any) => customlists ? Object.values(customlists) : [])
        );
      })
    );
  }

  async addCustomList(listName: string): Promise<void> {
    const userData = await this.authService.getUserDataAuth().pipe(take(1)).toPromise();
    if (!userData || !userData.userVault?.id) throw new Error('No hay usuario autenticado');

    const uid = userData.userVault.id;
    const newListRef = ref(this.database, `/users/${uid}/customLists/${listName}`);

    // Añadimos la lista con nombre y items vacío
    return set(newListRef, {
      id: listName,
      listName: listName,
      items: {}
    });
  }

  async deleteCustomList(listName: string): Promise<void> {
    const userData = await this.authService.getUserDataAuth().pipe(take(1)).toPromise();

    if (!userData || !userData.userVault?.id) {
      throw new Error('No hay usuario autenticado');
    }

    const uid = userData.userVault.id;

    const listRef = ref(this.database, `/users/${uid}/customLists/${listName}`);

    return remove(listRef);
  }


  async updateListName(oldName: string, newName: string): Promise<void> {
    const userData = await this.authService.getUserDataAuth().pipe(take(1)).toPromise();
    if (!userData || !userData.userVault?.id) throw new Error('No hay usuario autenticado');

    const uid = userData.userVault.id;
    const oldListRef = ref(this.database, `/users/${uid}/customLists/${oldName}`);
    const newListRef = ref(this.database, `/users/${uid}/customLists/${newName}`);

    const oldListSnapshot = await objectVal(oldListRef).pipe(take(1)).toPromise();
    if (!oldListSnapshot) throw new Error('La lista antigua no existe');

    // Crear la nueva lista con los datos antiguos y el nuevo nombre
    await set(newListRef, {
      ...oldListSnapshot,
      id: newName,
      listName: newName
    });

    // Borrar la antigua
    await set(oldListRef, null);
  }

  async getListItems(listID: string): Promise<any> {
    const userData = await this.authService.getUserDataAuth().pipe(take(1)).toPromise();
    if (!userData || !userData.userVault?.id) throw new Error('No hay usuario autenticado');

    const uid = userData.userVault.id;
    const listRef = ref(this.database, `/users/${uid}/customLists/${listID}/items`);
    const itemsSnapshot = await objectVal(listRef).pipe(take(1)).toPromise();
    return itemsSnapshot;
  }

  async getContentByID(contentID: string): Promise<any> {
    const contentRef = ref(this.database, `/content/${contentID}`);
    const contentSnapshot = await objectVal(contentRef).pipe(take(1)).toPromise();
    return contentSnapshot;
  }


  getUserReviews(userID: string): Promise<any[]> {
    const reviewsRef = ref(this.database, `users/${userID}/userReviews`);
    return get(reviewsRef).then(snapshot => {
      if (snapshot.exists()) {
        return Object.values(snapshot.val());
      } else {
        return [];
      }
    });
  }

  async removeItemFromList(listID: string, contentID: string): Promise<void> {
    const userData = await this.authService.getUserDataAuth().pipe(take(1)).toPromise();
    if (!userData || !userData.userVault?.id) throw new Error('No hay usuario autenticado');

    const uid = userData.userVault.id;

    const listRef = ref(this.database, `/users/${uid}/customLists/${listID}/items`);

    // Obtener la lista actual de items
    const snapshot = await get(listRef);
    if (!snapshot.exists()) return;

    const items = snapshot.val();

    // Buscar la clave que contiene ese contentID
    const itemKey = Object.keys(items).find(key => items[key] === contentID);

    if (!itemKey) return;

    // Eliminar el ítem
    const itemRef = ref(this.database, `/users/${uid}/customLists/${listID}/items/${itemKey}`);
    await remove(itemRef);
  }


}
