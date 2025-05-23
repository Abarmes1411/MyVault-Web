import { Injectable } from '@angular/core';
import {Database, objectVal, ref} from '@angular/fire/database';
import {map, Observable, switchMap} from 'rxjs';
import {User} from '@angular/fire/auth';
import {AuthService} from './auth.service';
import {UserVault} from '../models/UserVault.model';

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
}
