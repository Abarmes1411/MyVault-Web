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

  getUserReviewsByID(userID: string): Observable<any[]> {
    const userReviewsRef = ref(this.database, `/users/${userID}/userReviews`);
    return objectVal(userReviewsRef).pipe(
      map((userReviews: any) => userReviews ? Object.values(userReviews) : [])
    );
  }


  getContentByAnyId(contentID: string): Observable<any | null> {
    const refContents = ref(this.database, '/content');
    return objectVal(refContents).pipe(
      map((contents: any) => {
        if (!contents) return null;
        const content = Object.values(contents).find((c: any) =>
          c.tmdbID === contentID ||
          c.tmdbTVid === contentID ||
          c.animeID === contentID ||
          c.mangaID === contentID ||
          c.novelID === contentID ||
          c.gameID === contentID
        );
        return content || null;
      })
    );
  }


  deleteReview(reviewID: string, contentID: string): Observable<void> {
    return this.authService.getUserDataAuth().pipe(
      take(1),
      switchMap(userData => {
        if (!userData || !userData.userVault?.id) {
          throw new Error('Usuario no autenticado');
        }

        const uid = userData.userVault.id;
        const userReviewPath = `/users/${uid}/userReviews/${reviewID}`;

        // Buscar la key del contenido en Firebase, ya que no es el contentID directamente
        const contentRef = ref(this.database, '/content');
        return get(contentRef).then(snapshot => {
          if (!snapshot.exists()) throw new Error('Contenido no encontrado');

          let contentKey: string | null = null;

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

          // Eliminar ambos en paralelo
          return Promise.all([
            remove(userReviewRef),
            remove(contentReviewRef)
          ]).then(() => void 0);
        });
      })
    );
  }


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

            snapshot.forEach(child => {
              const val = child.val();
              if (val.mangaID === contentID || val.animeID === contentID || val.tmdbID === contentID || val.tmdbTVID === contentID || val.gameID === contentID) {
                realContentKey = child.key!;
              }
            });

            if (!realContentKey) throw new Error(`No se encontró un contenido con contentID: ${contentID}`);


            const updates: { [key: string]: any } = {};
            updates[`/users/${uid}/userReviews/${reviewID}`] = reviewData;
            updates[`/content/${realContentKey}/userReviews/${reviewID}`] = {
              ...reviewData,
              userID: uid
            };

            return from(update(ref(this.database), updates));
          })
        );
      })
    );
  }

}
