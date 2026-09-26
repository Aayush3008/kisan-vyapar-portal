import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface LocalUser {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  password_hash: string;
  role: 'farmer' | 'buyer' | 'admin';
  district: string;
  state: string;
  pincode: string;
  avatar_url: string;
  farm_name?: string;
  farm_description?: string;
  crops_grown?: string[];
  is_verified?: boolean;
  created_at: string;
  updated_at: string;
}

const DATA_DIR = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
  ? path.join('/tmp', 'kisan-data')
  : path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

/** Ensure data/ directory and users.json exist */
function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (err) {
    console.warn('ensureDataDir warning:', err);
  }
}

/** Read all users from the JSON file */
export function getAllUsers(): LocalUser[] {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(raw) as LocalUser[];
  } catch {
    return [];
  }
}

/** Save the full users array back to the JSON file */
function saveUsers(users: LocalUser[]) {
  ensureDataDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

/** Hash a password with SHA-256 + salt */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256').update(salt + password).digest('hex');
  return `${salt}:${hash}`;
}

/** Verify a password against the stored hash */
export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;
  const candidate = crypto.createHash('sha256').update(salt + password).digest('hex');
  return candidate === hash;
}

/** Find a user by phone or email */
export function findUser(identifier: string): LocalUser | undefined {
  const users = getAllUsers();
  const clean = identifier.trim().toLowerCase();
  const cleanPhone = clean.replace(/\D/g, '');

  return users.find((u) => {
    const uPhone = (u.phone || '').replace(/\D/g, '');
    const uEmail = (u.email || '').toLowerCase();
    return (
      uPhone === cleanPhone ||
      u.phone === identifier.trim() ||
      uEmail === clean
    );
  });
}

/** Find a user by ID */
export function findUserById(id: string): LocalUser | undefined {
  const users = getAllUsers();
  return users.find((u) => u.id === id);
}

/** Create a new user — returns the user or throws if phone/email already exists */
export function createUser(data: {
  fullName: string;
  phone: string;
  password: string;
  role: 'farmer' | 'buyer' | 'admin';
  district?: string;
  state?: string;
  pincode?: string;
  farmName?: string;
  cropsGrown?: string[];
}): LocalUser {
  const users = getAllUsers();
  const normalizedPhone = data.phone.trim().replace(/\D/g, '');
  const email = `${normalizedPhone}@kisanvyapar.in`;

  // Check for existing user with same phone
  const existing = users.find((u) => {
    const uPhone = (u.phone || '').replace(/\D/g, '');
    return uPhone === normalizedPhone;
  });

  if (existing) {
    throw new Error('An account with this mobile number is already registered. Please Sign In instead.');
  }

  const now = new Date().toISOString();
  const newUser: LocalUser = {
    id: crypto.randomUUID(),
    email,
    full_name: data.fullName.trim(),
    phone: data.phone.trim(),
    password_hash: hashPassword(data.password),
    role: data.role,
    district: data.district?.trim() || 'Meerut',
    state: data.state?.trim() || 'Uttar Pradesh',
    pincode: data.pincode?.trim() || '250002',
    avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.fullName.trim())}`,
    created_at: now,
    updated_at: now,
  };

  if (data.role === 'farmer') {
    newUser.farm_name = data.farmName?.trim() || `${data.fullName.trim()}'s Krishi Farm`;
    newUser.farm_description = 'Registered certified agricultural grower on Kisan Vyapar Portal';
    newUser.crops_grown = data.cropsGrown || ['Wheat', 'Paddy', 'Soybean'];
    newUser.is_verified = true;
  }

  users.push(newUser);
  saveUsers(users);

  return newUser;
}

/** Update an existing user by ID */
export function updateUser(id: string, updates: Partial<LocalUser>): LocalUser | undefined {
  const users = getAllUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return undefined;

  users[idx] = { ...users[idx], ...updates, updated_at: new Date().toISOString() };
  saveUsers(users);
  return users[idx];
}

// ─── File-Based OTP Store ───────────────────────────────────────
// OTPs are stored on disk so they persist across Next.js API route workers.
interface OtpEntry {
  otp: string;
  phone: string;
  expiresAt: number;
}

const OTP_FILE = path.join(DATA_DIR, 'otps.json');

function readOtpStore(): Record<string, OtpEntry> {
  ensureDataDir();
  try {
    if (!fs.existsSync(OTP_FILE)) return {};
    const raw = fs.readFileSync(OTP_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeOtpStore(store: Record<string, OtpEntry>) {
  ensureDataDir();
  fs.writeFileSync(OTP_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

/** Generate a 6-digit OTP for the given phone number */
export function generateOTP(phone: string): string {
  const normalizedPhone = phone.trim().replace(/\D/g, '');
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const store = readOtpStore();
  store[normalizedPhone] = {
    otp,
    phone: normalizedPhone,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
  };
  writeOtpStore(store);
  return otp;
}

/** Verify an OTP for the given phone number */
export function verifyOTP(phone: string, otp: string): { valid: boolean; message: string } {
  const normalizedPhone = phone.trim().replace(/\D/g, '');
  const store = readOtpStore();
  const entry = store[normalizedPhone];

  if (!entry) {
    return { valid: false, message: 'No OTP was sent to this number. Please request a new OTP.' };
  }

  if (Date.now() > entry.expiresAt) {
    delete store[normalizedPhone];
    writeOtpStore(store);
    return { valid: false, message: 'OTP has expired. Please request a new one.' };
  }

  if (entry.otp !== otp.trim()) {
    return { valid: false, message: 'Incorrect OTP entered. Please check and try again.' };
  }

  // OTP is valid — remove it so it can't be reused
  delete store[normalizedPhone];
  writeOtpStore(store);
  return { valid: true, message: 'OTP verified successfully!' };
}
