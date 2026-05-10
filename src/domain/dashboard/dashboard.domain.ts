export interface DashboardCounts {
  warehouses: number;
  articles: number;
  lowStockCount: number;
  todayProcurementsCount: number;
}

export interface DashboardWarehouseStat {
  warehouseId: string;
  name: string;
  color: string;
  initials: string;
  articleCount: number;
  totalQuantity: string;
  totalValue: string;
  currency: string;
}

export interface DashboardActivityActor {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  initials: string;
}

export interface DashboardActivityEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  user: DashboardActivityActor | null;
  before: unknown;
  after: unknown;
  createdAt: string;
}

export class DashboardOverview {
  constructor(
    readonly counts: DashboardCounts,
    readonly perWarehouse: DashboardWarehouseStat[],
    readonly recentActivity: DashboardActivityEntry[],
  ) {}
}
