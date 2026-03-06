/**
 * Typed API client for the Hanami admin dashboard.
 * All requests go to apps/api via NEXT_PUBLIC_API_URL.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error ?? `HTTP ${res.status}`);
  }
  return json.data as T;
}

export const api = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  login: (email: string, password: string) =>
    request<{ requires2FA: boolean; tempToken?: string; accessToken?: string }>(
      "/admin/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }
    ),

  verifyTotp: (tempToken: string, totpCode: string) =>
    request<{ accessToken: string }>(
      "/admin/auth/totp/verify", { method: "POST", body: JSON.stringify({ tempToken, totpCode }) }
    ),

  // ── Dashboard ─────────────────────────────────────────────────────────────
  getStats: (range = "7d") =>
    request<AdminStats>(`/admin/dashboard/stats?range=${range}`),

  getRevenue: (from?: string, to?: string, groupBy = "day") =>
    request<RevenuePoint[]>(
      `/admin/dashboard/revenue?${new URLSearchParams({ ...(from ? { from } : {}), ...(to ? { to } : {}), groupBy }).toString()}`
    ),

  // ── Orders ────────────────────────────────────────────────────────────────
  getOrders: (params: Record<string, string> = {}) =>
    request<PaginatedOrders>(`/admin/orders?${new URLSearchParams(params).toString()}`),

  getOrder: (id: string) =>
    request<AdminOrder>(`/admin/orders/${id}`),

  updateOrderStatus: (id: string, status: string, staffNote?: string) =>
    request<AdminOrder>(`/admin/orders/${id}/status`, {
      method: "PUT", body: JSON.stringify({ status, staffNote }),
    }),

  updateTracking: (id: string, trackingCode: string) =>
    request<AdminOrder>(`/admin/orders/${id}/tracking`, {
      method: "PUT", body: JSON.stringify({ trackingCode }),
    }),

  // ── Products ──────────────────────────────────────────────────────────────
  getProducts: (params: Record<string, string> = {}) =>
    request<PaginatedProducts>(`/admin/products?${new URLSearchParams(params).toString()}`),

  createProduct: (data: unknown) =>
    request<AdminProduct>("/admin/products", { method: "POST", body: JSON.stringify(data) }),

  updateProduct: (id: string, data: unknown) =>
    request<AdminProduct>(`/admin/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  deactivateProduct: (id: string) =>
    request<{ deactivated: boolean }>(`/admin/products/${id}`, { method: "DELETE" }),

  uploadImage: async (file: File): Promise<{ url: string }> => {
    const token = getToken();
    const form  = new FormData();
    form.append("file", file);
    const res  = await fetch(`${BASE}/admin/upload`, {
      method:  "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body:    form,
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error ?? `HTTP ${res.status}`);
    return json.data as { url: string };
  },

  // ── Customers ─────────────────────────────────────────────────────────────
  getCustomers: (params: Record<string, string> = {}) =>
    request<PaginatedCustomers>(`/admin/customers?${new URLSearchParams(params).toString()}`),

  patchCustomerStatus: (id: string, isActive: boolean) =>
    request<AdminCustomer>(`/admin/customers/${id}/status`, {
      method: "PATCH", body: JSON.stringify({ isActive }),
    }),

  // ── Inventory ─────────────────────────────────────────────────────────────
  getInventoryLogs: (params: Record<string, string> = {}) =>
    request<PaginatedInventory>(`/admin/inventory?${new URLSearchParams(params).toString()}`),

  getLowStock: () =>
    request<{ _id: string; nameVi: string; slug: string; stock: number }[]>("/admin/inventory/low-stock"),

  // ── Coupons ───────────────────────────────────────────────────────────────
  getCoupons: (params: Record<string, string> = {}) =>
    request<PaginatedCoupons>(`/admin/coupons?${new URLSearchParams(params).toString()}`),

  createCoupon: (data: unknown) =>
    request<AdminCoupon>("/admin/coupons", { method: "POST", body: JSON.stringify(data) }),

  updateCoupon: (id: string, data: unknown) =>
    request<AdminCoupon>(`/admin/coupons/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  deleteCoupon: (id: string) =>
    request<null>(`/admin/coupons/${id}`, { method: "DELETE" }),

  // ── Audit ─────────────────────────────────────────────────────────────────
  getAuditLogs: (params: Record<string, string> = {}) =>
    request<PaginatedAudit>(`/admin/audit?${new URLSearchParams(params).toString()}`),

  // ── Consultations ─────────────────────────────────────────────────────────
  getConsultations: (params: Record<string, string> = {}) =>
    request<PaginatedConsultations>(`/admin/consultations?${new URLSearchParams(params).toString()}`),

  updateConsultationStatus: (id: string, status: string, staffNote?: string) =>
    request<AdminConsultation>(`/admin/consultations/${id}/status`, {
      method: "PATCH",
      body:   JSON.stringify({ status, ...(staffNote !== undefined ? { staffNote } : {}) }),
    }),
};

// ─── Response types ───────────────────────────────────────────────────────────

export interface AdminStats {
  kpis: {
    revenue:       number;
    totalOrders:   number;
    avgOrderValue: number;
    newCustomers:  number;
    pendingOrders: number;
  };
  revenueByDay:     RevenuePoint[];
  ordersByStatus:   Record<string, number>;
  lowStockProducts: { _id: string; nameVi: string; slug: string; stock: number }[];
  recentOrders:     AdminOrder[];
}

export interface RevenuePoint {
  _id:     string;
  revenue: number;
  orders:  number;
}

export interface AdminOrder {
  _id:            string;
  orderNumber:    string;
  shippingAddress: { name: string; phone: string; full: string };
  items:          { nameVi: string; qty: number; unitPrice: number; subtotal: number; gradient: string; petals: number }[];
  status:         string;
  paymentMethod:  string;
  paymentStatus:  string;
  total:          number;
  shippingFee:    number;
  discount:       number;
  trackingCode?:  string;
  staffNote?:     string;
  note?:          string;
  statusHistory:  { status: string; at: string; note?: string }[];
  createdAt:      string;
}

export interface AdminProduct {
  _id:           string;
  slug:          string;
  nameVi:        string;
  nameEn:        string;
  price:         number;
  originalPrice?: number;
  tag?:          string;
  gradient?:     string;
  imageUrl?:     string;
  petals:        number;
  stock:         number;
  isActive:      boolean;
  createdAt:     string;
}

export interface PaginatedOrders {
  items: AdminOrder[]; total: number; page: number; limit: number; pages: number;
}
export interface PaginatedProducts {
  items: AdminProduct[]; total: number; page: number; limit: number; pages: number;
}

export interface AdminCustomer {
  _id:        string;
  email:      string;
  name:       string;
  phone:      string;
  isVerified: boolean;
  isActive:   boolean;
  createdAt:  string;
}
export interface PaginatedCustomers {
  items: AdminCustomer[]; total: number; page: number; limit: number; pages: number;
}

export interface InventoryLog {
  _id:        string;
  productId:  string;
  delta:      number;
  reason:     string;
  stockAfter: number;
  orderId?:   string;
  staffId?:   string;
  note?:      string;
  createdAt:  string;
}
export interface PaginatedInventory {
  items: InventoryLog[]; total: number; page: number; limit: number; pages: number;
}

export interface AdminCoupon {
  _id:        string;
  code:       string;
  type:       "percent" | "fixed" | "free_shipping";
  value:      number;
  minOrder:   number;
  usageLimit: number;
  usedCount:  number;
  expiresAt?: string;
  isActive:   boolean;
  createdAt:  string;
}
export interface PaginatedCoupons {
  items: AdminCoupon[]; total: number; page: number; limit: number; pages: number;
}

export interface AuditLog {
  _id:        string;
  actorId:    string;
  actorType:  string;
  actorName:  string;
  action:     string;
  resource:   string;
  resourceId: string;
  diff?:      unknown;
  ip?:        string;
  createdAt:  string;
}
export interface PaginatedAudit {
  items: AuditLog[]; total: number; page: number; limit: number; pages: number;
}

export interface AdminConsultation {
  _id:           string;
  name:          string;
  email:         string;
  deliveryDate?: string;
  message:       string;
  status:        "new" | "contacted" | "done";
  staffNote?:    string;
  createdAt:     string;
}
export interface PaginatedConsultations {
  items: AdminConsultation[]; total: number; page: number; limit: number; pages: number;
}
