import type { IUser } from "./user.types";     
import type { IMessage } from "./message.types";

export interface IChat {
    _id:string;
    chatName:string;
    isGroupChat:boolean;
    users:IUser[];
    latestMessage?:IMessage;
    groupAdmin:IUser[];
    groupAvatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateGroupInput {
  chatName: string;
  users: string[]; // user IDs
}