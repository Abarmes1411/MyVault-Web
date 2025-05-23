import { Component } from '@angular/core';
import {CustomlistResumeComponent} from '../../components/customlist-resume/customlist-resume.component';
import {CustomlistsService} from '../../services/customlists.service';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-customlist',
  imports: [
    CustomlistResumeComponent,
    NgForOf
  ],
  templateUrl: './customlist.component.html',
  styleUrl: './customlist.component.css'
})
export class CustomlistComponent {


  customlists: any[] = [];

  constructor(private customlistService: CustomlistsService) {}

  ngOnInit(): void {
    this.customlistService.getAllAustomLists().subscribe((data) => {
      this.customlists = data;
    });
  }
}
