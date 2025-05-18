export interface APIResponse<T = unknown> {
  success: boolean;
  message: string;
  errors?: string[];
  data?: T;
}

export interface APIResponseUser extends APIResponse {
    data: {
        email: string;
        name: string;
        userId: string;
    }
}

export interface APIResponseProject<T = unknown> extends APIResponse {
  data: {
    whiteboardTabs: [{yjsUpdate: T}],
    codeTabs: [yjsUpdate: T]
  }
}