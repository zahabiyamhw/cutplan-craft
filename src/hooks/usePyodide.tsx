import { useState, useEffect } from 'react';

export const usePyodide = () => {
  const [pyodide, setPyodide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPyodide = async () => {
      try {
        // @ts-ignore
        const pyodideModule = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
        });
        
        await pyodideModule.loadPackage(['micropip']);
        const micropip = pyodideModule.pyimport('micropip');
        await micropip.install('svgwrite');
        
        setPyodide(pyodideModule);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Pyodide');
        setLoading(false);
      }
    };

    loadPyodide();
  }, []);

  return { pyodide, loading, error };
};
