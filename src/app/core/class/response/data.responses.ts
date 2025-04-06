import { User } from "../models/user";

export class DataResponse {
    Success: boolean;
    Message: string;
    MessageType: number;
    ResponseCode: number;
    Result: any;
  }

  export class ProfileMenuResponse {
    user: User;
    userMenus: any
  }