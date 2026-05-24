import { User } from '@app/core/class/index';

export interface LoggedInUser {
  access_token: string;
  expires_in: number;
  token_type: string;
  error: string;
  error_description: string;
  user: User;
}
