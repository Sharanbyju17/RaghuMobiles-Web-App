export type Condition = "Like New" | "Excellent" | "Good" | "Fair";
export type Status = "In Stock" | "Reserved" | "Sold" | "Refurbishing";

export interface Product {
  id: string;
  brand: string;
  model: string;
  slug: string;
  storage: string;
  color: string;
  price: number;
  mrp: number;
  condition: Condition;
  batteryHealth: number;
  warrantyMonths: number;
  imei: string;
  status: Status;
  stock: number;
  image: string;
  gallery: string[];
  highlights: string[];
  addedOn: string;
}

const img = (seed: string) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=900&q=80`;

export const products: Product[] = [
  {
    id: "P-1001",
    brand: "Apple",
    model: "iPhone 14 Pros",
    slug: "iphone-14-pro-256-deep-purple",
    storage: "256 GB",
    color: "Deep Purple",
    price: 68999,
    mrp: 129900,
    condition: "Like New",
    batteryHealth: 96,
    warrantyMonths: 6,
    imei: "356789102345671",
    status: "In Stock",
    stock: 3,
    image: img("1632661674596-df8be070a5c5"),
    gallery: [img("1663499482523-1c0c1bc2fa93"), img("1592286927505-1def25115558"), img("1616348436168-de43ad0db179")],
    highlights: ["A16 Bionic", "Pro camera system", "Always-On display", "6 month warranty"],
    addedOn: "2025-11-02",
  },
  {
    id: "P-1002",
    brand: "Apple",
    model: "iPhone 13",
    slug: "iphone-13-128-midnight",
    storage: "128 GB",
    color: "Midnight",
    price: 42999,
    mrp: 69900,
    condition: "Excellent",
    batteryHealth: 92,
    warrantyMonths: 6,
    imei: "356789102345672",
    status: "In Stock",
    stock: 5,
    image: img("1632661674596-df8be070a5c5"),
    gallery: [img("1632661674596-df8be070a5c5")],
    highlights: ["A15 Bionic", "Cinematic mode", "Ceramic Shield"],
    addedOn: "2025-11-05",
  },
  {
    id: "P-1003",
    brand: "Samsung",
    model: "Galaxy S23 Ultra",
    slug: "galaxy-s23-ultra-256-phantom-black",
    storage: "256 GB",
    color: "Phantom Black",
    price: 62999,
    mrp: 124999,
    condition: "Like New",
    batteryHealth: 98,
    warrantyMonths: 6,
    imei: "356789102345673",
    status: "In Stock",
    stock: 2,
    image: img("1610945415295-d9bbf067e59c"),
    gallery: [img("1610945415295-d9bbf067e59c")],
    highlights: ["200MP camera", "S-Pen included", "Snapdragon 8 Gen 2"],
    addedOn: "2025-11-08",
  },
  {
    id: "P-1004",
    brand: "OnePlus",
    model: "OnePlus 11",
    slug: "oneplus-11-256-titan-black",
    storage: "256 GB",
    color: "Titan Black",
    price: 38999,
    mrp: 61999,
    condition: "Excellent",
    batteryHealth: 94,
    warrantyMonths: 3,
    imei: "356789102345674",
    status: "Reserved",
    stock: 1,
    image: img("1598327105666-5b89351aff97"),
    gallery: [img("1598327105666-5b89351aff97")],
    highlights: ["Hasselblad camera", "100W charging", "Snapdragon 8 Gen 2"],
    addedOn: "2025-11-10",
  },
  {
    id: "P-1005",
    brand: "Apple",
    model: "iPhone 12",
    slug: "iphone-12-128-blue",
    storage: "128 GB",
    color: "Blue",
    price: 32999,
    mrp: 59900,
    condition: "Good",
    batteryHealth: 87,
    warrantyMonths: 3,
    imei: "356789102345675",
    status: "In Stock",
    stock: 7,
    image: img("1605236453806-6ff36851218e"),
    gallery: [img("1605236453806-6ff36851218e")],
    highlights: ["A14 Bionic", "MagSafe", "5G ready"],
    addedOn: "2025-10-28",
  },
  {
    id: "P-1006",
    brand: "Google",
    model: "Pixel 7 Pro",
    slug: "pixel-7-pro-128-obsidian",
    storage: "128 GB",
    color: "Obsidian",
    price: 39999,
    mrp: 84999,
    condition: "Like New",
    batteryHealth: 95,
    warrantyMonths: 6,
    imei: "356789102345676",
    status: "In Stock",
    stock: 2,
    image: img("1632661674596-df8be070a5c5"),
    gallery: [img("1667402979398-4be21ecfb805")],
    highlights: ["Tensor G2", "Pro camera", "Pure Android"],
    addedOn: "2025-11-01",
  },
  {
    id: "P-1007",
    brand: "Xiaomi",
    model: "Redmi Note 12 Pro",
    slug: "redmi-note-12-pro-128-graphite",
    storage: "128 GB",
    color: "Graphite Gray",
    price: 14999,
    mrp: 24999,
    condition: "Excellent",
    batteryHealth: 93,
    warrantyMonths: 3,
    imei: "356789102345677",
    status: "In Stock",
    stock: 12,
    image: img("1585060544812-6b45742d762f"),
    gallery: [img("1585060544812-6b45742d762f")],
    highlights: ["108MP camera", "AMOLED 120Hz", "67W charging"],
    addedOn: "2025-11-11",
  },
  {
    id: "P-1008",
    brand: "Apple",
    model: "iPhone 15",
    slug: "iphone-15-128-pink",
    storage: "128 GB",
    color: "Pink",
    price: 59999,
    mrp: 79900,
    condition: "Like New",
    batteryHealth: 99,
    warrantyMonths: 12,
    imei: "356789102345678",
    status: "In Stock",
    stock: 4,
    image: img("1592750475338-74b7b21085ab"),
    gallery: [img("1592750475338-74b7b21085ab")],
    highlights: ["USB-C", "Dynamic Island", "48MP camera"],
    addedOn: "2025-11-14",
  },
];

export const brands = ["Apple", "Samsung", "OnePlus", "Google", "Xiaomi", "Vivo", "Oppo", "Realme"];

export interface Order {
  id: string;
  customer: string;
  phone: string;
  items: number;
  total: number;
  status: "Placed" | "Packed" | "Shipped" | "Delivered" | "Cancelled";
  payment: "Razorpay" | "COD" | "Cash" | "UPI" | "Card";
  date: string;
}

export const orders: Order[] = [
  { id: "ORD-2041", customer: "Aarav Sharma", phone: "+91 98200 12345", items: 1, total: 42999, status: "Delivered", payment: "Razorpay", date: "2025-11-12" },
  { id: "ORD-2042", customer: "Ishita Verma", phone: "+91 99820 55671", items: 2, total: 71998, status: "Shipped", payment: "Razorpay", date: "2025-11-13" },
  { id: "ORD-2043", customer: "Rohan Mehta", phone: "+91 90000 33221", items: 1, total: 14999, status: "Packed", payment: "COD", date: "2025-11-14" },
  { id: "ORD-2044", customer: "Sneha Kapoor", phone: "+91 88888 12000", items: 1, total: 59999, status: "Placed", payment: "Razorpay", date: "2025-11-15" },
];

export interface StaffMember {
  id: string;
  name: string;
  phone: string;
  role: "Manager" | "Sales" | "Technician";
  store: string;
  status: "Active" | "Off-duty";
  joined: string;
}

export const staff: StaffMember[] = [
  { id: "S-01", name: "Karan Singh", phone: "+91 98111 22334", role: "Manager", store: "Bandra Flagship", status: "Active", joined: "2024-06-12" },
  { id: "S-02", name: "Priya Nair", phone: "+91 91222 55611", role: "Sales", store: "Bandra Flagship", status: "Active", joined: "2025-01-04" },
  { id: "S-03", name: "Vikram Rao", phone: "+91 96555 88332", role: "Technician", store: "Andheri Service", status: "Active", joined: "2024-09-20" },
  { id: "S-04", name: "Neha Iyer", phone: "+91 98811 66220", role: "Sales", store: "Powai Kiosk", status: "Off-duty", joined: "2025-04-11" },
];

export interface Customer {
  id: string;
  name: string;
  phone: string;
  orders: number;
  spent: number;
  since: string;
  tier: "Regular" | "Silver" | "Gold";
}

export const customers: Customer[] = [
  { id: "C-1001", name: "Aarav Sharma", phone: "+91 98200 12345", orders: 4, spent: 148000, since: "2024-03-10", tier: "Gold" },
  { id: "C-1002", name: "Ishita Verma", phone: "+91 99820 55671", orders: 2, spent: 71998, since: "2025-02-01", tier: "Silver" },
  { id: "C-1003", name: "Rohan Mehta", phone: "+91 90000 33221", orders: 1, spent: 14999, since: "2025-08-16", tier: "Regular" },
  { id: "C-1004", name: "Sneha Kapoor", phone: "+91 88888 12000", orders: 3, spent: 132000, since: "2024-11-22", tier: "Gold" },
  { id: "C-1005", name: "Devansh Gupta", phone: "+91 97555 43210", orders: 1, spent: 32999, since: "2025-10-04", tier: "Regular" },
];

export const salesTrend = [
  { day: "Mon", sales: 42000 },
  { day: "Tue", sales: 58000 },
  { day: "Wed", sales: 51000 },
  { day: "Thu", sales: 72000 },
  { day: "Fri", sales: 88000 },
  { day: "Sat", sales: 124000 },
  { day: "Sun", sales: 96000 },
];

export const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
