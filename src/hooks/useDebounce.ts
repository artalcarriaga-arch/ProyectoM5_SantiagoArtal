import { useEffect, useState } from 'react';

// Este hook retrasa la actualización de un valor hasta que el usuario para de escribir
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Si el usuario vuelve a escribir antes de que pasen los milisegundos, limpiamos el timer anterior
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}