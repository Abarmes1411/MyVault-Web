import { Injectable } from '@angular/core';
import {child, Database, get, orderByValue, push, ref, set} from '@angular/fire/database';
import {ActivatedRoute} from '@angular/router';
import {Content} from '../models/Content.model';
import {equalTo, query} from 'firebase/database';
import {UserReview} from '../models/UserReview.model';
import {environment} from '../../environments/environment';

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


  async callGenerateSummary(contentId: string): Promise<void> {
    const contentRef = ref(this.db, `content/${contentId}`);
    const contentSnap = await get(contentRef);
    if (!contentSnap.exists()) return;

    const contentData = contentSnap.val();
    const reviews = contentData.userReviews ? Object.values(contentData.userReviews) : [];

    if (reviews.length < 3) return;

    const lastCount = contentData.summaryReviewCount ?? 0;

    // Solo generar resumen si hay al menos 3 reseñas nuevas
    if (reviews.length < lastCount + 3) {
      console.log('No hay suficientes reseñas nuevas para generar un nuevo resumen.');
      return;
    }

    try {
      const response = await fetch('https://us-central1-myvault-cf31b.cloudfunctions.net/generateSummary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviews: reviews.map((r: any) => r.comment)
        })
      });

      const result = await response.json();
      if (result.summary) {
        await set(ref(this.db, `content/${contentId}/summaryAI`), result.summary);
        await set(ref(this.db, `content/${contentId}/summaryReviewCount`), reviews.length);
      }
    } catch (err) {
      console.error('Error llamando a la función generateSummary:', err);
    }
  }



}
