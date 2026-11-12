import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { and, eq } from 'drizzle-orm';
import type { UserRole } from '../auth/authTypes.ts';
import { closeDb, getDb } from '../db/index.ts';
import { stalls, users } from '../db/schema.ts';

interface SeedUser {
  name: string;
  email: string;
  role: UserRole;
}

interface SeedStall {
  ownerEmail: string;
  name: string;
  category: string;
  location: string;
  description: string;
}

const seedUsers: SeedUser[] = [
  { name: 'Admin Kantin', email: 'admin@example.test', role: 'admin' },
  { name: 'Owner Satu', email: 'owner1@example.test', role: 'owner' },
  { name: 'Owner Dua', email: 'owner2@example.test', role: 'owner' },
  { name: 'Customer Uji', email: 'customer@example.test', role: 'customer' },
];

const seedStalls: SeedStall[] = [
  { ownerEmail: 'owner1@example.test', name: 'Warung Nasi Pagi', category: 'Nasi', location: 'Kantin A', description: 'Nasi rumahan dan lauk harian.' },
  { ownerEmail: 'owner1@example.test', name: 'Soto Sudut Kampus', category: 'Soto', location: 'Kantin A', description: 'Soto ayam dengan kuah bening.' },
  { ownerEmail: 'owner1@example.test', name: 'Kopi Selasar', category: 'Minuman', location: 'Selasar Utara', description: 'Kopi dan minuman dingin.' },
  { ownerEmail: 'owner2@example.test', name: 'Mie Pojok', category: 'Mie', location: 'Kantin B', description: 'Mie ayam dan pangsit.' },
  { ownerEmail: 'owner2@example.test', name: 'Bakso Lapangan', category: 'Bakso', location: 'Kantin B', description: 'Bakso kuah dengan pilihan topping.' },
  { ownerEmail: 'owner2@example.test', name: 'Es Buah Ceria', category: 'Minuman', location: 'Teras Timur', description: 'Es buah dan jus segar.' },
];

async function ensureUser(user: SeedUser, passwordHash: string): Promise<number> {
  const db = await getDb();
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, user.email));
  if (existing[0]) {
    await db.update(users).set({ name: user.name, role: user.role, passwordHash }).where(eq(users.id, existing[0].id));
    return existing[0].id;
  }

  const inserted = await db.insert(users).output().values({
    name: user.name,
    email: user.email,
    passwordHash,
    role: user.role,
  });
  if (!inserted[0]) throw new Error('USER_SEED_INSERT_RETURNED_NO_ROW');
  return inserted[0].id;
}

async function ensureStall(stall: SeedStall, ownerId: number): Promise<void> {
  const db = await getDb();
  const existing = await db
    .select({ id: stalls.id })
    .from(stalls)
    .where(and(eq(stalls.ownerId, ownerId), eq(stalls.name, stall.name)));
  if (existing[0]) return;

  await db.insert(stalls).values({
    ownerId,
    name: stall.name,
    category: stall.category,
    location: stall.location,
    description: stall.description,
    avgRating: '0.00',
    reviewCount: 0,
  });
}

async function seed(): Promise<void> {
  const password = process.env.SEED_PASSWORD;
  if (!password || password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
    console.error('SEED_PASSWORD wajib diisi, minimal 8 karakter dan maksimal 72 byte.');
    process.exitCode = 1;
    return;
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const userIds = new Map<string, number>();
    for (const user of seedUsers) {
      userIds.set(user.email, await ensureUser(user, passwordHash));
    }

    for (const stall of seedStalls) {
      const ownerId = userIds.get(stall.ownerEmail);
      if (ownerId === undefined) throw new Error('SEED_OWNER_NOT_FOUND');
      await ensureStall(stall, ownerId);
    }

    console.log(`Seed selesai: ${seedUsers.length} akun uji dan ${seedStalls.length} warung tersedia.`);
  } catch {
    console.error('Seed gagal. Periksa koneksi database dan skema SQL Server.');
    process.exitCode = 1;
  } finally {
    await closeDb();
  }
}

void seed();