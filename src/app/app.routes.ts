import { Routes } from '@angular/router';
import {LoginComponent} from './pages/auth/login/login.component';
import {SigninComponent} from './pages/auth/signin/signin.component';
import {AuthGuard} from './guards/auth.guard';
import {HomeComponent} from './pages/home/home.component';
import {MoviesComponent} from './components/dashboard/movies/movies.component';
import {ShowsComponent} from './components/dashboard/shows/shows.component';
import {GamesComponent} from './components/dashboard/games/games.component';
import {AnimesComponent} from './components/dashboard/animes/animes.component';
import {MangasNovelsComponent} from './components/dashboard/mangas-novels/mangas-novels.component';
import {ProfileEditComponent} from './pages/profile-edit/profile-edit.component';
import {CustomlistComponent} from './pages/customlist/customlist.component';
import {CustomlistDetailComponent} from './pages/customlist-detail/customlist-detail.component';
import {MyVaultComponent} from './pages/myvault/myvault.component';
import {UserreviewsComponent} from './pages/userreviews/userreviews.component';
import {FriendlistComponent} from './pages/friendlist/friendlist.component';
import {UserlistComponent} from './pages/userlist/userlist.component';
import {RequestsComponent} from './pages/requests/requests.component';
import {ChatComponent} from './pages/chat/chat.component';
import {DetailContentComponent} from './pages/detail-content/detail-content.component';

export const routes: Routes = [
  {path: "login", component: LoginComponent},
  {path: "signin", component: SigninComponent},
  {path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  {path: 'contents/movies', component: MoviesComponent, canActivate: [AuthGuard] },
  {path: 'contents/shows', component: ShowsComponent, canActivate: [AuthGuard] },
  {path: 'contents/games', component: GamesComponent, canActivate: [AuthGuard] },
  {path: 'contents/animes', component: AnimesComponent, canActivate: [AuthGuard] },
  {path: 'profile', component: ProfileEditComponent, canActivate: [AuthGuard] },
  {path: 'contents/mangas_novels', component: MangasNovelsComponent, canActivate: [AuthGuard] },
  {path: 'customlists', component: CustomlistComponent, canActivate: [AuthGuard] },
  {path: 'customlists-detail/:id', component: CustomlistDetailComponent, canActivate: [AuthGuard] },
  {path: 'customlists-detail/:ownerID/:listID', component: CustomlistDetailComponent, canActivate: [AuthGuard] },
  {path: 'myvault', component: MyVaultComponent, canActivate: [AuthGuard] },
  {path: 'userreviews', component: UserreviewsComponent, canActivate: [AuthGuard] },
  {path: 'friends', component: FriendlistComponent, canActivate: [AuthGuard] },
  {path: 'userlist', component: UserlistComponent, canActivate: [AuthGuard] },
  {path: 'friends/requests', component: RequestsComponent, canActivate: [AuthGuard] },
  {path: 'chat/:id', component: ChatComponent, canActivate: [AuthGuard] },
  {path: 'detail-content/:id', component: DetailContentComponent, canActivate: [AuthGuard] }


];
