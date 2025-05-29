import {CustomList} from './CustomList.model';

export class Message {
  type: string;
  chatID: string;
  userID: string;
  message: string;
  timestamp: string;
  customList?: CustomList | null;

  constructor(type: string, chatID: string, userID: string, message: string, timestamp: string, customList:CustomList) {
    this.type = type;
    this.chatID = chatID;
    this.userID = userID;
    this.message = message;
    this.timestamp = timestamp;
    this.customList = customList ?? null;
  }
}
