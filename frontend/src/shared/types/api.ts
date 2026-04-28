export interface AuthResponce {
  accessToken: string;
  expiresIn: number;
  user: {
    id: string;
    displayName: string;
    email: string;
  };
}

export interface refreshResponce {
  accessToken: string;
  expiresIn: number;
}
