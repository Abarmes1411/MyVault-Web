import { Injectable } from '@angular/core';
import {Database, get, orderByValue, push, ref} from '@angular/fire/database';
import {ActivatedRoute} from '@angular/router';
import {Content} from '../models/Content.model';
import {equalTo, query} from 'firebase/database';

@Injectable({
  providedIn: 'root'
})
export class DetailContentsService {
  selectedContentId: string | null = null;
  userLists: string[] = [];
  showListModal = false;


  constructor(private db: Database) {}

  async getContentById(id: string): Promise<Content | null> {
    try {
      const snapshot = await get(ref(this.db, `content/${id}`));
      if (snapshot.exists()) {
        return new Content(snapshot.val());
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error al obtener contenido:', error);
      return null;
    }
  }

  async addToVault(userId:string, contentId: string): Promise<"exists" | "added"> {
    const vaultRef = ref(this.db, `users/${userId}/myVault`);
    const vaultQuery = query(vaultRef, orderByValue(), equalTo(contentId));
    const snapshot = await get(vaultQuery);

    if (snapshot.exists()) return 'exists';

    await push(vaultRef, contentId);
    return 'added';
  }

  async addToListInSpecificList(userId: string, contentId: string, listName: string): Promise<"exists" | "added"> {
    const itemsRef = ref(this.db, `users/${userId}/customLists/${listName}/items`);
    const itemsQuery = query(itemsRef, orderByValue(), equalTo(contentId));
    const itemsSnapshot = await get(itemsQuery);

    if (itemsSnapshot.exists()) return 'exists';

    await push(itemsRef, contentId);
    return 'added';
  }

}
