import {UserReview} from './UserReview.model';
import {Content} from './Content.model';

export class ReviewWithContentAUX {
  review:UserReview;
  content:Content;

  constructor(review:UserReview, content:Content) {
    this.review = review;
    this.content = content;
  }
}
