import {UserReview} from './UserReview.model';
import {CustomList} from './CustomList.model';

export class UserVault {
  id: string;
  name: string;
  surname: string;
  username: string;
  email: string;
  profilePic?: string;
  customLists?: Map<string, CustomList>;
  friends?: Map<string, boolean>;
  userReviews?: Map<string, UserReview>;
  myVault?: Map<string, string>;

  constructor(
    id: string,
    name: string,
    surname: string,
    username: string,
    email: string,
    profilePic?: string,
    customLists?: Map<string, CustomList>,
    friends?: Map<string, boolean>,
    userReviews?: Map<string, UserReview>,
    myVault?: Map<string, string>,
  ) {
    this.id = id;
    this.name = name;
    this.surname = surname;
    this.username = username;
    this.email = email;

    if (profilePic) this.profilePic = profilePic;
    if (customLists) this.customLists = customLists;
    if (friends) this.friends = friends;
    if (userReviews) this.userReviews = userReviews;
    if (myVault) this.myVault = myVault;
  }
}

