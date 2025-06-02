import {Component, Input, OnInit} from '@angular/core';
import {NgIf} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CustomlistsService} from '../../services/customlists.service';
import {RouterLink} from '@angular/router';
import {UserlistsService} from '../../services/userlists.service';
import {RequestsService} from '../../services/requests.service';
import {Auth, getAuth} from '@angular/fire/auth';
import {of, switchMap} from 'rxjs';

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
  @Input() friendIdInput!: any;
  @Input() userlistInput!: any;
  @Input() contexto!: 'amigos' | 'usuarios' | 'peticiones';
  userlists: any[] = [];
  currentUserId: string = '';

  constructor(
    private userlistsService: UserlistsService,
    private requestService: RequestsService,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    this.userlistsService.getAllUsersFiltered().subscribe((data) => {
      this.userlists = data;
    });

    const user = getAuth().currentUser;
    if (user) {
      this.currentUserId = user.uid;
    }
  }

  sendRequest() {
    this.userlistsService.sendFriendRequest(this.userlistInput.id);
    this.userlistInput.solicitudPendiente = true;
  }

  acceptRequest() {
    const senderId = this.userlistInput.id;
    this.requestService.acceptFriendRequest(this.currentUserId, senderId)
      .then(() => {
        console.log('Amistad aceptada con', senderId);
        // Puedes actualizar la vista si quieres eliminar el usuario aceptado
      })
      .catch(err => console.error('Error al aceptar:', err));
  }

  rejectRequest() {
    const senderId = this.userlistInput.id;
    this.requestService.rejectFriendRequest(this.currentUserId, senderId)
      .then(() => {
        console.log('Solicitud rechazada de', senderId);
        // Puedes actualizar la vista si quieres eliminar el usuario rechazado
      })
      .catch(err => console.error('Error al rechazar:', err));
  }

  deleteFriend() {
    const friendId = this.userlistInput.id;
    if (confirm(`¿Estás seguro de que quieres eliminar a este amigo?`)) {
      this.requestService.removeFriend(this.currentUserId, friendId)
        .then(() => {
          console.log('Amigo eliminado:', friendId);
          this.userlistsService.getAllUsersFiltered().subscribe((data) => {
            this.userlists = data;
          });
        })
        .catch(err => console.error('Error al eliminar amigo:', err));
    }
  }


}
