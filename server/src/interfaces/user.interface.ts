export interface IUser {
  user_id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: Date;
  role?: string;
}

export interface IUserCreate {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export interface IUserLogin {
  email: string;
  password: string;
}

export interface IUserTokenPayload {
  id: number;
  username: string;
  email: string;
  role?: string;
}