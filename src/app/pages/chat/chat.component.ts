import {Component, OnInit} from '@angular/core';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ChatsService} from '../../services/chats.service';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {getAuth} from '@angular/fire/auth';
import {Message} from '../../models/Message.model';


@Component({
  selector: 'app-chat',
  imports: [
    NgForOf,
    NgClass,
    FormsModule,
    NgIf,
    RouterLink
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit {
  messages: Message[] = [];
  newMessage: string = '';
  currentUserId: string = '';
  chatId: string = '';
  otherUserId: string = '';
  customLists: any[] = [];
  selectedListId: string = '';


  constructor(
    private chatService: ChatsService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const user = getAuth().currentUser;
    if (user) {
      this.currentUserId = user.uid;

      this.chatService.getCustomLists(this.currentUserId).subscribe(lists => {
        this.customLists = lists;
        if (lists.length > 0) {
          this.selectedListId = lists[0].id;
        }
      });
    }

    this.route.params.subscribe(params => {
      this.otherUserId = params['id'];
      const ids = [this.currentUserId, this.otherUserId].sort();
      this.chatId = `chat_${ids[0]}_${ids[1]}`;

      this.chatService.createOrGetChat(this.chatId, ids);

      this.chatService.getMessages(this.chatId).subscribe(data => {
        this.messages = data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      });
    });
  }


  sendMessage() {
    if (this.newMessage.trim()) {
      this.chatService.sendTextMessage(this.chatId, this.currentUserId, this.newMessage.trim());
      this.newMessage = '';
    }
  }

  isOwnMessage(msg: Message): boolean {
    return msg.userID === this.currentUserId;
  }

  sendCustomList() {
    const selectedList = this.customLists.find(list => list.id === this.selectedListId);
    if (selectedList) {
      this.chatService.sendCustomListMessage(this.chatId, this.currentUserId, selectedList);
    }
  }

}
