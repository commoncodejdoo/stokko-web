import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Warehouse as WarehouseIcon } from 'lucide-react';
import { PageHeader } from '@/view/common/components/page-header.component';
import { Card } from '@/view/common/components/card.component';
import { Button } from '@/view/common/components/button.component';
import { Spinner } from '@/view/common/components/spinner.component';
import { EmptyState } from '@/view/common/components/empty-state.component';
import { Pill } from '@/view/common/components/pill.component';
import { useAuthStore } from '@/view/common/store/auth-store';
import { canEditCatalog } from '@/domain/common/role';
import { WAREHOUSE_KIND_LABELS_HR } from '@/domain/warehouses';
import { useWarehouses } from './warehouses.hook';
import { WarehouseFormModal } from './warehouse-form.modal';

export function WarehousesListScreen() {
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.user?.role);
  const warehouses = useWarehouses();
  const [createOpen, setCreateOpen] = useState(false);

  const canCreate = role ? canEditCatalog(role) : false;

  return (
    <div>
      <PageHeader
        title="Skladišta"
        sub={
          warehouses.data
            ? `${warehouses.data.length} ${
                warehouses.data.length === 1 ? 'lokacija' : 'lokacija(e)'
              }`
            : undefined
        }
        breadcrumb={'Skladišta'}
        actions={
          canCreate && (
            <Button
              variant="primary"
              icon={<Plus size={14} />}
              onClick={() => setCreateOpen(true)}
            >
              Novo skladište
            </Button>
          )
        }
      />

      <div className="px-8 py-6">
        {warehouses.isPending ? (
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>
        ) : warehouses.isError ? (
          <Card padding="lg">
            <div className="text-danger text-2xs">Greška pri dohvaćanju skladišta.</div>
          </Card>
        ) : warehouses.data.length === 0 ? (
          <EmptyState
            icon={<WarehouseIcon size={28} />}
            title="Još nema skladišta"
            description="Dodaj prvo skladište kako bi mogao pratiti zalihe."
            action={
              canCreate && (
                <Button
                  variant="primary"
                  icon={<Plus size={14} />}
                  onClick={() => setCreateOpen(true)}
                >
                  Novo skladište
                </Button>
              )
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {warehouses.data.map((w) => (
              <Card
                key={w.id}
                padding="lg"
                className="cursor-pointer hover:bg-card-hi transition-colors"
                onClick={() => navigate(`/skladista/${w.id}`)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      style={{ background: w.color }}
                      className="size-9 rounded-lg flex items-center justify-center text-white"
                    >
                      <WarehouseIcon size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[15px] font-semibold truncate">{w.name}</div>
                      <div className="text-2xs text-muted">
                        {WAREHOUSE_KIND_LABELS_HR[w.kind]}
                      </div>
                    </div>
                  </div>
                  <Pill color="muted">{w.initials}</Pill>
                </div>
                <div className="pt-3 border-t border-border text-2xs text-muted">
                  Kliknite za detalje, artikle i statistiku.
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <WarehouseFormModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
