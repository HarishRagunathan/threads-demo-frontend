import { CustomersPage } from "../features/customers/CustomersPage.jsx";
import { SuppliersPage } from "../features/suppliers/SuppliersPage.jsx";
import { CategoriesPage } from "../features/categories/CategoriesPage.jsx";
import { BrandsPage } from "../features/brands/BrandsPage.jsx";
import { ExpensesPage } from "../features/expenses/ExpensesPage.jsx";
import { ReturnsPage } from "../features/returns/ReturnsPage.jsx";
import { PaymentsPage } from "../features/payments/PaymentsPage.jsx";
import { AuditPage } from "../features/audit/AuditPage.jsx";
import { SalesPage } from "../features/sales/SalesPage.jsx";
import { PurchasesPage } from "../features/purchases/PurchasesPage.jsx";
import { Dashboard } from "../features/dashboard/DashboardPage.jsx";
import { POS } from "../features/pos/POSPage.jsx";
import { Products } from "../features/products/ProductsPage.jsx";
import { Inventory } from "../features/inventory/InventoryPage.jsx";
import { Reports } from "../features/reports/ReportsPage.jsx";
import { SettingsPage } from "../features/settings/SettingsPage.jsx";
import { Staff } from "../features/staff/StaffPage.jsx";
import { Shifts } from "../features/shifts/ShiftsPage.jsx";

export const pages = {
  customers: CustomersPage,
  suppliers: SuppliersPage,
  categories: CategoriesPage,
  brands: BrandsPage,
  expenses: ExpensesPage,
  returns: ReturnsPage,
  payments: PaymentsPage,
  audit: AuditPage,
  sales: SalesPage,
  purchases: PurchasesPage,
  dashboard: Dashboard,
  pos: POS,
  products: Products,
  inventory: Inventory,
  reports: Reports,
  settings: SettingsPage,
  staff: Staff,
  shifts: Shifts,
};
