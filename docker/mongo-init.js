// MongoDB initialization script
// Creates the hanami database and a dedicated user

db = db.getSiblingDB("hanami");

db.createUser({
  user: "hanami_app",
  pwd:  "hanami_app_secret",
  roles: [{ role: "readWrite", db: "hanami" }],
});

// Create indexes
db.products.createIndex({ slug: 1 }, { unique: true });
db.products.createIndex({ isActive: 1, price: 1 });
db.products.createIndex({ nameVi: "text", nameEn: "text" });

db.orders.createIndex({ orderNumber: 1 }, { unique: true });
db.orders.createIndex({ customerId: 1, createdAt: -1 });
db.orders.createIndex({ status: 1, createdAt: -1 });

db.customers.createIndex({ email: 1 }, { unique: true });
db.staffusers.createIndex({ email: 1 }, { unique: true });
db.inventorylogs.createIndex({ productId: 1, createdAt: -1 });
db.auditlogs.createIndex({ actorId: 1, createdAt: -1 });
db.auditlogs.createIndex({ resource: 1, resourceId: 1 });

print("Hanami DB initialized");
