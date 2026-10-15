export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export async function api<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    // Sesi habis -> kembali ke login (kecuali sedang proses login itu sendiri)
    if (res.status === 401 && !url.includes("/api/auth/login") && typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new ApiError(data?.message ?? "Terjadi kesalahan", res.status);
  }
  return data as T;
}