import { describe, expect, it } from 'vitest';

import { MockWorkItemRepository } from './mock-work-item-repository';

describe('MockWorkItemRepository', () => {
  it('returns defensive copies of realistic items', async () => {
    const repository = new MockWorkItemRepository({ latencyMs: 0 });

    const firstResult = await repository.findAll();
    firstResult.pop();
    const secondResult = await repository.findAll();

    expect(secondResult).toHaveLength(9);
    expect(secondResult.map((item) => item.source)).toEqual(
      expect.arrayContaining(['jira', 'salesforce', 'email']),
    );
  });

  it('can simulate an infrastructure failure', async () => {
    const repository = new MockWorkItemRepository({
      latencyMs: 0,
      shouldFail: true,
    });

    await expect(repository.findAll()).rejects.toThrow(
      'Não foi possível carregar sua fila.',
    );
  });
});
