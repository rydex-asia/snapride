import 'dotenv/config';
import { PrismaClient, Role, VehicleType, PartnerStatus, NotificationChannel } from '@prisma/client';
import { createClient, User as SupabaseUser } from '@supabase/supabase-js';

const prisma = new PrismaClient();
const password = 'Password@123';
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

async function ensureAuthUser(input: {
  email?: string;
  phone?: string;
  fullName: string;
}): Promise<SupabaseUser> {
  const { data: listed, error: listError } =
    await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) throw listError;
  const existing = listed.users.find(
    (user) =>
      (input.email && user.email === input.email) ||
      (input.phone && user.phone === input.phone),
  );
  if (existing) return existing;

  const { data, error } = await supabase.auth.admin.createUser({
    ...(input.email ? { email: input.email, email_confirm: true } : {}),
    ...(input.phone ? { phone: input.phone, phone_confirm: true } : {}),
    password,
    user_metadata: { full_name: input.fullName },
  });
  if (error || !data.user) throw error || new Error('Could not seed auth user');
  return data.user;
}

async function upsertUser(input: {
  email?: string;
  phone?: string;
  fullName: string;
  role: Role;
}) {
  const authUser = await ensureAuthUser(input);
  return prisma.user.upsert({
    where: input.email ? { email: input.email } : { phone: input.phone },
    update: {
      authUserId: authUser.id,
      fullName: input.fullName,
      role: input.role,
      isActive: true,
      passwordHash: null,
    },
    create: {
      authUserId: authUser.id,
      email: input.email,
      phone: input.phone,
      fullName: input.fullName,
      role: input.role,
      wallet: {
        create: {
          balance: input.role === Role.PARTNER ? 0 : 500,
          currency: 'INR',
        },
      },
    },
  });
}

async function main() {
  const admin = await upsertUser({
    email: 'admin@rydex.local',
    fullName: 'Rydex Admin',
    role: Role.ADMIN,
  });

  const customer = await upsertUser({
    phone: '+919900112233',
    email: 'customer@rydex.local',
    fullName: 'Kiran Customer',
    role: Role.CUSTOMER,
  });

  const partnerUser = await upsertUser({
    phone: '+919900445566',
    email: 'partner@rydex.local',
    fullName: 'Ravi Partner',
    role: Role.PARTNER,
  });

  const storeOwner = await upsertUser({
    phone: '+919900778899',
    email: 'store@frezo.local',
    fullName: 'Frezo Store Owner',
    role: Role.STORE_OWNER,
  });

  const partner = await prisma.partner.upsert({
    where: { userId: partnerUser.id },
    update: {
      status: PartnerStatus.ONLINE,
      latitude: 17.3899,
      longitude: 78.4867,
      heading: 82,
      lastSeenAt: new Date(),
    },
    create: {
      userId: partnerUser.id,
      status: PartnerStatus.ONLINE,
      latitude: 17.3899,
      longitude: 78.4867,
      heading: 82,
      lastSeenAt: new Date(),
    },
  });

  await prisma.vehicle.upsert({
    where: { plateNumber: 'TG08ET3421' },
    update: {
      partnerId: partner.id,
      type: VehicleType.BIKE,
      make: 'Bajaj',
      model: 'Pulsar 125',
      isActive: true,
    },
    create: {
      partnerId: partner.id,
      type: VehicleType.BIKE,
      plateNumber: 'TG08ET3421',
      make: 'Bajaj',
      model: 'Pulsar 125',
    },
  });

  await prisma.vehicle.upsert({
    where: { plateNumber: 'TG09AB1204' },
    update: {
      partnerId: partner.id,
      type: VehicleType.AUTO,
      make: 'Piaggio',
      model: 'Ape Auto',
      isActive: true,
    },
    create: {
      partnerId: partner.id,
      type: VehicleType.AUTO,
      plateNumber: 'TG09AB1204',
      make: 'Piaggio',
      model: 'Ape Auto',
    },
  });

  const categoryDefinitions = [
    { name: 'Dairy & Breakfast', slug: 'dairy-breakfast', imageKey: 'category-dairy' },
    { name: 'Atta, Rice & Dal', slug: 'staples', imageKey: 'category-staples' },
    { name: 'Snacks & Beverages', slug: 'snacks-beverages', imageKey: 'category-snacks' },
    { name: 'Cooking Essentials', slug: 'cooking-essentials', imageKey: 'category-cooking' },
    { name: 'Household Care', slug: 'household-care', imageKey: 'category-household' },
    { name: 'Personal Care', slug: 'personal-care', imageKey: 'category-personal' },
  ];
  const categories: Record<string, { id: string }> = {};

  for (const definition of categoryDefinitions) {
    const category = await prisma.category.upsert({
      where: { name: definition.name },
      update: { ...definition, isActive: true },
      create: definition,
    });
    categories[definition.slug] = category;
  }

  const store = await prisma.store.upsert({
    where: { id: '00000000-0000-4000-8000-000000000101' },
    update: {
      ownerId: storeOwner.id,
      name: 'Frezo Daily Store',
      phone: '+914040404040',
      address: 'Kacheguda, Hyderabad',
      latitude: 17.3891,
      longitude: 78.4906,
      isActive: true,
    },
    create: {
      id: '00000000-0000-4000-8000-000000000101',
      ownerId: storeOwner.id,
      name: 'Frezo Daily Store',
      phone: '+914040404040',
      address: 'Kacheguda, Hyderabad',
      latitude: 17.3891,
      longitude: 78.4906,
    },
  });

  const products = [
    { sku: 'FRZ-AMUL-MILK-500', name: 'Amul Taaza Milk', brand: 'Amul', unit: '500 ml', description: 'Fresh toned milk', price: 32, mrp: 34, stock: 120, imageKey: 'milk', variantGroup: 'amul-milk', categoryId: categories['dairy-breakfast'].id },
    { sku: 'FRZ-AMUL-MILK-1000', name: 'Amul Taaza Milk Carton', brand: 'Amul', unit: '1 L', description: 'Long-life toned milk carton', price: 72, mrp: 78, stock: 86, imageKey: 'amulTaazaCarton', variantGroup: 'amul-milk', categoryId: categories['dairy-breakfast'].id },
    { sku: 'FRZ-AMUL-CURD-400', name: 'Amul Masti Curd', brand: 'Amul', unit: '400 g', description: 'Thick and creamy curd', price: 35, mrp: 40, stock: 74, imageKey: 'amulCurd', variantGroup: 'amul-curd', categoryId: categories['dairy-breakfast'].id },
    { sku: 'FRZ-DAAWAT-RICE-1000', name: 'Daawat Rozana Basmati Rice', brand: 'Daawat', unit: '1 kg', description: 'Everyday basmati rice with long grains', price: 72, mrp: 95, stock: 60, imageKey: 'rice', variantGroup: 'daawat-rice', categoryId: categories.staples.id },
    { sku: 'FRZ-AASHIRVAAD-ATTA-5000', name: 'Aashirvaad Whole Wheat Atta', brand: 'Aashirvaad', unit: '5 kg', description: 'Whole wheat flour for soft rotis', price: 249, mrp: 286, stock: 48, imageKey: 'atta', variantGroup: 'aashirvaad-atta', categoryId: categories.staples.id },
    { sku: 'FRZ-FORTUNE-ATTA-5000', name: 'Fortune Chakki Fresh Atta', brand: 'Fortune', unit: '5 kg', description: 'Fresh whole wheat atta', price: 235, mrp: 270, stock: 44, imageKey: 'fortuneAtta', variantGroup: 'fortune-atta', categoryId: categories.staples.id },
    { sku: 'FRZ-TATA-DAL-1000', name: 'Tata Sampann Toor Dal', brand: 'Tata Sampann', unit: '1 kg', description: 'Unpolished protein-rich toor dal', price: 174, mrp: 205, stock: 57, imageKey: 'dal', variantGroup: 'tata-dal', categoryId: categories.staples.id },
    { sku: 'FRZ-SAFFOLA-OIL-1000', name: 'Saffola Gold Cooking Oil', brand: 'Saffola', unit: '1 L', description: 'Blended edible oil for everyday cooking', price: 145, mrp: 175, stock: 63, imageKey: 'oil', variantGroup: 'saffola-oil', categoryId: categories['cooking-essentials'].id },
    { sku: 'FRZ-INDIAGATE-SUGAR-1000', name: 'India Gate Sugar', brand: 'India Gate', unit: '1 kg', description: 'Fine grain refined sugar', price: 54, mrp: 60, stock: 92, imageKey: 'sugar', variantGroup: 'sugar', categoryId: categories['cooking-essentials'].id },
    { sku: 'FRZ-GOWARDHAN-GHEE-500', name: 'Gowardhan Cow Ghee', brand: 'Gowardhan', unit: '500 ml', description: 'Rich and aromatic cow ghee', price: 338, mrp: 365, stock: 35, imageKey: 'ghee', variantGroup: 'gowardhan-ghee', categoryId: categories['cooking-essentials'].id },
    { sku: 'FRZ-KISSAN-KETCHUP-850', name: 'Kissan Fresh Tomato Ketchup', brand: 'Kissan', unit: '850 g', description: 'Tomato ketchup made with real tomatoes', price: 115, mrp: 140, stock: 49, imageKey: 'ketchup', variantGroup: 'kissan-ketchup', categoryId: categories['cooking-essentials'].id },
    { sku: 'FRZ-OREO-120', name: 'Oreo Original Vanilla Biscuits', brand: 'Oreo', unit: '120 g', description: 'Chocolate sandwich biscuits with vanilla creme', price: 28, mrp: 30, stock: 110, imageKey: 'oreo', variantGroup: 'oreo', categoryId: categories['snacks-beverages'].id },
    { sku: 'FRZ-PRINGLES-107', name: 'Pringles Original Potato Chips', brand: 'Pringles', unit: '107 g', description: 'Crispy original salted potato chips', price: 99, mrp: 120, stock: 39, imageKey: 'pringles', variantGroup: 'pringles', categoryId: categories['snacks-beverages'].id },
    { sku: 'FRZ-NESCAFE-100', name: 'Nescafe Classic Instant Coffee', brand: 'Nescafe', unit: '100 g', description: 'Rich and aromatic instant coffee', price: 315, mrp: 340, stock: 41, imageKey: 'coffee', variantGroup: 'nescafe', categoryId: categories['snacks-beverages'].id },
    { sku: 'FRZ-REDLABEL-500', name: 'Brooke Bond Red Label Tea', brand: 'Red Label', unit: '500 g', description: 'Strong blended tea for the whole family', price: 245, mrp: 275, stock: 52, imageKey: 'tea', variantGroup: 'red-label', categoryId: categories['snacks-beverages'].id },
    { sku: 'FRZ-SURF-2000', name: 'Surf Excel Matic Front Load', brand: 'Surf Excel', unit: '2 kg', description: 'Machine wash detergent for tough stains', price: 429, mrp: 520, stock: 28, imageKey: 'surfExcel', variantGroup: 'surf-matic', categoryId: categories['household-care'].id },
    { sku: 'FRZ-HARPIC-1000', name: 'Harpic Power Plus Toilet Cleaner', brand: 'Harpic', unit: '1 L', description: 'Disinfecting toilet cleaner', price: 185, mrp: 210, stock: 36, imageKey: 'harpic', variantGroup: 'harpic', categoryId: categories['household-care'].id },
    { sku: 'FRZ-VANISH-400', name: 'Vanish Oxi Action Fabric Stain Remover', brand: 'Vanish', unit: '400 g', description: 'Fabric-safe stain removal powder', price: 215, mrp: 245, stock: 31, imageKey: 'vanish', variantGroup: 'vanish', categoryId: categories['household-care'].id },
    { sku: 'FRZ-COLGATE-200', name: 'Colgate Strong Teeth Toothpaste', brand: 'Colgate', unit: '200 g', description: 'Calcium boost toothpaste for strong teeth', price: 112, mrp: 130, stock: 67, imageKey: 'colgate', variantGroup: 'colgate', categoryId: categories['personal-care'].id },
    { sku: 'FRZ-DETTOL-200', name: 'Dettol Original Liquid Handwash', brand: 'Dettol', unit: '200 ml', description: 'Germ-protection liquid handwash', price: 95, mrp: 110, stock: 59, imageKey: 'dettol', variantGroup: 'dettol', categoryId: categories['personal-care'].id },
    { sku: 'FRZ-DOVE-100', name: 'Dove Cream Beauty Bathing Bar', brand: 'Dove', unit: '100 g', description: 'Moisturising beauty bathing bar', price: 64, mrp: 72, stock: 76, imageKey: 'dove', variantGroup: 'dove', categoryId: categories['personal-care'].id },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: { ...product, storeId: store.id, isActive: true },
      create: { ...product, storeId: store.id },
    });
  }

  await prisma.notification.create({
    data: {
      userId: customer.id,
      channel: NotificationChannel.SOCKET,
      title: 'Welcome to Rydex',
      body: 'Your test account is ready for ride, parcel, and Frezo grocery flows.',
      metadata: {
        seeded: true,
      },
    },
  });

  console.log('Seed complete');
  console.table([
    { role: 'ADMIN', login: admin.email, password },
    { role: 'CUSTOMER', login: customer.phone, password },
    { role: 'PARTNER', login: partnerUser.phone, password },
    { role: 'STORE_OWNER', login: storeOwner.email, password },
  ]);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
