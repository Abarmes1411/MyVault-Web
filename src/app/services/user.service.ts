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


  // Guarda un usuario en la base de datos en la ruta /users/{user.id}
  savePerson(user: UserVault) {
    const userRef = ref(this.database, `/${this.COLLECTION_NAME}/${user.id}`);
    return set(userRef, user) as Promise<void>; // Devuelve una promesa que resuelve cuando se guarda
  }

  // Obtiene todos los usuarios guardados en la ruta /users/
  getAllUsers(): Observable<any[]> {
    const personasRef = ref(this.database, '/users/');
    return objectVal(personasRef).pipe(
      map((personas: any) => {
        if (!personas) return []; // Si no hay datos, devuelve un array vacío
        return Object.entries(personas).map(([id, persona]: [string, any]) => ({
          id,
          ...JSON.parse(JSON.stringify(persona)) // Asegura que se devuelva una copia limpia de los datos
        }));
      })
    );
  }

  // Obtiene un usuario por su UID desde la colección /users
  getUserByUid(uid: string): Observable<UserVault> {
    const usersRef = ref(this.database, this.COLLECTION_NAME);
    const userRef = child(usersRef, uid); // Accede al nodo hijo con la clave UID
    return objectVal(userRef) as Observable<UserVault>;
  }

  // Actualiza parcialmente los datos de un usuario existente en /users/{userID}
  updateUser(userID: string, updatedData: Partial<UserVault>): Promise<void> {
    const consultRef = ref(this.database, `/users/${userID}`);
    return set(consultRef, updatedData); // Sobrescribe los datos con los nuevos datos parciales
  }

}

