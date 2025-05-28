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

  getAllUsersFiltered(): Observable<any[]> {
    return this.authService.getUserDataAuth().pipe(
      switchMap(userData => {
        const currentUserId = userData.user?.uid;
        if (!currentUserId) return of([]);

        const userlistsRef = ref(this.database, `/users`);

        return combineLatest([
          objectVal(userlistsRef),
          this.getFriendsOf(currentUserId)
        ]).pipe(
          switchMap(([userlists, amigos]) => {
            if (!userlists) return of([]);

            const userArray = Object.values(userlists).filter((user: any) => {
              return user.id !== currentUserId && (!amigos || !amigos[user.id]);
            });

            const checks = userArray.map((user: any) => {
              const requestRef = ref(this.database, `friend_requests/${user.id}/${currentUserId}`);
              return objectVal(requestRef).pipe(
                map(value => {
                  user.solicitudPendiente = value === 'pending';
                  return user;
                })
              );
            });

            return combineLatest(checks);
          })
        );
      })
    );
  }



  sendFriendRequest(receiverId: string): void {
    this.authService.getUserDataAuth().subscribe(authUser => {
      const senderId = authUser?.user?.uid;
      if (!senderId) return;

      const requestRef = ref(this.database, `friend_requests/${receiverId}/${senderId}`);
      set(requestRef, 'pending')
        .then(() => {
          console.log('Solicitud de amistad enviada');
        })
        .catch(error => {
          console.error('Error al enviar la solicitud de amistad:', error);
        });
    });
  }


  getUserId(): Observable<string | null> {
    return this.authService.getUserDataAuth().pipe(
      map(userData => userData.user?.uid || null)
    );
  }

  getFriendRequestsSentBy(userId: string): Observable<{ [receiverId: string]: string }> {
    const refReqs = ref(this.database, `/friend_requests/${userId}`);
    return objectVal(refReqs).pipe(
      map((requests: any) => {
        const sent: { [receiverId: string]: string } = {};
        if (requests) {
          for (const receiverId of Object.keys(requests)) {
            if (requests[receiverId] === 'pending') {
              sent[receiverId] = 'pending';
            }
          }
        }
        return sent;
      })
    );
  }


  getFriendsOf(userId: string): Observable<{ [friendId: string]: true }> {
    const userFriendsRef = ref(this.database, `/users/${userId}/friends`);
    return objectVal(userFriendsRef).pipe(
      map((friends: any) => friends || {})
    );
  }
}
