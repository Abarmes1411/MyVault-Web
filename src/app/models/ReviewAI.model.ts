export class ReviewAI {

  contentID:string;
  summaryGenerated:string;
  updateTime:string;

  constructor(contentID:string,summaryGenerated:string,updateTime:string) {
    this.contentID = contentID;
    this.summaryGenerated = summaryGenerated;
    this.updateTime = updateTime;
  }
}
