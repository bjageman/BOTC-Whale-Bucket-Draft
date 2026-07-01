import { useEffect, useRef, useState } from 'react';

/**
 * Buffers a text field locally per entity (e.g. a player id) and only flushes
 * it via onFlush when the entity changes or the component unmounts, instead
 * of writing on every keystroke.
 */
export function useBufferedField(
  entityId: string,
  originalValue: string,
  onFlush: (id: string, value: string) => void
) {
  const [value, setValue] = useState(originalValue);
  const lastEntityId = useRef(entityId);
  const lastValue = useRef(value);
  const lastOriginalValue = useRef(originalValue);

  useEffect(() => {
    lastValue.current = value;
  }, [value]);

  useEffect(() => {
    lastOriginalValue.current = originalValue;
  }, [originalValue]);

  useEffect(() => {
    if (entityId !== lastEntityId.current) {
      const prevId = lastEntityId.current;
      const prevValue = lastValue.current;
      if (prevValue !== lastOriginalValue.current) {
        onFlush(prevId, prevValue);
      }
      lastEntityId.current = entityId;
      setValue(originalValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityId, originalValue]);

  useEffect(() => {
    return () => {
      if (lastValue.current !== lastOriginalValue.current) {
        onFlush(lastEntityId.current, lastValue.current);
      }
    };
  }, [onFlush]);

  return [value, setValue] as const;
}
