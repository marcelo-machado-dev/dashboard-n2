'use client';

import { useCallback, useEffect, useState } from 'react';

import type { WorkItemRepository } from '@/application/work-items/work-item-repository';
import type { WorkItem } from '@/domain/work-items/work-item';

type LoadStatus = 'loading' | 'success' | 'error';

export function useWorkItems(repository: WorkItemRepository) {
  const [items, setItems] = useState<WorkItem[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [error, setError] = useState<string>();

  const retry = useCallback(async () => {
    setStatus('loading');
    setError(undefined);

    try {
      setItems(await repository.findAll());
      setStatus('success');
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível carregar sua fila.',
      );
      setStatus('error');
    }
  }, [repository]);

  useEffect(() => {
    let cancelled = false;

    repository.findAll().then(
      (loadedItems) => {
        if (cancelled) return;
        setItems(loadedItems);
        setStatus('success');
      },
      (cause: unknown) => {
        if (cancelled) return;
        setError(
          cause instanceof Error
            ? cause.message
            : 'Não foi possível carregar sua fila.',
        );
        setStatus('error');
      },
    );

    return () => {
      cancelled = true;
    };
  }, [repository]);

  return { items, status, error, retry };
}
