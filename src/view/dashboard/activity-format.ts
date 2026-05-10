import { DashboardActivityEntry } from '@/domain/dashboard/dashboard.domain';

const ACTION_VERB: Record<string, string> = {
  PROCUREMENT_CREATED: 'evidentirao/la nabavu',
  CORRECTION_CREATED: 'korigirao/la zalihu',
  ARTICLE_CREATED: 'dodao/la artikl',
  ARTICLE_UPDATED: 'ažurirao/la artikl',
  ARTICLE_DELETED: 'obrisao/la artikl',
  WAREHOUSE_CREATED: 'dodao/la skladište',
  WAREHOUSE_UPDATED: 'ažurirao/la skladište',
  WAREHOUSE_DELETED: 'obrisao/la skladište',
  SUPPLIER_CREATED: 'dodao/la dobavljača',
  SUPPLIER_UPDATED: 'ažurirao/la dobavljača',
  SUPPLIER_DELETED: 'obrisao/la dobavljača',
  CATEGORY_CREATED: 'dodao/la kategoriju',
  USER_CREATED: 'pozvao/la korisnika',
  USER_UPDATED: 'ažurirao/la korisnika',
  USER_DELETED: 'uklonio/la korisnika',
};

export function formatActivity(entry: DashboardActivityEntry): string {
  const verb = ACTION_VERB[entry.action] ?? entry.action.toLowerCase().replace(/_/g, ' ');
  return verb;
}

export function formatRelativeTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const diffMs = Date.now() - d.getTime();
  const sec = Math.round(diffMs / 1000);
  if (sec < 60) return 'sad';
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} min`;
  const hour = Math.round(min / 60);
  if (hour < 24) return `${hour} h`;
  const day = Math.round(hour / 24);
  if (day < 7) return `${day} d`;
  return d.toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
