export class CustomList {
  userID: string;
  listName: string;
  items:Map<String, String>;

  constructor(userID: string, listName: string, items: Map<String, String>) {
    this.userID = userID;
    this.listName = listName;
    this.items = items;
  }
}
