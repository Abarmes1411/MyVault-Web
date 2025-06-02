import {Component, OnInit} from '@angular/core';
import {CustomlistResumeComponent} from '../../components/customlist-resume/customlist-resume.component';
import {NgForOf, NgIf} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {UserreviewsResumeComponent} from '../../components/userreviews-resume/userreviews-resume.component';
import {UserreviewsService} from '../../services/userreviews.service';
import {ActivatedRoute} from '@angular/router';

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
export class UserreviewsComponent implements OnInit {
  reviewList: any[] = [];
  username: string = 'Mis Reseñas';
  isOwner: boolean = true;


  constructor(
    private userReviewService: UserreviewsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const userIDFromRoute = this.route.snapshot.paramMap.get('id');
    if (userIDFromRoute) {
      this.loadUserReviews(userIDFromRoute);
      this.loadUsername(userIDFromRoute);
      this.isOwner = false;
    } else {
      this.loadOwnUserReviews();
      this.isOwner = true;
    }
  }

  loadUserReviews(userID: string): void {
    this.userReviewService.getUserReviewsByID(userID).subscribe((data) => {
      this.reviewList = data;
    });
  }

  loadOwnUserReviews(): void {
    this.userReviewService.getAllUserReviews().subscribe((data) => {
      this.reviewList = data;
    });
  }

  loadUsername(userID: string): void {
    this.userReviewService.getUsernameByID(userID).then(name => {
      this.username = `Reseñas de ${name}`;
    }).catch(() => {
      this.username = 'Reseñas del usuario';
    });
  }



}
