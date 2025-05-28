import {Component, OnInit} from '@angular/core';
import {CustomlistResumeComponent} from '../../components/customlist-resume/customlist-resume.component';
import {NgForOf, NgIf} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CustomlistsService} from '../../services/customlists.service';
import {UserlistResumeComponent} from '../../components/userlist-resume/userlist-resume.component';
import {RouterLink} from '@angular/router';

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
export class FriendlistComponent  implements OnInit {

  friendlists: any[] = [];


  constructor(private customlistService: CustomlistsService) {}

  ngOnInit(): void {
    this.loadCustomLists();
  }

  loadCustomLists() {
    this.customlistService.getAllAustomLists().subscribe((data) => {
      this.friendlists = data;
    });
  }

}
