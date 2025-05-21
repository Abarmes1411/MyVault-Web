import {UserReview} from './UserReview.model';
import {CustomList} from './CustomList.model';

export class UserVault {
  id: string;
  name: string;
  surname: string;
  username: string;
  email: string;
  profilePic: string;
  customLists: Map<string, CustomList>;
  friends: Map<string, boolean>;
  userReviews: Map<string, UserReview>;
  myVault: Map<string, string>;

  constructor(
    id: string,
    name: string,
    surname: string,
    username: string,
    email: string,
    profilePic: string = '',
    customLists: Map<string, CustomList> = new Map(),
    friends: Map<string, boolean> = new Map(),
    userReviews: Map<string, UserReview> = new Map(),
    myVault: Map<string, string> = new Map(),
  ) {
    this.id = id;
    this.name = name;
    this.surname = surname;
    this.username = username;
    this.email = email;
    this.profilePic = profilePic;
    this.customLists = customLists;
    this.friends = friends;
    this.userReviews = userReviews;
    this.myVault = myVault;
  }
}
