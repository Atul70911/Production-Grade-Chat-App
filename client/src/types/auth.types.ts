import type { IUser } from "./user.types";


export interface ILoginInput{
    email:string;
    password:string;
}

export interface IRegisterInput{
    name:string;
    email:string;
    avatar:string;
    password:string;
    confirmPassword:string;
}
export interface IAuthResponse {
  success: boolean;
  message: string;
  data: {
    user: IUser;
    accessToken: string;
  };
}

export interface IRefreshResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
  };
}