import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Category from "./models/Category.js";
import Supplier from "./models/Supplier.js";
import Location from "./models/Location.js";
import Product from "./models/Product.js";
import StockMovement from "./models/StockMovement.js";

const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/warehouse";

const id = () => new mongoose.Types.ObjectId();
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

async function seed() {
  await mongoose.connect(MONGO_URI);

  const adminEmail = process.argv[2];
  const admin = adminEmail
    ? await User.findOne({ email: adminEmail.toLowerCase(), role: "admin" })
    : await User.findOne({ role: "admin" }).sort({ createdAt: 1 });

  if (!admin) {
    console.error(
      "Не знайдено жодного admin. Спочатку зареєструйся в застосунку, потім: npm run seed -- your@email.com",
    );
    process.exit(1);
  }

  const tenantId = admin._id;
  console.log(`Заповнюю склад для: ${admin.email} (${admin.name})`);

  await Promise.all([
    StockMovement.deleteMany({ tenantId }),
    Product.deleteMany({ tenantId }),
    Category.deleteMany({ tenantId }),
    Supplier.deleteMany({ tenantId }),
    Location.deleteMany({ tenantId }),
  ]);

  const managerEmail = "manager@test.com";
  const manager =
    (await User.findOne({ email: managerEmail })) ||
    (await User.create({
      name: "Олена Менеджер",
      email: managerEmail,
      password: await bcrypt.hash("123456", 10),
      role: "manager",
      tenantId,
    }));
  const movementUsers = manager.tenantId?.equals(tenantId)
    ? [admin._id, manager._id]
    : [admin._id];

  // ---- Категорії ----
  const cat = {
    electronics: id(),
    stationery: id(),
    furniture: id(),
    building: id(),
    chemistry: id(),
    food: id(),
    tools: id(),
    textile: id(),
  };
  await Category.insertMany([
    {
      _id: cat.electronics,
      name: "Електроніка",
      description: "Побутова та офісна електроніка",
      tenantId,
    },
    {
      _id: cat.stationery,
      name: "Канцтовари",
      description: "Ручки, папір, зошити",
      tenantId,
    },
    {
      _id: cat.furniture,
      name: "Меблі",
      description: "Столи, стільці, шафи",
      tenantId,
    },
    {
      _id: cat.building,
      name: "Будматеріали",
      description: "Цемент, цегла, фарба",
      tenantId,
    },
    {
      _id: cat.chemistry,
      name: "Побутова хімія",
      description: "Засоби для прибирання",
      tenantId,
    },
    {
      _id: cat.food,
      name: "Продукти харчування",
      description: "Вода, кава, снеки для офісу",
      tenantId,
    },
    {
      _id: cat.tools,
      name: "Інструменти",
      description: "Ручний та електроінструмент",
      tenantId,
    },
    {
      _id: cat.textile,
      name: "Текстиль",
      description: "Робочий одяг, рукавиці, спецодяг",
      tenantId,
    },
  ]);

  // ---- Постачальники ----
  const sup = {
    techno: id(),
    ivanenko: id(),
    budpostach: id(),
    chysto: id(),
    melnyk: id(),
    instrumentpro: id(),
  };
  await Supplier.insertMany([
    {
      _id: sup.techno,
      name: "ТОВ Техно-Плюс",
      phone: "+380671234567",
      email: "sales@techno-plus.ua",
      address: "м. Київ, вул. Промислова, 12",
      tenantId,
    },
    {
      _id: sup.ivanenko,
      name: "ФОП Іваненко О.П.",
      phone: "+380509876543",
      email: "ivanenko@mail.com",
      address: "м. Львів, вул. Городоцька, 45",
      tenantId,
    },
    {
      _id: sup.budpostach,
      name: "ТОВ БудПостач",
      phone: "+380442223344",
      email: "info@budpostach.ua",
      address: "м. Дніпро, пр. Гагаріна, 8",
      tenantId,
    },
    {
      _id: sup.chysto,
      name: "ТОВ Чисто-Плюс",
      phone: "+380637778899",
      email: "order@chysto-plus.ua",
      address: "м. Харків, вул. Клочківська, 21",
      tenantId,
    },
    {
      _id: sup.melnyk,
      name: "ФОП Мельник Р.І.",
      phone: "+380664445566",
      email: "melnyk.food@mail.com",
      address: "м. Одеса, вул. Дерибасівська, 5",
      tenantId,
    },
    {
      _id: sup.instrumentpro,
      name: "ТОВ ІнструментПро",
      phone: "+380507771122",
      email: "sales@instrumentpro.ua",
      address: "м. Ужгород, вул. Собранецька, 33",
      tenantId,
    },
  ]);

  // ---- Локації ----
  const loc = {
    main: id(),
    second: id(),
    yard: id(),
    fridge: id(),
    reserve: id(),
  };
  await Location.insertMany([
    {
      _id: loc.main,
      name: "Головний склад",
      description: "Основне приміщення, стелажі А1–А6",
      tenantId,
    },
    {
      _id: loc.second,
      name: "Склад №2",
      description: "Дрібні товари та канцелярія",
      tenantId,
    },
    {
      _id: loc.yard,
      name: "Відкритий майданчик",
      description: "Будматеріали та великі вантажі",
      tenantId,
    },
    {
      _id: loc.fridge,
      name: "Холодильна камера",
      description: "Продукти, що потребують охолодження",
      tenantId,
    },
    {
      _id: loc.reserve,
      name: "Стелаж резерву",
      description: "Резервні запаси меблів та інструменту",
      tenantId,
    },
  ]);

  // ---- Товари ----
  const prod = {
    monitor: id(),
    keyboard: id(),
    mouse: id(),
    headphones: id(),
    pen: id(),
    paper: id(),
    notebook: id(),
    chair: id(),
    desk: id(),
    cabinet: id(),
    cement: id(),
    paint: id(),
    brick: id(),
    floorCleaner: id(),
    paperTowels: id(),
    water: id(),
    coffee: id(),
    drill: id(),
    screwdriverSet: id(),
    gloves: id(),
  };

  await Product.insertMany([
    {
      _id: prod.monitor,
      name: 'Монітор Dell 24"',
      sku: "ELC-001",
      category: cat.electronics,
      supplier: sup.techno,
      location: loc.main,
      unit: "шт",
      quantity: 15,
      minQuantity: 5,
      price: 6500,
      tenantId,
    },
    {
      _id: prod.keyboard,
      name: "Клавіатура механічна",
      sku: "ELC-002",
      category: cat.electronics,
      supplier: sup.techno,
      location: loc.main,
      unit: "шт",
      quantity: 3,
      minQuantity: 5,
      price: 1200,
      tenantId,
    },
    {
      _id: prod.mouse,
      name: "Миша бездротова",
      sku: "ELC-003",
      category: cat.electronics,
      supplier: sup.techno,
      location: loc.main,
      unit: "шт",
      quantity: 25,
      minQuantity: 10,
      price: 450,
      tenantId,
    },
    {
      _id: prod.headphones,
      name: "Навушники дротові",
      sku: "ELC-004",
      category: cat.electronics,
      supplier: sup.techno,
      location: loc.second,
      unit: "шт",
      quantity: 4,
      minQuantity: 8,
      price: 850,
      tenantId,
    },

    {
      _id: prod.pen,
      name: "Ручка кулькова синя",
      sku: "STA-001",
      category: cat.stationery,
      supplier: sup.ivanenko,
      location: loc.second,
      unit: "уп",
      quantity: 50,
      minQuantity: 10,
      price: 45,
      tenantId,
    },
    {
      _id: prod.paper,
      name: "Папір А4",
      sku: "STA-002",
      category: cat.stationery,
      supplier: sup.ivanenko,
      location: loc.second,
      unit: "уп",
      quantity: 8,
      minQuantity: 10,
      price: 180,
      tenantId,
    },
    {
      _id: prod.notebook,
      name: "Зошит А5",
      sku: "STA-003",
      category: cat.stationery,
      supplier: sup.ivanenko,
      location: loc.second,
      unit: "уп",
      quantity: 30,
      minQuantity: 10,
      price: 65,
      tenantId,
    },

    {
      _id: prod.chair,
      name: "Стілець офісний",
      sku: "FUR-001",
      category: cat.furniture,
      supplier: sup.ivanenko,
      location: loc.main,
      unit: "шт",
      quantity: 20,
      minQuantity: 5,
      price: 2200,
      tenantId,
    },
    {
      _id: prod.desk,
      name: "Стіл письмовий",
      sku: "FUR-002",
      category: cat.furniture,
      supplier: sup.ivanenko,
      location: loc.main,
      unit: "шт",
      quantity: 6,
      minQuantity: 3,
      price: 4800,
      tenantId,
    },
    {
      _id: prod.cabinet,
      name: "Шафа для документів",
      sku: "FUR-003",
      category: cat.furniture,
      supplier: sup.ivanenko,
      location: loc.reserve,
      unit: "шт",
      quantity: 4,
      minQuantity: 2,
      price: 5200,
      tenantId,
    },

    {
      _id: prod.cement,
      name: "Цемент М400",
      sku: "BLD-001",
      category: cat.building,
      supplier: sup.budpostach,
      location: loc.yard,
      unit: "кг",
      quantity: 500,
      minQuantity: 100,
      price: 3.5,
      tenantId,
    },
    {
      _id: prod.paint,
      name: "Фарба біла",
      sku: "BLD-002",
      category: cat.building,
      supplier: sup.budpostach,
      location: loc.yard,
      unit: "л",
      quantity: 40,
      minQuantity: 15,
      price: 95,
      tenantId,
    },
    {
      _id: prod.brick,
      name: "Цегла червона",
      sku: "BLD-003",
      category: cat.building,
      supplier: sup.budpostach,
      location: loc.yard,
      unit: "шт",
      quantity: 1200,
      minQuantity: 300,
      price: 8.2,
      tenantId,
    },

    {
      _id: prod.floorCleaner,
      name: "Засіб для миття підлоги",
      sku: "CHM-001",
      category: cat.chemistry,
      supplier: sup.chysto,
      location: loc.second,
      unit: "л",
      quantity: 18,
      minQuantity: 20,
      price: 65,
      tenantId,
    },
    {
      _id: prod.paperTowels,
      name: "Рушники паперові",
      sku: "CHM-002",
      category: cat.chemistry,
      supplier: sup.chysto,
      location: loc.second,
      unit: "уп",
      quantity: 45,
      minQuantity: 15,
      price: 55,
      tenantId,
    },

    {
      _id: prod.water,
      name: "Вода питна 19л",
      sku: "FOOD-001",
      category: cat.food,
      supplier: sup.melnyk,
      location: loc.fridge,
      unit: "шт",
      quantity: 22,
      minQuantity: 10,
      price: 90,
      tenantId,
    },
    {
      _id: prod.coffee,
      name: "Кава розчинна",
      sku: "FOOD-002",
      category: cat.food,
      supplier: sup.melnyk,
      location: loc.fridge,
      unit: "кг",
      quantity: 3,
      minQuantity: 5,
      price: 320,
      tenantId,
    },

    {
      _id: prod.drill,
      name: "Дриль акумуляторний",
      sku: "TL-001",
      category: cat.tools,
      supplier: sup.instrumentpro,
      location: loc.reserve,
      unit: "шт",
      quantity: 7,
      minQuantity: 3,
      price: 3200,
      tenantId,
    },
    {
      _id: prod.screwdriverSet,
      name: "Набір викруток",
      sku: "TL-002",
      category: cat.tools,
      supplier: sup.instrumentpro,
      location: loc.reserve,
      unit: "шт",
      quantity: 12,
      minQuantity: 5,
      price: 450,
      tenantId,
    },

    {
      _id: prod.gloves,
      name: "Рукавиці робочі",
      sku: "TX-001",
      category: cat.textile,
      supplier: sup.instrumentpro,
      location: loc.second,
      unit: "уп",
      quantity: 60,
      minQuantity: 20,
      price: 35,
      tenantId,
    },
  ]);

  // ---- Історія рухів ----
  let userIndex = 0;
  const move = (product, type, quantity, days, extra = {}) => ({
    product,
    user: movementUsers[userIndex++ % movementUsers.length],
    tenantId,
    type,
    quantity,
    fromLocation: null,
    toLocation: null,
    reason: "",
    comment: "",
    createdAt: daysAgo(days),
    updatedAt: daysAgo(days),
    ...extra,
  });

  const movements = [
    // Електроніка
    move(prod.monitor, "incoming", 20, 55, { reason: "Закупівля" }),
    move(prod.monitor, "outgoing", 5, 20, { reason: "Видано у відділ ІТ" }),
    move(prod.keyboard, "incoming", 10, 50, { reason: "Закупівля" }),
    move(prod.keyboard, "outgoing", 7, 15, {
      reason: "Видано у відділ продажів",
    }),
    move(prod.mouse, "incoming", 35, 48, { reason: "Закупівля" }),
    move(prod.mouse, "outgoing", 10, 22, { reason: "Видано працівникам" }),
    move(prod.headphones, "incoming", 12, 45, { reason: "Закупівля" }),
    move(prod.headphones, "outgoing", 8, 14, { reason: "Видано в call-центр" }),

    // Канцтовари
    move(prod.pen, "incoming", 70, 47, { reason: "Закупівля" }),
    move(prod.pen, "outgoing", 20, 12, { reason: "Видано в офіс" }),
    move(prod.paper, "incoming", 25, 46, { reason: "Закупівля" }),
    move(prod.paper, "outgoing", 17, 10, { reason: "Видано в бухгалтерію" }),
    move(prod.notebook, "incoming", 40, 44, { reason: "Закупівля" }),
    move(prod.notebook, "outgoing", 10, 9, { reason: "Видано на навчання" }),

    // Меблі
    move(prod.chair, "incoming", 20, 42, {
      reason: "Закупівля",
      toLocation: loc.second,
    }),
    move(prod.chair, "transfer", 20, 30, {
      reason: "Перенесення",
      comment: "Стільці переїхали на головний склад",
      fromLocation: loc.second,
      toLocation: loc.main,
    }),
    move(prod.desk, "incoming", 10, 40, { reason: "Закупівля" }),
    move(prod.desk, "outgoing", 4, 8, { reason: "Видано у новий офіс" }),
    move(prod.cabinet, "incoming", 6, 38, { reason: "Закупівля" }),
    move(prod.cabinet, "outgoing", 2, 7, { reason: "Видано в архів" }),

    // Будматеріали
    move(prod.cement, "incoming", 600, 36, { reason: "Закупівля" }),
    move(prod.cement, "outgoing", 100, 6, { reason: "Відпущено на об'єкт" }),
    move(prod.paint, "incoming", 60, 34, { reason: "Закупівля" }),
    move(prod.paint, "outgoing", 20, 5, { reason: "Відпущено на об'єкт" }),
    move(prod.brick, "incoming", 1500, 32, { reason: "Закупівля" }),
    move(prod.brick, "outgoing", 300, 4, { reason: "Відпущено на об'єкт" }),

    // Побутова хімія
    move(prod.floorCleaner, "incoming", 30, 30, { reason: "Закупівля" }),
    move(prod.floorCleaner, "outgoing", 12, 11, { reason: "Видано клінінгу" }),
    move(prod.paperTowels, "incoming", 60, 28, { reason: "Закупівля" }),
    move(prod.paperTowels, "outgoing", 15, 9, { reason: "Видано по офісах" }),

    // Продукти
    move(prod.water, "incoming", 30, 26, { reason: "Закупівля" }),
    move(prod.water, "outgoing", 8, 6, { reason: "Видано в кухні" }),
    move(prod.coffee, "incoming", 10, 24, { reason: "Закупівля" }),
    move(prod.coffee, "outgoing", 7, 5, { reason: "Видано в кухні" }),

    // Інструменти
    move(prod.drill, "incoming", 8, 20, { reason: "Закупівля" }),
    move(prod.drill, "outgoing", 1, 3, { reason: "Видано техпідтримці" }),
    move(prod.screwdriverSet, "incoming", 15, 18, { reason: "Закупівля" }),
    move(prod.screwdriverSet, "outgoing", 3, 2, {
      reason: "Видано техпідтримці",
    }),

    // Текстиль
    move(prod.gloves, "incoming", 80, 16, { reason: "Закупівля" }),
    move(prod.gloves, "outgoing", 20, 3, { reason: "Видано на об'єкт" }),

    // Кілька інвентаризаційних коригувань наприкінці періоду
    move(prod.paper, "adjustment", 8, 1, {
      reason: "Інвентаризація",
      comment: "Фактичний залишок збігається з обліковим",
    }),
    move(prod.floorCleaner, "adjustment", 18, 1, {
      reason: "Інвентаризація",
      comment: "Виявлено невелику недостачу",
    }),
    move(prod.coffee, "adjustment", 3, 1, {
      reason: "Інвентаризація",
    }),
  ];

  await StockMovement.insertMany(movements, { timestamps: false });

  console.log(
    `Готово: 8 категорій, 6 постачальників, 5 локацій, 20 товарів, ${movements.length} рухів.`,
  );
  console.log(`Демо-менеджер: ${managerEmail} / 123456`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
