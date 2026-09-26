import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/User.js";
import Category from "./models/Category.js";
import Supplier from "./models/Supplier.js";
import Product from "./models/Product.js";

const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/warehouse";

async function seed() {
  await mongoose.connect(MONGO_URI);

  // npm run seed -- your@email.com  (або без аргументу — візьме першого admin)
  const adminEmail = process.argv[2];
  const admin = adminEmail
    ? await User.findOne({ email: adminEmail, role: "admin" })
    : await User.findOne({ role: "admin" }).sort({ createdAt: 1 });

  if (!admin) {
    console.error(
      "Не знайдено жодного admin. Спочатку зареєструйся через застосунок, потім: npm run seed -- your@email.com",
    );
    process.exit(1);
  }

  const tenantId = admin._id;
  console.log(`Заповнюю склад для: ${admin.email} (${admin.name})`);

  await Promise.all([
    Category.deleteMany({ tenantId }),
    Supplier.deleteMany({ tenantId }),
    Product.deleteMany({ tenantId }),
  ]);

  const categories = await Category.insertMany([
    {
      name: "Електроніка",
      description: "Побутова та офісна електроніка",
      tenantId,
    },
    { name: "Канцтовари", description: "Ручки, папір, зошити", tenantId },
    { name: "Меблі", description: "Столи, стільці, шафи", tenantId },
    { name: "Будматеріали", description: "Цемент, цегла, фарба", tenantId },
  ]);

  const suppliers = await Supplier.insertMany([
    {
      name: "ТОВ Техно-Плюс",
      phone: "+380671234567",
      email: "sales@techno-plus.ua",
      address: "м. Київ, вул. Промислова, 12",
      tenantId,
    },
    {
      name: "ФОП Іваненко О.П.",
      phone: "+380509876543",
      email: "ivanenko@mail.com",
      address: "м. Львів, вул. Городоцька, 45",
      tenantId,
    },
    {
      name: "ТОВ БудПостач",
      phone: "+380442223344",
      email: "info@budpostach.ua",
      address: "м. Дніпро, пр. Гагаріна, 8",
      tenantId,
    },
  ]);

  const [electronics, stationery, furniture, buildMaterials] = categories;
  const [technoPlus, ivanenko, budPostach] = suppliers;

  await Product.insertMany([
    {
      name: 'Монітор Dell 24"',
      sku: "ELC-001",
      category: electronics._id,
      supplier: technoPlus._id,
      unit: "шт",
      quantity: 15,
      minQuantity: 5,
      price: 6500,
      tenantId,
    },
    {
      name: "Клавіатура механічна",
      sku: "ELC-002",
      category: electronics._id,
      supplier: technoPlus._id,
      unit: "шт",
      quantity: 3,
      minQuantity: 5,
      price: 1200,
      tenantId,
    },
    {
      name: "Ручка кулькова синя",
      sku: "STA-001",
      category: stationery._id,
      supplier: ivanenko._id,
      unit: "уп",
      quantity: 50,
      minQuantity: 10,
      price: 45,
      tenantId,
    },
    {
      name: "Папір А4",
      sku: "STA-002",
      category: stationery._id,
      supplier: ivanenko._id,
      unit: "уп",
      quantity: 8,
      minQuantity: 10,
      price: 180,
      tenantId,
    },
    {
      name: "Стілець офісний",
      sku: "FUR-001",
      category: furniture._id,
      supplier: ivanenko._id,
      unit: "шт",
      quantity: 20,
      minQuantity: 5,
      price: 2200,
      tenantId,
    },
    {
      name: "Цемент М400",
      sku: "BLD-001",
      category: buildMaterials._id,
      supplier: budPostach._id,
      unit: "кг",
      quantity: 500,
      minQuantity: 100,
      price: 3.5,
      tenantId,
    },
  ]);

  console.log(
    `Готово: ${categories.length} категорій, ${suppliers.length} постачальників, 6 товарів.`,
  );
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
