import {Component, OnInit} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {RouterLink} from '@angular/router';
import {UserlistResumeComponent} from '../../components/userlist-resume/userlist-resume.component';
import {CustomlistsService} from '../../services/customlists.service';
import {UserlistsService} from '../../services/userlists.service';
import {AuthService} from '../../services/auth.service';
import {combineLatest, map, of, switchMap} from 'rxjs';

@Component({
  selector: 'app-userlist',
  imports: [
    NgForOf,
    NgIf,
    UserlistResumeComponent
  ],
  templateUrl: './userlist.component.html',
  styleUrl: './userlist.component.css'
})
export class UserlistComponent implements OnInit {
  userlists: any[] = [];
  usuarios: any[] = [];
  uidActual: string = '';

  constructor(private userlistsService: UserlistsService, private auth: AuthService) {}

  ngOnInit(): void {
    combineLatest([
      this.userlistsService.getUserId(),
      this.userlistsService.getAllUsersFiltered()
    ]).pipe(
      switchMap(([currentUserId, allUsers]) => {
        if (!currentUserId) return of([]);
        return combineLatest([
          this.userlistsService.getFriendsOf(currentUserId),
          this.userlistsService.getFriendRequestsSentBy(currentUserId)
        ]).pipe(
          map(([myFriends, sentRequests]) => {
            return allUsers
              .filter(user => user.id !== currentUserId) // no mostrarte a ti mismo
              .filter(user => !(user.id in myFriends))    // no mostrar amigos
              .map(user => ({
                ...user,
                solicitudPendiente: sentRequests[user.id] === 'pending'
              }));
          })
        );
      })
    ).subscribe((filteredUsers) => {
      this.userlists = filteredUsers;
    });
  }





}
