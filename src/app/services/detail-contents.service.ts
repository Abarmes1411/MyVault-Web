import { Injectable } from '@angular/core';
import {child, Database, get, orderByValue, push, ref, set} from '@angular/fire/database';
import {ActivatedRoute} from '@angular/router';
import {Content} from '../models/Content.model';
import {equalTo, query} from 'firebase/database';
import {UserReview} from '../models/UserReview.model';

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
      return snapshot.exists() ? new Content(snapshot.val()) : null;
    } catch (error) {
      console.error('Error al obtener contenido:', error);
      return null;
    }
  }

  async addToVault(userId: string, contentId: string): Promise<"exists" | "added"> {
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


  async hasUserReviewed(contentId: string, userId: string): Promise<boolean> {
    const reviewsRef = ref(this.db, `content/${contentId}/userReviews`);
    const snapshot = await get(reviewsRef);

    if (!snapshot.exists()) return false;

    const reviews = snapshot.val();
    for (const key in reviews) {
      if (reviews[key].userID === userId) return true;
    }
    return false;
  }

  async createUserReview(contentId: string, review: UserReview): Promise<void> {
    const reviewId = push(child(ref(this.db), 'dummy')).key;
    if (!reviewId) throw new Error('No se pudo generar ID de la reseña');

    const reviewData = {
      ...review,
      id: reviewId
    };

    const contentReviewRef = ref(this.db, `content/${contentId}/userReviews/${reviewId}`);
    const userReviewRef = ref(this.db, `users/${review.userID}/userReviews/${reviewId}`);

    // Guardar en ambos nodos
    await Promise.all([
      set(contentReviewRef, reviewData),
      set(userReviewRef, reviewData)
    ]);
  }

}
