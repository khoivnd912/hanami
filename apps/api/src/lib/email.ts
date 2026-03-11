import { Resend } from "resend";
import type { OrderDocument } from "@hanami/db";

const resend = new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");
const FROM   = process.env.EMAIL_FROM ?? "Hanami <no-reply@hanami.vn>";

// ─── Order confirmation ───────────────────────────────────────────────────────

export async function sendOrderConfirmation(
  to: string,
  order: OrderDocument
): Promise<void> {
  const itemRows = order.items.map((item) =>
    `<tr>
      <td style="padding:8px 0; border-bottom:1px solid #f9d5e2;">${item.nameVi}</td>
      <td style="padding:8px 0; border-bottom:1px solid #f9d5e2; text-align:center;">x${item.qty}</td>
      <td style="padding:8px 0; border-bottom:1px solid #f9d5e2; text-align:right;">
        ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.subtotal)}
      </td>
    </tr>`
  ).join("");

  const fmt = (n: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Hanami ✿ Xác nhận đơn hàng ${order.orderNumber}`,
    html: `
      <div style="font-family:'Lato',sans-serif; max-width:560px; margin:0 auto; color:#8a3050;">
        <div style="background:linear-gradient(135deg,#e8859a,#d96b82); padding:32px; text-align:center;">
          <h1 style="color:white; font-family:serif; font-weight:300; margin:0; font-size:28px;">
            Cảm ơn bạn đã đặt hàng ✿
          </h1>
        </div>
        <div style="padding:32px; background:#fef5f7;">
          <p style="margin-top:0;">Đơn hàng <strong>${order.orderNumber}</strong> của bạn đã được xác nhận.</p>
          <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
            <thead>
              <tr style="border-bottom:2px solid #d96b82;">
                <th style="text-align:left; padding-bottom:8px; font-size:11px; letter-spacing:0.1em; text-transform:uppercase;">Sản phẩm</th>
                <th style="text-align:center; padding-bottom:8px; font-size:11px;">SL</th>
                <th style="text-align:right; padding-bottom:8px; font-size:11px;">Thành tiền</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>
          <div style="text-align:right; border-top:2px solid #d96b82; padding-top:12px;">
            <p style="margin:4px 0; font-size:13px;">Phí vận chuyển: <strong>${fmt(order.shippingFee)}</strong></p>
            <p style="margin:4px 0; font-size:16px; color:#c05070;">
              Tổng thanh toán: <strong>${fmt(order.total)}</strong>
            </p>
          </div>
          <div style="margin-top:24px; padding:16px; background:#fef5f7; border-radius:8px; font-size:13px;">
            <p style="margin:0 0 4px;"><strong>Giao đến:</strong></p>
            <p style="margin:0;">${order.shippingAddress.full}</p>
            <p style="margin:4px 0 0;">📞 ${order.shippingAddress.phone}</p>
          </div>
          <p style="margin-top:24px; font-size:13px; color:#888;">
            Phương thức thanh toán: ${order.paymentMethod === "cod" ? "Thanh toán khi nhận hàng" : order.paymentMethod.toUpperCase()}
          </p>
        </div>
        <div style="padding:16px; background:#fae8ee; text-align:center; font-size:11px; color:#c05070;">
          Hanami — Đèn hoa cưới thủ công · hanami.vn
        </div>
      </div>
    `,
  });
}

// ─── Dispatch notification ────────────────────────────────────────────────────

export async function sendDispatchNotification(
  to: string,
  orderNumber: string,
  trackingCode: string
): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Hanami ✿ Đơn hàng ${orderNumber} đang trên đường giao`,
    html: `
      <div style="font-family:'Lato',sans-serif; max-width:560px; margin:0 auto; color:#8a3050; padding:32px; background:#fef5f7;">
        <h2 style="font-family:serif; font-weight:300; color:#c05070;">Đơn hàng đang được vận chuyển ✿</h2>
        <p>Đơn hàng <strong>${orderNumber}</strong> của bạn đã được bàn giao cho đơn vị vận chuyển.</p>
        <p>Mã vận đơn: <strong style="color:#d96b82; font-size:18px;">${trackingCode}</strong></p>
        <p style="font-size:13px; color:#888;">Vui lòng theo dõi đơn hàng qua trang web của đơn vị vận chuyển.</p>
      </div>
    `,
  });
}

// ─── Consultation notification (to owner) ────────────────────────────────────

export async function sendConsultationNotification(data: {
  name:          string;
  email:         string;
  deliveryDate?: string;
  message:       string;
}): Promise<void> {
  const ownerEmail = process.env.OWNER_EMAIL;
  if (!ownerEmail) return;

  await resend.emails.send({
    from:    FROM,
    to:      ownerEmail,
    replyTo: data.email,
    subject: `[Hanami] Yêu cầu tư vấn mới từ ${data.name}`,
    html: `
      <div style="font-family:'Lato',sans-serif; max-width:560px; margin:0 auto; color:#8a3050;">
        <div style="background:linear-gradient(135deg,#e8859a,#d96b82); padding:28px 32px; text-align:center;">
          <h1 style="color:white; font-family:serif; font-weight:300; margin:0; font-size:24px;">
            ✿ Yêu cầu tư vấn hoa mới
          </h1>
        </div>
        <div style="padding:32px; background:#fef5f7; border:1px solid #f9d5e2;">
          <table style="width:100%; border-collapse:collapse;">
            <tr>
              <td style="padding:10px 0; border-bottom:1px solid #f9d5e2; width:140px;">
                <span style="font-size:11px; text-transform:uppercase; letter-spacing:0.1em; color:#9ca3af; font-weight:600;">Họ và tên</span>
              </td>
              <td style="padding:10px 0; border-bottom:1px solid #f9d5e2;">
                <strong>${data.name}</strong>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0; border-bottom:1px solid #f9d5e2;">
                <span style="font-size:11px; text-transform:uppercase; letter-spacing:0.1em; color:#9ca3af; font-weight:600;">Email</span>
              </td>
              <td style="padding:10px 0; border-bottom:1px solid #f9d5e2;">
                <a href="mailto:${data.email}" style="color:#c05070;">${data.email}</a>
              </td>
            </tr>
            ${data.deliveryDate ? `
            <tr>
              <td style="padding:10px 0; border-bottom:1px solid #f9d5e2;">
                <span style="font-size:11px; text-transform:uppercase; letter-spacing:0.1em; color:#9ca3af; font-weight:600;">Ngày giao hoa</span>
              </td>
              <td style="padding:10px 0; border-bottom:1px solid #f9d5e2;">
                ${data.deliveryDate}
              </td>
            </tr>` : ""}
            <tr>
              <td style="padding:10px 0; vertical-align:top;">
                <span style="font-size:11px; text-transform:uppercase; letter-spacing:0.1em; color:#9ca3af; font-weight:600;">Nội dung</span>
              </td>
              <td style="padding:10px 0; font-size:14px; line-height:1.7; color:#374151;">
                ${data.message.replace(/\n/g, "<br>")}
              </td>
            </tr>
          </table>
          <div style="margin-top:24px; text-align:center;">
            <a href="${process.env.ADMIN_URL ?? "http://localhost:3001"}/dashboard/consultations"
              style="display:inline-block; padding:12px 28px; background:linear-gradient(135deg,#e8859a,#d96b82); color:white; text-decoration:none; border-radius:24px; font-size:13px; font-weight:600; letter-spacing:0.05em;">
              Xem trong Admin →
            </a>
          </div>
        </div>
        <div style="padding:14px; background:#fae8ee; text-align:center; font-size:11px; color:#c05070;">
          Hanami — Đèn hoa cưới thủ công · hanami.vn
        </div>
      </div>
    `,
  });
}

// ─── Low stock alert (to owner) ───────────────────────────────────────────────

export async function sendLowStockAlert(
  productName: string,
  stock: number
): Promise<void> {
  const ownerEmail = process.env.OWNER_EMAIL;
  if (!ownerEmail) return;

  await resend.emails.send({
    from: FROM,
    to:   ownerEmail,
    subject: `[Hanami] Cảnh báo tồn kho thấp: ${productName}`,
    html: `
      <p style="font-family:sans-serif;">
        Sản phẩm <strong>${productName}</strong> hiện còn <strong style="color:red;">${stock}</strong> sản phẩm trong kho.
        Vui lòng bổ sung hàng sớm.
      </p>
    `,
  });
}
