import {User} from './UserVault.model';

export class ReviewWithUserAUX{

  user:User;
  comment:string;
  rating:Number;
  reviewDate:string;


  constructor(user:User, comment:string, rating:Number, reviewDate:string){
    this.user = user;
    this.comment = comment;
    this.rating = rating;
    this.reviewDate = reviewDate;
  }

}
