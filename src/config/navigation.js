import {
  LayoutDashboard,
  ShoppingCart,
  Shirt,
  Boxes,
  Receipt,
  ShoppingBag,
  Users,
  Truck,
  RotateCcw,
  Wallet,
  ArrowDownLeft,
  ChartNoAxesCombined,
  Tag,
  Building2,
  ShieldCheck,
  Clock,
  FileClock,
  Settings,
} from "lucide-react";

export const nav = [
  [
    "Overview",
    [
      ["dashboard", "Overview", LayoutDashboard, null],
      ["pos", "Point of sale", ShoppingCart, "sales"],
    ],
  ],
  [
    "Manage",
    [
      ["products", "Products", Shirt, null],
      ["inventory", "Inventory", Boxes, "stock"],
      ["sales", "Sales & invoices", Receipt, "sales"],
      ["purchases", "Purchases", ShoppingBag, "purchases"],
      ["customers", "Customers", Users, "customers"],
      ["suppliers", "Suppliers", Truck, "purchases"],
    ],
  ],
  [
    "Finance",
    [
      ["returns", "Returns & refunds", RotateCcw, "returns"],
      ["payments", "Payments", Wallet, "reports"],
      ["expenses", "Expenses", ArrowDownLeft, "expenses"],
      ["reports", "Reports", ChartNoAxesCombined, "reports"],
    ],
  ],
  [
    "Workspace",
    [
      ["categories", "Categories", Tag, "products"],
      ["brands", "Brands", Building2, "products"],
      ["staff", "Staff & access", ShieldCheck, "admin"],
      ["shifts", "My shifts", Clock, "sales"],
      ["audit", "Activity log", FileClock, "admin"],
      ["settings", "Settings", Settings, "admin"],
    ],
  ],
];
