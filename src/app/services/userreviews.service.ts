import { Injectable } from '@angular/core';
import {from, map, Observable, switchMap, take} from 'rxjs';
import {Database, objectVal, ref, remove, update} from '@angular/fire/database';
import {AuthService} from './auth.service';
import {User} from '@angular/fire/auth';
import {UserVault} from '../models/UserVault.model';
import {get} from 'firebase/database';

@Injectable({
  providedIn: 'root'
})
export class UserreviewsService {

  userData: Observable<{ user: User | null, userVault: UserVault | null }> | undefined;

  constructor(private database:Database,private authService: AuthService) { }


  // Devuelve el nombre de usuario a partir de su ID. Si no existe, retorna "Usuario"
  getUsernameByID(userID: string): Promise<string> {
    const userRef = ref(this.database, `users/${userID}/username`);
    return get(userRef).then(snapshot => {
      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        return 'Usuario';
      }
    });
  }

  // Obtiene todas las reseñas del usuario autenticado
  getAllUserReviews(): Observable<any[]> {
    return this.authService.getUserDataAuth().pipe(
      switchMap(userData => {
        if (!userData || !userData.userVault?.id) return [];
        const uid = userData.userVault.id;
        const userReviewsRef = ref(this.database, `/users/${uid}/userReviews`);
        return objectVal(userReviewsRef).pipe(
          map((userReviews: any) => userReviews ? Object.values(userReviews) : [])
        );
      })
    );
  }

  // Obtiene las reseñas de un usuario específico por su ID
  getUserReviewsByID(userID: string): Observable<any[]> {
    const userReviewsRef = ref(this.database, `/users/${userID}/userReviews`);
    return objectVal(userReviewsRef).pipe(
      map((userReviews: any) => userReviews ? Object.values(userReviews) : [])
    );
  }

  // Busca un contenido en la base de datos por cualquier tipo de ID (TMDb, AniList, RAWG...)
  getContentByAnyId(contentID: string): Observable<any | null> {
    const refContents = ref(this.database, '/content');
    return objectVal(refContents).pipe(
      map((contents: any) => {
        if (!contents) return null;
        const content = Object.values(contents).find((c: any) =>
          c.tmdbID === contentID ||
          c.tmdbTVID === contentID ||
          c.animeID === contentID ||
          c.mangaID === contentID ||
          c.novelID === contentID ||
          c.gameID === contentID
        );
        return content || null;
      })
    );
  }

  // Elimina una reseña tanto del usuario como del contenido correspondiente
  deleteReview(reviewID: string, contentID: string): Observable<void> {
    return this.authService.getUserDataAuth().pipe(
      take(1),
      switchMap(userData => {
        if (!userData || !userData.userVault?.id) {
          throw new Error('Usuario no autenticado');
        }

        const uid = userData.userVault.id;
        const userReviewPath = `/users/${uid}/userReviews/${reviewID}`;

        // Buscar la clave real del contenido en Firebase
        const contentRef = ref(this.database, '/content');
        return get(contentRef).then(snapshot => {
          if (!snapshot.exists()) throw new Error('Contenido no encontrado');

          let contentKey: string | null = null;

          // Busca la clave del contenido que coincide con el ID
          snapshot.forEach(child => {
            const data = child.val();
            if (
              data.tmdbID === contentID ||
              data.tmdbTVid === contentID ||
              data.animeID === contentID ||
              data.mangaID === contentID ||
              data.novelID === contentID ||
              data.gameID === contentID
            ) {
              contentKey = child.key!;
            }
          });

          if (!contentKey) throw new Error('ID de contenido no localizado');

          const contentReviewPath = `/content/${contentKey}/userReviews/${reviewID}`;

          const userReviewRef = ref(this.database, userReviewPath);
          const contentReviewRef = ref(this.database, contentReviewPath);

          // Elimina la reseña en ambos nodos
          return Promise.all([
            remove(userReviewRef),
            remove(contentReviewRef)
          ]).then(() => void 0);
        });
      })
    );
  }

  // Actualiza una reseña tanto en el nodo del usuario como en el nodo del contenido
  updateReview(reviewID: string, contentID: string, reviewData: any): Observable<void> {
    return this.authService.getUserDataAuth().pipe(
      switchMap(userData => {
        if (!userData?.userVault?.id) throw new Error("Usuario no autenticado");
        const uid = userData.userVault.id;

        const contentRef = ref(this.database, '/content');
        return from(get(contentRef)).pipe(
          switchMap(snapshot => {
            if (!snapshot.exists()) throw new Error("No hay contenido en la base de datos");

            let realContentKey: string | null = null;

            // Busca la clave real del contenido
            snapshot.forEach(child => {
              const val = child.val();
              if (val.mangaID === contentID || val.animeID === contentID || val.tmdbID === contentID || val.tmdbTVID === contentID || val.gameID === contentID) {
                realContentKey = child.key!;
              }
            });

            if (!realContentKey) throw new Error(`No se encontró un contenido con contentID: ${contentID}`);

            // Prepara los datos para actualizar en ambos nodos
            const updates: { [key: string]: any } = {};
            updates[`/users/${uid}/userReviews/${reviewID}`] = reviewData;
            updates[`/content/${realContentKey}/userReviews/${reviewID}`] = {
              ...reviewData,
              userID: uid // Se asegura de guardar el ID del usuario en la reseña del contenido
            };

            return from(update(ref(this.database), updates));
          })
        );
      })
    );
  }
}
