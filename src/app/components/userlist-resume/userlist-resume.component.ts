import {Component, Input, OnInit} from '@angular/core';
import {NgIf} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CustomlistsService} from '../../services/customlists.service';
import {RouterLink} from '@angular/router';
import {UserlistsService} from '../../services/userlists.service';

@Component({
  selector: 'app-userlist-resume',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    NgIf
  ],
  templateUrl: './userlist-resume.component.html',
  styleUrl: './userlist-resume.component.css'
})
export class UserlistResumeComponent implements OnInit {
  @Input() userlistInput!: any;
  @Input() contexto!: 'amigos' | 'usuarios';
  userlists: any[] = [];

  constructor(private userlistsService: UserlistsService) {}

  ngOnInit(): void {
    this.userlistsService.getAllUsersFiltered().subscribe((data) => {
      this.userlists = data;
    });
  }



  sendRequest() {
    this.userlistsService.sendFriendRequest(this.userlistInput.id);
    this.userlistInput.solicitudPendiente = true;
  }


}
