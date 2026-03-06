import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import { OrderModel, CustomerModel, ProductModel } from "@hanami/db";
import { verifyAdminToken } from "../lib/jwt";

function requirePermission(permission: string) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) return reply.status(401).send({ success: false, error: "Unauthorized" });
    try {
      const payload = verifyAdminToken(auth.slice(7));
      if (!payload.permissions.includes(permission)) {
        return reply.status(403).send({ success: false, error: "Không có quyền" });
      }
      (req as FastifyRequest & { staff: typeof payload }).staff = payload;
    } catch {
      return reply.status(401).send({ success: false, error: "Token không hợp lệ" });
    }
  };
}

const adminDashboardRoutes: FastifyPluginAsync = async (fastify) => {

  // ── GET /admin/dashboard/stats ──────────────────────────────────────────────
  fastify.get("/stats", { preHandler: [requirePermission("analytics:read")] }, async (req, reply) => {
    const { range = "7d" } = req.query as { range?: string };

    const daysMap: Record<string, number> = { "1d": 1, "7d": 7, "30d": 30, "90d": 90 };
    const days = daysMap[range] ?? 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      totalOrders,
      revenueAgg,
      newCustomers,
      pendingOrders,
      lowStockProducts,
      recentOrders,
      ordersByStatus,
      revenueByDay,
    ] = await Promise.all([
      OrderModel.countDocuments({ createdAt: { $gte: since }, status: { $nin: ["cancelled"] } }),

      OrderModel.aggregate([
        { $match: { createdAt: { $gte: since }, status: { $nin: ["cancelled", "refunded"] } } },
        { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
      ]),

      CustomerModel.countDocuments({ createdAt: { $gte: since } }),

      OrderModel.countDocuments({ status: "pending" }),

      ProductModel.find({ isActive: true, stock: { $lte: 5 } })
        .select("nameVi nameEn slug stock")
        .lean(),

      OrderModel.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .select("orderNumber shippingAddress.name total status paymentMethod createdAt")
        .lean(),

      OrderModel.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      OrderModel.aggregate([
        { $match: { createdAt: { $gte: since }, status: { $nin: ["cancelled", "refunded"] } } },
        {
          $group: {
            _id:     { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$total" },
            orders:  { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const revenue    = revenueAgg[0]?.total ?? 0;
    const avgOrder   = totalOrders > 0 ? revenue / totalOrders : 0;

    return reply.send({
      success: true,
      data: {
        kpis: {
          revenue,
          totalOrders,
          avgOrderValue: Math.round(avgOrder),
          newCustomers,
          pendingOrders,
        },
        revenueByDay,
        ordersByStatus: Object.fromEntries(
          ordersByStatus.map((s: { _id: string; count: number }) => [s._id, s.count])
        ),
        lowStockProducts,
        recentOrders,
      },
    });
  });

  // ── GET /admin/dashboard/revenue ────────────────────────────────────────────
  fastify.get("/revenue", { preHandler: [requirePermission("analytics:read")] }, async (req, reply) => {
    const { from, to, groupBy = "day" } = req.query as Record<string, string>;

    const dateFormat = groupBy === "month" ? "%Y-%m" : "%Y-%m-%d";

    const match: Record<string, unknown> = {
      status: { $nin: ["cancelled", "refunded"] },
    };
    if (from || to) {
      match.createdAt = {
        ...(from ? { $gte: new Date(from) } : {}),
        ...(to   ? { $lte: new Date(to)   } : {}),
      };
    }

    const data = await OrderModel.aggregate([
      { $match: match },
      {
        $group: {
          _id:     { $dateToString: { format: dateFormat, date: "$createdAt" } },
          revenue: { $sum: "$total" },
          orders:  { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return reply.send({ success: true, data });
  });
};

export default adminDashboardRoutes;
