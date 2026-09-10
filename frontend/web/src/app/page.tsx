'use client';

import { mockWorkItemRepository } from '@/infrastructure/work-items/mock-work-item-repository';
import { DashboardPage } from '@/presentation/pages/dashboard/dashboard-page';

export default function Home() {
  return <DashboardPage repository={mockWorkItemRepository} />;
}
