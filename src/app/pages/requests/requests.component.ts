import {Component, OnInit} from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";
import {UserlistResumeComponent} from "../../components/userlist-resume/userlist-resume.component";
import {UserlistsService} from '../../services/userlists.service';
import {AuthService} from '../../services/auth.service';
import {of, switchMap} from 'rxjs';
import {RequestsService} from '../../services/requests.service';
import {Database, ref, remove, update} from '@angular/fire/database';

@Component({
  selector: 'app-requests',
    imports: [
        NgForOf,
        NgIf,
        UserlistResumeComponent
    ],
  templateUrl: './requests.component.html',
  styleUrl: './requests.component.css'
})
export class RequestsComponent implements OnInit {

  requests: any[] = [];

  constructor(private requestService: RequestsService, private authService: AuthService, private database:Database) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests() {
    this.authService.getUserDataAuth().pipe(
      switchMap(userData => {
        const uid = userData.user?.uid;
        if (!uid) return of([]);
        return this.requestService.getRequestData(uid);
      })
    ).subscribe(requests => {
      this.requests = requests;
    });
  }

}
