import { uuid } from "~/shared/helpers";
import { Storage, useStorage } from "./useStorage";
import { AllServices, Service, services } from "~/shared/allServices";
import { useEffect, useState } from "react";
import { getUserId } from "~/shared/ensureDataLoaded";
import { Err, Ok, wrapAsync } from "~/shared/Result";
import { BaseError } from "~/automations/api/helpers/BaseError";

const dataIsValid = (
  data: any,
  service: Service
): data is { [K in (typeof service.auth)[number]]: string } => {
  return (
    data &&
    typeof data === "object" &&
    service.auth.every((key) => data[key] !== "")
  );
};

export const getServiceLogin = <T extends keyof AllServices>(
  serviceId: T,
  storage: Storage = useStorage(
    (process.env.STORAGE_TYPE as "local") || "local",
    getUserId()
  )
) => {
  const userId = getUserId();
  const service = services[serviceId];

  return wrapAsync(
    storage
      .get(`${userId}/${serviceId}/login`)
      .then((data) => {
        if (dataIsValid(data, service)) {
          return Ok(data);
        }

        const error = new BaseError({
          message: "No login found",
          name: "UserError",
          code: "no-login",
        });

        return Err(error);
      })
      .catch((err) => {
        const error = new BaseError({
          message: "Couldn't load login",
          name: "ServerError",
          code: "load-login-error",
        });

        return Err(error);
      })
  );
};

export const useServiceLogin = <T extends keyof AllServices>(
  serviceId: T,
  storage: Storage = useStorage(
    (process.env.STORAGE_TYPE as "local") || "local",
    getUserId()
  )
) => {
  const service = services[serviceId];

  const [data, setData] =
    useState<{ [K in (typeof service.auth)[number]]: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const userId = getUserId();

  useEffect(() => {
    setLoading(true);
    storage.get(`${userId}/${serviceId}/login`).then((data) => {
      if (dataIsValid(data, service)) {
        setData(data);
      }
      setLoading(false);
    });
  }, []);

  const setLogin = (data: { [K in (typeof service.auth)[number]]: string }) => {
    setSaving(true);
    return storage.set(`${userId}/${serviceId}/login`, data).then(() => {
      setData(data);
      setSaving(false);
    });
  };

  return { data, loading, saving, setData: setLogin };
};
