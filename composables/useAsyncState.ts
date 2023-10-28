import { useEffect, useState } from "react";

export const useAsyncState = <T>(
  initialValue: () => Promise<T>,
  save?: (val: T) => Promise<void>
) => {
  const [value, setValue] = useState<T>();
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    initialValue()
      .then((value) => {
        setValue(value);
      })
      .catch((error) => {
        setError(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const setValueAndSave = (val: T) => {
    setSaving(true);
    const promise = save ? save(val) : Promise.resolve();
    promise
      .then(() => {
        setValue(val);
      })
      .catch((error) => {
        setError(error);
      })
      .finally(() => {
        setSaving(false);
      });
  };

  return { value, error, loading, saving, setValue: setValueAndSave };
};

export const useAsyncStateReadonly = <T>(initialValue: () => Promise<T>) => {
  const [value, setValue] = useState<T>();
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initialValue()
      .then((value) => {
        setValue(value);
      })
      .catch((error) => {
        setError(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { value, error, loading };
};
