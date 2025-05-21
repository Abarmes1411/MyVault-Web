import { Injectable } from '@angular/core';
import {child, Database, objectVal, ref, set} from '@angular/fire/database';
import {UserVault} from '../models/UserVault.model';
import {map, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private COLLECTION_NAME="users"

  constructor(private database: Database) { }

  /**
   * Crea una nueva persona
   * @param user reserva a guardar o editar
   */
  savePerson(user:UserVault){
    let userRef = ref(this.database,`/${this.COLLECTION_NAME}/${user.id}`);

    return set(userRef,user) as Promise<void>
  }

  getAllUsers(): Observable<any[]> {
    const personasRef = ref(this.database, '/users/');
    return objectVal(personasRef).pipe(
      map((personas: any) => {
        if (!personas) return [];
        return Object.entries(personas).map(([id, persona]: [string, any]) => ({
          id,
          ...JSON.parse(JSON.stringify(persona))
        }));
      })
    );
  }




  getUserByUid(uid:string):Observable<UserVault>{

    const usersRef = ref(this.database,this.COLLECTION_NAME);
    const userRef = child(usersRef,uid);

    return objectVal(userRef) as Observable<UserVault>
  }

  updatePerson(userID: string, updatedData: Partial<UserVault>): Promise<void> {
    const consultRef = ref(this.database, `/users/${userID}`);
    return set(consultRef, updatedData);
  }

}

