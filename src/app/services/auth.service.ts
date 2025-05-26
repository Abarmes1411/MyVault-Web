import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, User, UserCredential } from '@angular/fire/auth';
import {catchError, map, Observable, of, switchMap} from 'rxjs';
import {UserVault} from '../models/UserVault.model';
import {UserService} from './user.service';



@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: Auth,  private userService:UserService) {

  }

  async getUserId(): Promise<string | null> {
    const user = this.auth.currentUser;
    return user ? user.uid : null;
  }



  register(data:{email:string,password:string}):Promise<UserCredential>{
    return createUserWithEmailAndPassword(this.auth, data.email,data.password)
  }

  login(data:{email:string,password:string}):Promise<UserCredential>{
    return signInWithEmailAndPassword(this.auth, data.email,data.password)
  }

  loginGoogle():Promise<UserCredential>{
    return signInWithPopup(this.auth,new GoogleAuthProvider());
  }

  logout(){
    return signOut(this.auth)
  }

  getUserAuthenticated(): Observable<User|null> {
    return new Observable((observer) => {
      onAuthStateChanged(
        this.auth,
        (user) => {
          observer.next(user);
        },
        (error) => {
          observer.error(error);
        }
      );
    });
  }


  getUserDataAuth(): Observable<{user: User | null, userVault: UserVault | null}> {
    return this.getUserAuthenticated().pipe(
      switchMap((usuario) => {
        if (usuario && usuario.uid) {
          return this.userService.getUserByUid(usuario.uid).pipe(
            map((userVault) => {
              if (userVault) {
                return { user: usuario, userVault: userVault };
              } else {
                return { user: null, userVault: null };
              }
            }),
            catchError(() => {
              return of({ user: null, userVault: null });
            })
          );
        } else {
          return of({ user: null, userVault: null });
        }
      }),
      catchError(() => {
        return of({ user: null, userVault: null });
      })
    );
  }

  getUserVault(): Observable<UserVault | null> {
    return this.getUserDataAuth().pipe(
      map(data => data.userVault)
    );
  }

  updateUserVault(userVault: UserVault): Promise<void> {
    return this.userService.updateUser(userVault.id, userVault);
  }
}
