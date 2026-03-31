
export interface IUser {
    _id:string;
    name:string;
    email:string;
    avatar:string;
    status:string;
    isOnline:boolean;
    lastSeen:string;
    provider:"local"|"google";
    contacts:string[];
    createdAt:string;
    updatedAt:string;
}

export interface IUserUpdate {
    name?:string;
    status?:string;
    avatar?:string;
}