import {Component, OnInit} from '@angular/core';
import {CustomlistResumeComponent} from '../../components/customlist-resume/customlist-resume.component';
import {NgForOf, NgIf} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CustomlistsService} from '../../services/customlists.service';
import {UserlistResumeComponent} from '../../components/userlist-resume/userlist-resume.component';
import {RouterLink} from '@angular/router';
import {of, switchMap} from 'rxjs';
import {UserlistsService} from '../../services/userlists.service';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-friendlist',
  imports: [
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    FormsModule,
    UserlistResumeComponent,
    RouterLink
  ],
  templateUrl: './friendlist.component.html',
  styleUrl: './friendlist.component.css'
})
export class FriendlistComponent implements OnInit {

  friendlists: any[] = [];

  constructor(private userlistsService: UserlistsService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadFriends();
  }

  loadFriends() {
    this.authService.getUserDataAuth().pipe(
      switchMap(userData => {
        const uid = userData.user?.uid;
        if (!uid) return of([]);
        return this.userlistsService.getFriendsData(uid);
      })
    ).subscribe(friends => {
      this.friendlists = friends;
    });
  }
}
