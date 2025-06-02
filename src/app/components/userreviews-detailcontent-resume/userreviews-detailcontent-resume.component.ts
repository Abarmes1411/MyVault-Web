import {Component, Input} from '@angular/core';
import {DatePipe, NgForOf} from '@angular/common';

@Component({
  selector: 'app-userreviews-detailcontent-resume',
  imports: [
    NgForOf,
    DatePipe
  ],
  templateUrl: './userreviews-detailcontent-resume.component.html',
  styleUrl: './userreviews-detailcontent-resume.component.css'
})
export class UserreviewsDetailcontentResumeComponent {
  @Input() reviews!: any;



  getStars(rating: number): string[] {
    const stars: string[] = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push('assets/stars/full_star.PNG');
      } else if (rating >= i - 0.5) {
        stars.push('assets/stars/half_star.PNG');
      } else {
        stars.push('assets/stars/empty_star.png');
      }
    }
    return stars;
  }

}
