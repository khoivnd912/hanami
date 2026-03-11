export { connectDB, disconnectDB, mongoose } from "./connection";

export { ProductModel }      from "./models/Product";
export { CustomerModel }     from "./models/Customer";
export { OrderModel }        from "./models/Order";
export { StaffUserModel }    from "./models/StaffUser";
export { InventoryLogModel } from "./models/InventoryLog";
export { AuditLogModel }     from "./models/AuditLog";
export { CouponModel }        from "./models/Coupon";
export { ConsultationModel }  from "./models/Consultation";
export { SiteContentModel }   from "./models/SiteContent";
export { CounterModel }       from "./models/Counter";

export type { ProductDocument }      from "./models/Product";
export type { CustomerDocument }     from "./models/Customer";
export type { OrderDocument }        from "./models/Order";
export type { StaffDocument }        from "./models/StaffUser";
export type { InventoryLogDocument, InventoryReason } from "./models/InventoryLog";
export type { AuditLogDocument, ActorType }           from "./models/AuditLog";
export type { CouponDocument, CouponType }            from "./models/Coupon";
export type { ConsultationDocument, ConsultationStatus } from "./models/Consultation";
export type { SiteContentDocument, AboutLang, FooterContent, ContactInfo, GalleryItem, FeatureItem, TestimonialItem } from "./models/SiteContent";
