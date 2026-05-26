export type SuggestionStatus = 'New' | 'InProgress' | 'Accepted' | 'Rejected';
export type SuggestionSort = 'createdAt' | 'updatedAt' | 'score';
export type OrderSort = 'asc' | 'desc';
export type VoteType = 'Up' | 'Down';
export type DraftType = 'Suggestion' | 'Comment';
export type ProjectRole = 'Member' | 'Admin';

// -- Shared ----------------------
export interface AuthorRef {
  id: string;
  displayName: string;
}

// -- DTOs ----------------------
export interface UserDto {
  id: string;
  displayName: string;
  email: string;
}

export interface UserListItem {
  id: string;
  displayName: string;
  email: string;
}

export interface CurrentUserResponse extends UserDto {
  authMode: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  user: UserDto;
}

export interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
  user: UserDto;
}

// Черновики
interface SuggestionDraftPayload {
  text: string;
}

interface CommentDraftPayload {
  suggestionId: string;
  parentCommentId: string | null;
  text: string;
}

interface DraftBase {
  id: string;
  projectId: string;
  updatedAt: string;
}

export interface SuggestionDraft extends DraftBase {
  type: 'Suggestion';
  payload: SuggestionDraftPayload;
}

export interface CommentDraft extends DraftBase {
  type: 'Comment';
  payload: CommentDraftPayload;
}

export type DraftDTO = CommentDraft | SuggestionDraft;

export interface ProjectMemberDto {
  userId: string;
  displayName: string;
  email: string;
  role: ProjectRole;
  joinedAt: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  description: string;
  role: ProjectRole;
  lastAccessedAt: string;
  createdByUserId?: string;
  createdAtUtc?: string;
  updatedAtUtc?: string;
}

export interface ProjectVoteSettings {
  votesPerUser: number;
  voteResetPeriodDays: number;
}

export interface CurrentUserVoteQuota {
  votesLimit: number;
  votesRemaining: number;
  nextResetAt: string;
}

export interface ProjectDetails {
  id: string;
  name: string;
  description: string;
  createdByUserId: string;
  createdAt?: string;
  createdAtUtc?: string;
  updatedAtUtc?: string;
  voteSettings: ProjectVoteSettings;
  currentUserVoteQuota: CurrentUserVoteQuota;
  members: ProjectMemberDto[];
}

export interface CommentDto {
  id: string;
  suggestionId: string;
  parentCommentId: string | null;
  text: string;
  author: AuthorRef;
  createdAt: string;
  updatedAt: string;
}

export interface CommentNode extends CommentDto {
  children: CommentNode[];
}

export interface SuggestionSummary {
  currentUserVote: VoteType | null;
  id: string;
  projectId: string;
  text: string;
  status: SuggestionStatus;
  author: AuthorRef;
  score: number;
  createdAt: string;
  updatedAt: string;
}

export interface VoteBreakdownItem {
  userId: string;
  displayName: string;
  voteType: VoteType;
  createdAt: string;
}

export interface SuggestionDetails {
  id: string;
  projectId: string;
  text: string;
  status: SuggestionStatus;
  author: AuthorRef;
  score: number;
  currentUserVote: VoteType | null;
  createdAt: string;
  updatedAt: string;
  votes: VoteBreakdownItem[];
}

// -- Requests ----------------------
export interface CreateProjectRequest {
  name: string;
  description?: string; // ---- уточнили, поле необязательное.
}

export interface AddProjectMemberRequest {
  userId: string;
  role: ProjectRole;
}

export interface UpdateProjectRequest {
  name: string;
  description?: string;
}

export interface UpdateProjectMemberRoleRequest {
  role: ProjectRole;
}

export interface UpdateProjectSettingsRequest {
  votesPerUser: number;
  voteResetPeriodDays: number;
}

export interface CreateSuggestionRequest {
  text: string;
}

export interface UpdateSuggestionRequest {
  text?: string;
  status?: SuggestionStatus;
}

export interface VoteRequest {
  voteType: VoteType;
}

export interface CreateCommentRequest {
  text: string;
  parentCommentId: string | null;
}

export interface UpdateCommentRequest {
  text: string;
}

export interface SaveSuggestionDraftRequest {
  text: string;
}

export interface SaveCommentDraftRequest {
  suggestionId: string;
  parentCommentId: string | null;
  text: string;
}

// -- Error ----------------------
export interface ApiError {
  errorCode: string;
  message: string;
  details: Record<string, unknown>;
}
