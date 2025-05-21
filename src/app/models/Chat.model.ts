import {User} from './UserVault.model';
import {Message} from './Message.model';

export class Chat {
  users: User[];
  messages: Message[];

  constructor(users: User[], messages: Message[]) {
    this.users = users;
    this.messages = messages;
  }
}

