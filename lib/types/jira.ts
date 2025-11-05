export interface JiraInstance {
  id: string;
  name: string;
  url: string;
  scopes: string[];
  avatarUrl: string;
}

export interface AtlassianResource {
  id: string;
  name: string;
  url: string;
  scopes?: string[];
  avatarUrl?: string;
}
