import { Component } from '@angular/core';
import {CustomlistResumeComponent} from '../../components/customlist-resume/customlist-resume.component';
import {NgForOf, NgIf} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {UserreviewsResumeComponent} from '../../components/userreviews-resume/userreviews-resume.component';
import {UserreviewsService} from '../../services/userreviews.service';

@Component({
  selector: 'app-userreviews',
  imports: [
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    UserreviewsResumeComponent
  ],
  templateUrl: './userreviews.component.html',
  styleUrl: './userreviews.component.css'
})
export class UserreviewsComponent {

  reviewList: any[] = [];


  constructor(private userReviewService: UserreviewsService) {}

  ngOnInit(): void {
    this.loadUserReviews();
  }

  loadUserReviews(): void {
    this.userReviewService.getAllUserReviews().subscribe((data) => {
      this.reviewList = data;
    });
  }

}
