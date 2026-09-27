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
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const CROPS_FILE = path.join(DATA_DIR, 'crops.json');

/** Ensure data/ directory and files exist */
function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
    if (!fs.existsSync(ORDERS_FILE)) {
      fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
    if (!fs.existsSync(CROPS_FILE)) {
      fs.writeFileSync(CROPS_FILE, JSON.stringify([], null, 2), 'utf-8');
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

/** Get canonical 10-digit Indian mobile number */
export function getCanonicalPhone(raw: string): string {
  const digits = (raw || '').replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

/** Save or update a single user in local storage */
export function saveUser(user: LocalUser) {
  const users = getAllUsers();
  const cPhone = getCanonicalPhone(user.phone);
  const idx = users.findIndex(
    (u) => u.id === user.id || (cPhone && getCanonicalPhone(u.phone) === cPhone)
  );
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...user, updated_at: new Date().toISOString() };
  } else {
    users.push(user);
  }
  saveUsers(users);
}

/** Find a user by phone or email with full canonical phone flexibility */
export function findUser(identifier: string): LocalUser | undefined {
  const users = getAllUsers();
  const clean = identifier.trim().toLowerCase();
  const cleanPhone = clean.replace(/\D/g, '');
  const canonical = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : '';

  return users.find((u) => {
    const uPhone = (u.phone || '').replace(/\D/g, '');
    const uCanonical = uPhone.length >= 10 ? uPhone.slice(-10) : '';
    const uEmail = (u.email || '').toLowerCase();

    return (
      (canonical && uCanonical === canonical) ||
      uPhone === cleanPhone ||
      u.phone === identifier.trim() ||
      uEmail === clean ||
      (canonical && uEmail === `${canonical}@kisanvyapar.in`) ||
      (canonical && uEmail === `91${canonical}@kisanvyapar.in`)
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
  const canonicalPhone = getCanonicalPhone(data.phone);
  const email = `${canonicalPhone || data.phone.trim().replace(/\D/g, '')}@kisanvyapar.in`;

  // Check for existing user with same phone
  const existing = users.find((u) => {
    const uCanonical = getCanonicalPhone(u.phone);
    return canonicalPhone && uCanonical === canonicalPhone;
  });

  if (existing) {
    throw new Error('An account with this mobile number is already registered. Please Sign In instead.');
  }

  const now = new Date().toISOString();
  const newUser: LocalUser = {
    id: crypto.randomUUID(),
    email,
    full_name: data.fullName.trim(),
    phone: canonicalPhone || data.phone.trim(),
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
  const canonical = getCanonicalPhone(phone);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const store = readOtpStore();
  store[canonical] = {
    otp,
    phone: canonical,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
  };
  writeOtpStore(store);
  return otp;
}

/** Verify an OTP for the given phone number */
export function verifyOTP(phone: string, otp: string): { valid: boolean; message: string } {
  const canonical = getCanonicalPhone(phone);
  const store = readOtpStore();
  // Try canonical phone first, then raw normalized
  const rawNormalized = phone.trim().replace(/\D/g, '');
  const entry = store[canonical] || store[rawNormalized];

  if (!entry) {
    return { valid: false, message: 'No OTP was sent to this number. Please request a new OTP.' };
  }

  if (Date.now() > entry.expiresAt) {
    delete store[canonical];
    delete store[rawNormalized];
    writeOtpStore(store);
    return { valid: false, message: 'OTP has expired. Please request a new one.' };
  }

  if (entry.otp !== otp.trim()) {
    return { valid: false, message: 'Incorrect OTP entered. Please check and try again.' };
  }

  // OTP is valid — remove it so it can't be reused
  delete store[canonical];
  delete store[rawNormalized];
  writeOtpStore(store);
  return { valid: true, message: 'OTP verified successfully!' };
}

// ─── Local Orders Store ──────────────────────────────────────────
export interface LocalOrder {
  id: string;
  orderNumber: string;
  buyerId?: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail?: string;
  cropTitle: string;
  cropId?: string;
  farmerId?: string;
  farmerName?: string;
  variety: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  discountPercent?: number;
  discountAmount?: number;
  totalAmount: number;
  paymentMethod: 'cod' | 'razorpay';
  paymentStatus: 'pending' | 'paid' | 'escrow';
  fulfillmentStatus: 'new' | 'accepted' | 'packed' | 'dispatched' | 'delivered' | 'cancelled';
  deliveryType: 'Farm Pickup' | 'Farmer Door Delivery';
  deliveryAddress: string;
  orderDate: string;
  transportVehicleNumber?: string;
  trackingPhone?: string;
  created_at: string;
}

export function getAllOrders(): LocalOrder[] {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(ORDERS_FILE, 'utf-8');
    return JSON.parse(raw) as LocalOrder[];
  } catch {
    return [];
  }
}

function saveAllOrders(orders: LocalOrder[]) {
  ensureDataDir();
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
}

export function saveOrder(orderData: Partial<LocalOrder>): LocalOrder {
  const orders = getAllOrders();
  const newOrder: LocalOrder = {
    id: orderData.id || `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    orderNumber: orderData.orderNumber || `ORD-KVP-${Math.floor(10000 + Math.random() * 90000)}`,
    buyerId: orderData.buyerId,
    buyerName: orderData.buyerName || 'Valued Buyer',
    buyerPhone: orderData.buyerPhone || '',
    buyerEmail: orderData.buyerEmail,
    cropTitle: orderData.cropTitle || 'Fresh Harvest Lot',
    cropId: orderData.cropId,
    farmerId: orderData.farmerId,
    farmerName: orderData.farmerName,
    variety: orderData.variety || 'Standard',
    quantity: Number(orderData.quantity || 1),
    unit: orderData.unit || 'quintal',
    pricePerUnit: Number(orderData.pricePerUnit || 0),
    discountPercent: Number(orderData.discountPercent || 0),
    discountAmount: Number(orderData.discountAmount || 0),
    totalAmount: Number(orderData.totalAmount || 0),
    paymentMethod: orderData.paymentMethod || 'cod',
    paymentStatus: orderData.paymentStatus || 'pending',
    fulfillmentStatus: orderData.fulfillmentStatus || 'new',
    deliveryType: orderData.deliveryType || 'Farmer Door Delivery',
    deliveryAddress: orderData.deliveryAddress || 'Farm Gate Pickup',
    orderDate: orderData.orderDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    transportVehicleNumber: orderData.transportVehicleNumber,
    trackingPhone: orderData.trackingPhone,
    created_at: orderData.created_at || new Date().toISOString(),
  };

  // Prepend new order
  orders.unshift(newOrder);
  saveAllOrders(orders);
  return newOrder;
}

export function updateOrder(idOrNumber: string, updates: Partial<LocalOrder>): LocalOrder | undefined {
  const orders = getAllOrders();
  const idx = orders.findIndex((o) => o.id === idOrNumber || o.orderNumber === idOrNumber);
  if (idx === -1) return undefined;

  orders[idx] = { ...orders[idx], ...updates };
  saveAllOrders(orders);
  return orders[idx];
}

export function getOrdersByBuyer(buyerId: string): LocalOrder[] {
  const orders = getAllOrders();
  return orders.filter((o) => o.buyerId === buyerId);
}

export function getOrdersByFarmer(farmerId: string): LocalOrder[] {
  const orders = getAllOrders();
  return orders.filter((o) => o.farmerId === farmerId);
}

// ─── Local Custom Crops Store ────────────────────────────────────
export function getAllLocalCrops(): any[] {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(CROPS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveAllLocalCrops(crops: any[]) {
  ensureDataDir();
  fs.writeFileSync(CROPS_FILE, JSON.stringify(crops, null, 2), 'utf-8');
}

export function saveLocalCrop(cropData: any): any {
  const crops = getAllLocalCrops();
  const newCrop = {
    ...cropData,
    id: cropData.id || `crop-${Date.now()}`,
    created_at: cropData.created_at || new Date().toISOString(),
  };
  crops.unshift(newCrop);
  saveAllLocalCrops(crops);
  return newCrop;
}

export function updateLocalCrop(id: string, updates: Partial<any>): any {
  const crops = getAllLocalCrops();
  const idx = crops.findIndex((c) => c.id === id);
  if (idx === -1) {
    // If not found in custom crops, create an override entry so stock update persists
    const override = { id, ...updates };
    crops.push(override);
    saveAllLocalCrops(crops);
    return override;
  }

  crops[idx] = { ...crops[idx], ...updates };
  saveAllLocalCrops(crops);
  return crops[idx];
}

export function deleteLocalCrop(id: string): boolean {
  const crops = getAllLocalCrops();
  const filtered = crops.filter((c) => c.id !== id);
  saveAllLocalCrops(filtered);
  return true;
}
