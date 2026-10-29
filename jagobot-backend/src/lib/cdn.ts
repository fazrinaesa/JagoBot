/**
 * Storage CDN Kroombox.
 *
 * Alur: upload multipart -> dapat fileId (status "processing") -> poll metadata
 * sampai "ready" -> pakai viewUrl publik. API key dikirim via header x-api-key.
 */

const CDN_BASE = (process.env.CDN_BASE_URL || "https://cdn.kroombox.com/api/bridge").replace(/\/$/, "");
const CDN_KEY = process.env.CDN_API_KEY || "";
const CDN_PROJECT_ID = process.env.CDN_PROJECT_ID || "";
const CDN_TIMEOUT_MS = Number(process.env.CDN_TIMEOUT_MS || 30000);

export const isCdnConfigured = () => Boolean(CDN_KEY);

const cdnHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = { "x-api-key": CDN_KEY };
  // Project scoping hanya diperlukan bila memakai JWT; API key sudah terikat project.
  if (CDN_PROJECT_ID && !CDN_KEY) headers["x-project-id"] = CDN_PROJECT_ID;
  return headers;
};

type CdnAsset = {
  id: string;
  status: string;
  viewUrl?: string;
  url?: string;
  signedUrl?: string;
};

const fetchAsset = async (fileId: string): Promise<CdnAsset> => {
  const response = await fetch(`${CDN_BASE}/files/${fileId}`, {
    headers: cdnHeaders(),
    signal: AbortSignal.timeout(CDN_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`CDN metadata gagal (${response.status})`);
  return (await response.json()) as CdnAsset;
};

const waitUntilReady = async (fileId: string, attempts = 12, delayMs = 1500): Promise<CdnAsset> => {
  for (let i = 0; i < attempts; i += 1) {
    const asset = await fetchAsset(fileId);
    if (asset.status === "ready") return asset;
    if (asset.status === "failed") throw new Error("CDN gagal memproses berkas");
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  throw new Error("CDN belum selesai memproses berkas");
};

export type UploadedAsset = { id: string; url: string };

/**
 * Unggah buffer ke CDN dan kembalikan URL publik (viewUrl absolut).
 * `folderName` hanya untuk penamaan berkas agar mudah dilacak di dashboard.
 */
export const uploadToCdn = async (
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<UploadedAsset> => {
  if (!isCdnConfigured()) throw new Error("CDN_API_KEY belum dikonfigurasi");

  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(buffer)], { type: mimeType }), fileName);

  const response = await fetch(`${CDN_BASE}/upload`, {
    method: "POST",
    headers: cdnHeaders(),
    body: form,
    signal: AbortSignal.timeout(CDN_TIMEOUT_MS),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`CDN upload gagal (${response.status}) ${detail.slice(0, 120)}`);
  }

  const payload = (await response.json()) as { fileId?: string; id?: string };
  const fileId = payload.fileId || payload.id;
  if (!fileId) throw new Error("CDN tidak mengembalikan fileId");

  const asset = await waitUntilReady(fileId);
  const viewUrl = asset.viewUrl || `/api/bridge/view/${fileId}`;
  const absoluteUrl = viewUrl.startsWith("http") ? viewUrl : `${CDN_BASE.replace(/\/api\/bridge$/, "")}${viewUrl}`;

  return { id: fileId, url: absoluteUrl };
};

/** Normalisasi URL lama (/uploads/...) atau absolut agar konsisten dipakai frontend. */
export const resolveAssetUrl = (value?: string | null): string | null => {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/uploads/")) return value;
  return value;
};
