const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface ApiDocument {
  id: string;
  filename: string;
  status: 'parsing' | 'ready' | 'error';
  doc_type?: 'text' | 'image';
  error_message?: string | null;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      // response wasn't JSON — fall back to statusText
    }
    throw new ApiError(res.status, detail);
  }
  // 204 No Content has no body to parse
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function uploadDocument(file: File, token: string): Promise<ApiDocument> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/api/documents`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  return handleResponse<ApiDocument>(res);
}

export async function listDocuments(token: string): Promise<ApiDocument[]> {
  const res = await fetch(`${API_BASE_URL}/api/documents`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return handleResponse<ApiDocument[]>(res);
}

export async function deleteDocument(id: string, token: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  return handleResponse<void>(res);
}

export async function askQuestion(
  documentId: string,
  question: string,
  token: string
): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ document_id: documentId, question }),
  });

  const data = await handleResponse<{ answer: string }>(res);
  return data.answer;
}