import { apiClient } from './client';

export interface UploadError {
  row: number;
  errors: string[];
  data: Record<string, any>;
}

export interface UploadResult {
  uploadId: string;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: UploadError[];
}

export interface UploadHistory {
  id: string;
  fileName: string;
  fileSize: number;
  rowCount: number;
  successCount: number;
  errorCount: number;
  errors: UploadError[] | null;
  createdAt: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data: UploadResult;
}

export interface UploadHistoryResponse {
  success: boolean;
  data: UploadHistory[];
}

export interface UploadDetailsResponse {
  success: boolean;
  data: UploadHistory;
}

export const uploadLeads = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await apiClient.post<UploadResponse>('/upload/leads', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data;
};

export const getUploadHistory = async (limit: number = 10): Promise<UploadHistoryResponse> => {
  const { data } = await apiClient.get<UploadHistoryResponse>(`/upload/history?limit=${limit}`);
  return data;
};

export const getUploadById = async (id: string): Promise<UploadDetailsResponse> => {
  const { data } = await apiClient.get<UploadDetailsResponse>(`/upload/${id}`);
  return data;
};

// Re-export types for convenience
export type {
  UploadError,
  UploadResult,
  UploadHistory,
  UploadResponse,
  UploadHistoryResponse,
  UploadDetailsResponse,
};
