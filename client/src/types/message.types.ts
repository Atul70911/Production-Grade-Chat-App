import type { IUser } from "./user.types";
import type { IChat } from "./chat.types";

export interface IMessage {
  _id: string;
  sender: IUser;
  chat: IChat | string;
  content: string;
  media?: {
    url: string;
    type: "image" | "video" | "document";
    name?: string;
  };
  readBy: string[];
  status: "sent" | "delivered" | "read";
  replyTo?: IMessage;
  createdAt: string;
  updatedAt: string;
}

export interface ISendMessageInput {
  chatId: string;
  content: string;
  media?: File;
  replyTo?: string;
}