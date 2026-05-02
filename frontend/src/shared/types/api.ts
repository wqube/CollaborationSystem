export interface AuthResponse {
  accessToken: string;
  expiresIn: number;
  user: {
    id: string;
    displayName: string;
    email: string;
  };
}

export interface refreshResponse {
  accessToken: string;
  expiresIn: number;
}
