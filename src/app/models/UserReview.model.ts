
export class UserReview {
  contentID: string;
  userID: string;
  rating: number;
  comment: string;
  reviewDate: string;

  constructor(contentID: string, userID: string, rating: number, comment: string, reviewDate: string) {
    this.contentID = contentID;
    this.userID = userID;
    this.rating = rating;
    this.comment = comment;
    this.reviewDate = reviewDate;
  }
}
