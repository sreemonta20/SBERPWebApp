import { User } from "../models/user";

export class DataResponse {
    Success: boolean;
    Message: string;
    MessageType: number;
    ResponseCode: number;
    Result: any;
  }

  export class UserResponse {
    access_token: string;
    refresh_token: string;
    expires_in:  Date;
    token_type: string;
    error: string;
    error_description: string;
    user: User;
    userMenus: any
  }