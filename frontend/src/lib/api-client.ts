import { useAuthStore } from "@/stores/auth-store";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

export type RequestOptions = Omit<RequestInit, "method" | "body"> & {
  params?: Record<string, string | number | boolean>;
};

export class ApiError extends Error {
  constructor(
    public status: number,
    public data: unknown,
  ) {
    super(`API Error ${status}`);
  }
}

function prepareBody(body: unknown): {
  fetchBody: BodyInit | undefined;
  contentType: string | undefined;
} {
  if (body == null) return { fetchBody: undefined, contentType: undefined };
  if (body instanceof FormData) return { fetchBody: body, contentType: undefined };
  if (body instanceof Blob) return { fetchBody: body, contentType: body.type || "application/octet-stream" };
  return { fetchBody: JSON.stringify(body), contentType: "application/json" };
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> {
  const resolvedUrl = BASE_URL.startsWith("http")
    ? new URL(`${BASE_URL}${path}`).toString()
    : `${BASE_URL}${path}`;

  if (options?.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([k, v]) =>
      searchParams.set(k, String(v)),
    );
    resolvedUrl += (resolvedUrl.includes("?") ? "&" : "?") + searchParams.toString();
  }

  const { fetchBody, contentType } = prepareBody(body);
  const { params: _unused, ...fetchOptions } = options ?? {};
  void _unused;

  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = {
    ...(contentType && { "Content-Type": contentType }),
    ...Object.fromEntries(new Headers(options?.headers).entries()),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(resolvedUrl, {
    ...fetchOptions,
    method,
    headers,
    body: fetchBody,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, data);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const apiClient = {
  get: <T>(path: string, opts?: RequestOptions) =>
    request<T>("GET", path, undefined, opts),

  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>("POST", path, body, opts),

  put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>("PUT", path, body, opts),

  delete: <T>(path: string, opts?: RequestOptions) =>
    request<T>("DELETE", path, undefined, opts),
};