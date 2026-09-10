import type { WorkItemRepository } from '@/application/work-items/work-item-repository';

import { createMockWorkItems } from './mock-work-items';

type MockWorkItemRepositoryOptions = {
  latencyMs?: number;
  shouldFail?: boolean;
};

export class MockWorkItemRepository implements WorkItemRepository {
  constructor(
    private readonly options: MockWorkItemRepositoryOptions = {},
  ) {}

  async findAll() {
    await new Promise((resolve) =>
      setTimeout(resolve, this.options.latencyMs ?? 350),
    );

    if (this.options.shouldFail) {
      throw new Error('Não foi possível carregar sua fila.');
    }

    return createMockWorkItems().map((item) => ({ ...item }));
  }
}

export const mockWorkItemRepository = new MockWorkItemRepository();
