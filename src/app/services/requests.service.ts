import { Injectable } from '@angular/core';
import {map, Observable, of, switchMap} from 'rxjs';
import {User} from '@angular/fire/auth';
import {UserVault} from '../models/UserVault.model';
import {Database, objectVal, ref, remove, update} from '@angular/fire/database';
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RequestsService {

  constructor(private database: Database) { }

  getRequestData(receiverId: string): Observable<any[]> {
    const requestsRef = ref(this.database, `friend_requests/${receiverId}`);
    return objectVal<{ [senderId: string]: string }>(requestsRef).pipe(
      switchMap(requests => {
        if (!requests) return of([]);
        // Filtramos solo las que están 'pending'
        const pendingSenderIds = Object.entries(requests)
          .filter(([_, status]) => status === 'pending')
          .map(([senderId]) => senderId);

        if (pendingSenderIds.length === 0) return of([]);

        const usersRef = ref(this.database, 'users');
        return objectVal<{ [userId: string]: any }>(usersRef).pipe(
          map(allUsers => {
            if (!allUsers) return [];
            return pendingSenderIds
              .map(id => allUsers[id])
              .filter(user => !!user);
          })
        );
      })
    );
  }

  acceptFriendRequest(currentUserId: string, senderId: string): Promise<void> {
    const updates: { [key: string]: any } = {};
    updates[`users/${currentUserId}/friends/${senderId}`] = true;
    updates[`users/${senderId}/friends/${currentUserId}`] = true;
    updates[`friend_requests/${currentUserId}/${senderId}`] = null;

    return update(ref(this.database), updates);
  }


  rejectFriendRequest(currentUserId: string, senderId: string): Promise<void> {
    const requestRef = ref(this.database, `friend_requests/${currentUserId}/${senderId}`);
    return remove(requestRef);
  }

  removeFriend(currentUserId: string, friendId: string): Promise<void> {
    const updates: { [key: string]: any } = {};
    updates[`users/${currentUserId}/friends/${friendId}`] = null;
    updates[`users/${friendId}/friends/${currentUserId}`] = null;
    return update(ref(this.database), updates);
  }

}
