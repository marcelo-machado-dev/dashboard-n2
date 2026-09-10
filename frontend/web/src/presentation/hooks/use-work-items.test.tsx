import { act, renderHook, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import type { WorkItemRepository } from '@/application/work-items/work-item-repository';
import { createMockWorkItems } from '@/infrastructure/work-items/mock-work-items';

import { useWorkItems } from './use-work-items';

it('loads items and exposes a successful state', async () => {
  const repository: WorkItemRepository = {
    findAll: vi.fn().mockResolvedValue(createMockWorkItems()),
  };

  const { result } = renderHook(() => useWorkItems(repository));

  expect(result.current.status).toBe('loading');
  await waitFor(() => expect(result.current.status).toBe('success'));
  expect(result.current.items).toHaveLength(9);
});

it('retries after a repository failure', async () => {
  const findAll = vi
    .fn()
    .mockRejectedValueOnce(new Error('Falha'))
    .mockResolvedValueOnce(createMockWorkItems());
  const repository: WorkItemRepository = { findAll };

  const { result } = renderHook(() => useWorkItems(repository));

  await waitFor(() => expect(result.current.status).toBe('error'));
  await act(async () => result.current.retry());
  await waitFor(() => expect(result.current.status).toBe('success'));
  expect(findAll).toHaveBeenCalledTimes(2);
});
