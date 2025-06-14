import { Injectable } from '@angular/core';
import {combineLatest, map, Observable, of, switchMap} from 'rxjs';
import {User} from '@angular/fire/auth';
import {UserVault} from '../models/UserVault.model';
import {Database, objectVal, ref, set} from '@angular/fire/database';
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserlistsService {

  userData: Observable<{ user: User | null, userVault: UserVault | null }> | undefined;

  constructor(private database:Database,private authService: AuthService) { }

  // Obtiene todos los usuarios que no son amigos ni el usuario actual, y marca si tienen solicitud pendiente
  getAllUsersFiltered(): Observable<any[]> {
    return this.authService.getUserDataAuth().pipe(
      switchMap(userData => {
        const currentUserId = userData.user?.uid;
        if (!currentUserId) return of([]); // Si no hay usuario autenticado, se devuelve un array vacío

        const userlistsRef = ref(this.database, `/users`);

        return combineLatest([
          objectVal(userlistsRef),              // Obtiene todos los usuarios
          this.getFriendsOf(currentUserId)      // Obtiene los amigos del usuario actual
        ]).pipe(
          switchMap(([userlists, amigos]) => {
            if (!userlists) return of([]); // Si no hay usuarios, devolvemos vacío

            // Filtra para excluir al usuario actual y a sus amigos
            const userArray = Object.values(userlists).filter((user: any) => {
              return user.id !== currentUserId && (!amigos || !amigos[user.id]);
            });

            // Para cada usuario restante, comprobamos si hay una solicitud pendiente
            const checks = userArray.map((user: any) => {
              const requestRef = ref(this.database, `friend_requests/${user.id}/${currentUserId}`);
              return objectVal(requestRef).pipe(
                map(value => {
                  user.solicitudPendiente = value === 'pending'; // Añadimos propiedad booleana al usuario
                  return user;
                })
              );
            });

            // Combinamos todos los observables de comprobación
            return combineLatest(checks);
          })
        );
      })
    );
  }

  // Envía una solicitud de amistad a otro usuario
  sendFriendRequest(receiverId: string): void {
    this.authService.getUserDataAuth().subscribe(authUser => {
      const senderId = authUser?.user?.uid;
      if (!senderId) return;

      const requestRef = ref(this.database, `friend_requests/${receiverId}/${senderId}`);
      set(requestRef, 'pending') // Guardamos el estado de la solicitud como "pending"
        .then(() => {
          console.log('Solicitud de amistad enviada');
        })
        .catch(error => {
          console.error('Error al enviar la solicitud de amistad:', error);
        });
    });
  }

  // Obtiene el UID del usuario autenticado
  getUserId(): Observable<string | null> {
    return this.authService.getUserDataAuth().pipe(
      map(userData => userData.user?.uid || null)
    );
  }

  // Devuelve las solicitudes de amistad enviadas por un usuario concreto
  getFriendRequestsSentBy(userId: string): Observable<{ [receiverId: string]: string }> {
    const refReqs = ref(this.database, `/friend_requests/${userId}`);
    return objectVal(refReqs).pipe(
      map((requests: any) => {
        const sent: { [receiverId: string]: string } = {};
        if (requests) {
          for (const receiverId of Object.keys(requests)) {
            if (requests[receiverId] === 'pending') {
              sent[receiverId] = 'pending'; // Solo añadimos solicitudes pendientes
            }
          }
        }
        return sent;
      })
    );
  }

  // Devuelve los amigos confirmados del usuario
  getFriendsOf(userId: string): Observable<{ [friendId: string]: true }> {
    const userFriendsRef = ref(this.database, `/users/${userId}/friends`);
    return objectVal(userFriendsRef).pipe(
      map((friends: any) => friends || {}) // Si no hay amigos, devolvemos objeto vacío
    );
  }

  // Devuelve los datos completos de los amigos de un usuario
  getFriendsData(userId: string): Observable<any[]> {
    const friendsRef = ref(this.database, `/users/${userId}/friends`);
    return objectVal<{ [friendId: string]: true }>(friendsRef).pipe(
      switchMap((friends) => {
        if (!friends) return of([]); // Si no tiene amigos, devolvemos array vacío
        const friendIds = Object.keys(friends);
        if (friendIds.length === 0) return of([]);

        const userlistsRef = ref(this.database, `/users`);
        return objectVal<{ [userId: string]: any }>(userlistsRef).pipe(
          map((allUsers) => {
            if (!allUsers) return [];
            // Solo devolvemos los datos de los usuarios que son amigos
            return friendIds
              .map(id => allUsers[id])
              .filter(user => !!user);
          })
        );
      })
    );
  }

}
