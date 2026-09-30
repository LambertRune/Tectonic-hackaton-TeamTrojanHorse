import { useCallback, useEffect, useRef, useState } from 'react';

import { createSnapshot, getSnapshot, initialChoices, type DemoChoices, type DemoRequest, type PersonaId } from '@/data/demo';

const firstRequest = (): DemoRequest => ({ personaId: 'lotte', step: 0, choices: initialChoices() });

export function useDemo() {
  const request = useRef<DemoRequest>(firstRequest());
  const sequence = useRef(0);
  const [snapshot, setSnapshot] = useState(() => createSnapshot(firstRequest()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => { sequence.current++; }, []);

  const load = useCallback(async (next: DemoRequest) => {
    request.current = next;
    const revision = ++sequence.current;
    setLoading(true);
    setError(null);
    try {
      const result = await getSnapshot(next);
      if (revision === sequence.current) setSnapshot(result);
    } catch {
      if (revision === sequence.current) setError('Het weerbericht kon niet worden geladen. Probeer opnieuw.');
    } finally {
      if (revision === sequence.current) setLoading(false);
    }
  }, []);

  const patchChoices = useCallback((patch: Partial<DemoChoices>) => {
    void load({ ...request.current, choices: { ...request.current.choices, ...patch } });
  }, [load]);
  const choosePersona = useCallback((personaId: PersonaId) => { void load({ personaId, step: 0, choices: initialChoices() }); }, [load]);
  const nextStep = useCallback(() => { void load({ ...request.current, step: 1 }); }, [load]);
  const reset = useCallback(() => { void load({ personaId: request.current.personaId, step: 0, choices: initialChoices() }); }, [load]);
  const retry = useCallback(() => { void load(request.current); }, [load]);

  return { snapshot, loading, error, patchChoices, choosePersona, nextStep, reset, retry };
}
