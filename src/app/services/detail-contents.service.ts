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

  // Metodo para obtener un contenido por su ID desde la base de datos
  async getContentById(id: string): Promise<Content | null> {
    try {
      // Se obtiene el snapshot del nodo 'content/{id}'
      const snapshot = await get(ref(this.db, `content/${id}`));
      // Si existe, se crea y devuelve una instancia de Content, si no, devuelve null
      return snapshot.exists() ? new Content(snapshot.val()) : null;
    } catch (error) {
      // En caso de error, se muestra en consola y devuelve null
      console.error('Error al obtener contenido:', error);
      return null;
    }
  }

  // Metodo para añadir un contenido a la "vault" del usuario (su colección)
  async addToVault(userId: string, contentId: string): Promise<"exists" | "added"> {
    // Referencia a la vault del usuario
    const vaultRef = ref(this.db, `users/${userId}/myVault`);
    // Consulta para comprobar si el contenido ya está en la vault
    const vaultQuery = query(vaultRef, orderByValue(), equalTo(contentId));
    const snapshot = await get(vaultQuery);

    // Si ya existe, devuelve 'exists'
    if (snapshot.exists()) return 'exists';

    // Si no, añade el contenido a la vault y devuelve 'added'
    await push(vaultRef, contentId);
    return 'added';
  }

  // Metodo para añadir un contenido a una lista personalizada específica del usuario
  async addToListInSpecificList(userId: string, contentId: string, listName: string): Promise<"exists" | "added"> {
    // Referencia a los items de la lista personalizada
    const itemsRef = ref(this.db, `users/${userId}/customLists/${listName}/items`);
    // Consulta para comprobar si el contenido ya está en la lista
    const itemsQuery = query(itemsRef, orderByValue(), equalTo(contentId));
    const itemsSnapshot = await get(itemsQuery);

    // Si ya existe, devuelve 'exists'
    if (itemsSnapshot.exists()) return 'exists';

    // Si no, añade el contenido a la lista y devuelve 'added'
    await push(itemsRef, contentId);
    return 'added';
  }

  // Metodo para comprobar si un usuario ya ha hecho una reseña para un contenido
  async hasUserReviewed(contentId: string, userId: string): Promise<boolean> {
    // Referencia a las reseñas de usuarios para un contenido
    const reviewsRef = ref(this.db, `content/${contentId}/userReviews`);
    const snapshot = await get(reviewsRef);

    // Si no existen reseñas, devuelve false
    if (!snapshot.exists()) return false;

    // Si existen, comprueba si alguna reseña pertenece al usuario indicado
    const reviews = snapshot.val();
    for (const key in reviews) {
      if (reviews[key].userID === userId) return true;
    }
    // Si no encuentra ninguna reseña del usuario, devuelve false
    return false;
  }

  // Metodo para crear una reseña de usuario para un contenido
  async createUserReview(contentId: string, review: UserReview): Promise<void> {
    // Genera un ID único para la reseña usando push y child dummy
    const reviewId = push(child(ref(this.db), 'dummy')).key;
    if (!reviewId) throw new Error('No se pudo generar ID de la reseña');

    // Prepara los datos de la reseña con el ID generado
    const reviewData = {
      ...review,
      id: reviewId
    };

    // Referencias a la ubicación de la reseña en content y en usuario
    const contentReviewRef = ref(this.db, `content/${contentId}/userReviews/${reviewId}`);
    const userReviewRef = ref(this.db, `users/${review.userID}/userReviews/${reviewId}`);

    // Guarda la reseña en ambos nodos de la base de datos simultáneamente
    await Promise.all([
      set(contentReviewRef, reviewData),
      set(userReviewRef, reviewData)
    ]);
  }

  // Metodo para llamar a la función cloud que genera un resumen automático con IA
  async callGenerateSummary(contentId: string): Promise<void> {
    // Obtiene los datos completos del contenido
    const contentRef = ref(this.db, `content/${contentId}`);
    const contentSnap = await get(contentRef);
    if (!contentSnap.exists()) return;

    // Extrae las reseñas del contenido (si no hay, lista vacía)
    const contentData = contentSnap.val();
    const reviews = contentData.userReviews ? Object.values(contentData.userReviews) : [];

    // Solo sigue si hay al menos 3 reseñas
    if (reviews.length < 3) return;

    // Último número de reseñas contadas para el resumen guardado
    const lastCount = contentData.summaryReviewCount ?? 0;

    // Solo genera un resumen si hay al menos 3 reseñas nuevas respecto al último resumen
    if (reviews.length < lastCount + 3) {
      console.log('No hay suficientes reseñas nuevas para generar un nuevo resumen.');
      return;
    }

    try {
      // Llama a la función cloud con las reseñas para generar resumen
      const response = await fetch('https://us-central1-myvault-cf31b.cloudfunctions.net/generateSummary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Envía solo los comentarios de las reseñas
          reviews: reviews.map((r: any) => r.comment)
        })
      });

      // Obtiene el resultado en JSON
      const result = await response.json();

      // Si hay resumen, lo guarda en el contenido junto con la nueva cuenta de reseñas
      if (result.summary) {
        await set(ref(this.db, `content/${contentId}/summaryAI`), result.summary);
        await set(ref(this.db, `content/${contentId}/summaryReviewCount`), reviews.length);
      }
    } catch (err) {
      // En caso de error en la llamada, lo muestra en consola
      console.error('Error llamando a la función generateSummary:', err);
    }
  }
}
