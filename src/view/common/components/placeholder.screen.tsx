import { PageHeader } from './page-header.component';
import { Card } from './card.component';

interface PlaceholderScreenProps {
  title: string;
  description: string;
}

/**
 * Used during phased rollout for routes whose feature isn't implemented yet.
 * Provides a consistent shell so navigation feels complete.
 */
export function PlaceholderScreen({ title, description }: PlaceholderScreenProps) {
  return (
    <div>
      <PageHeader title={title} sub="Uskoro" breadcrumb={title} />
      <div className="px-8 py-6">
        <Card padding="lg">
          <p className="text-2xs text-muted m-0">{description}</p>
        </Card>
      </div>
    </div>
  );
}
