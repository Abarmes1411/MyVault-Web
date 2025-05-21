import { Routes } from '@angular/router';
import {LoginComponent} from './pages/auth/login/login.component';
import {SigninComponent} from './pages/auth/signin/signin.component';

export const routes: Routes = [
  {path: "login", component: LoginComponent},
  {path: "signin", component: SigninComponent},
  {path: "home", component: LoginComponent},
  {path: '', component: LoginComponent},
  {path: '/', component: LoginComponent},
  {path: '**', component: LoginComponent},

];
