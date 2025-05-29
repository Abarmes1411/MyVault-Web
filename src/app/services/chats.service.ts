import { Injectable } from '@angular/core';
import { Database, ref, set, onValue, push, child, get } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {Message} from '../models/Message.model';

@Injectable({
  providedIn: 'root'
})
export class ChatsService {

  constructor(private db: Database) {}

  createOrGetChat(chatId: string, userIds: string[]) {
    const chatRef = ref(this.db, `chats/${chatId}/users`);

    get(chatRef).then(snapshot => {
      if (!snapshot.exists()) {
        const usersObj: any = {};
        usersObj[userIds[0]] = true;
        usersObj[userIds[1]] = true;
        set(chatRef, usersObj);
      }
    });
  }

  getMessages(chatId: string): Observable<Message[]> {
    const msgRef = ref(this.db, `chats/${chatId}/messages`);
    return new Observable(observer => {
      onValue(msgRef, snapshot => {
        const messages = snapshot.val();
        const msgArray: Message[] = messages
          ? Object.entries(messages).map(([id, msg]: any) => ({ id, ...msg }))
          : [];
        observer.next(msgArray);
      });
    });
  }

  sendTextMessage(chatId: string, userId: string, text: string) {
    const msgRef = ref(this.db, `chats/${chatId}/messages`);
    const newMsgRef = push(msgRef);
    const timestamp = new Date().toISOString();

    const message: Message = {
      type: 'text',
      chatID: chatId,
      userID: userId,
      message: text,
      timestamp: timestamp,
      customList: null
    };

    set(newMsgRef, message);
  }

  sendCustomListMessage(chatId: string, userId: string, customList: any) {
    const msgRef = ref(this.db, `chats/${chatId}/messages`);
    const newMsgRef = push(msgRef);
    const timestamp = new Date().toISOString();

    const message: Message = {
      type: 'custom_list',
      chatID: chatId,
      userID: userId,
      message: '',
      timestamp: timestamp,
      customList: customList
    };

    set(newMsgRef, message);
  }

  getCustomLists(userId: string): Observable<any[]> {
    const listsRef = ref(this.db, `users/${userId}/customLists`);
    return new Observable(observer => {
      onValue(listsRef, snapshot => {
        const lists = snapshot.val();
        const listArray = lists ? Object.entries(lists).map(([id, list]: any) => ({ id, ...list })) : [];
        observer.next(listArray);
      });
    });
  }

  getCustomListById(listId: string): Promise<{ list: any, ownerId: string } | null> {
    const usersRef = ref(this.db, 'users');
    return new Promise((resolve, reject) => {
      get(usersRef)
        .then(snapshot => {
          if (!snapshot.exists()) {
            resolve(null);
            return;
          }

          const users = snapshot.val();

          for (const [userId, userData] of Object.entries(users)) {
            const customLists = (userData as any).customLists;
            if (customLists && customLists[listId]) {
              resolve({
                list: { id: listId, ...customLists[listId] },
                ownerId: userId
              });
              return;
            }
          }

          resolve(null); // No encontrada
        })
        .catch(error => reject(error));
    });
  }


}

