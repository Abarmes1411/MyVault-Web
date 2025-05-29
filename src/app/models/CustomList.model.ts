export class CustomList {
  id: string;
  userID: string;
  listName: string;
  items:Map<String, String>;

  constructor(id:string, userID: string, listName: string, items: Map<String, String>) {
    this.id = id;
    this.userID = userID;
    this.listName = listName;
    this.items = items;
  }
}
