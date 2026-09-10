'use client';

import { mockWorkItemRepository } from '@/infrastructure/work-items/mock-work-item-repository';
import { QueuePage } from '@/presentation/pages/queue/queue-page';

export default function QueueRoute() {
  return <QueuePage repository={mockWorkItemRepository} />;
}
