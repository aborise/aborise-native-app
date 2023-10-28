import { useStorage } from "~/composables/useStorage";
import { uuid } from "./helpers";

let userId = "";

export const getUserId = () => {
  return userId;
};

export const ensureDataLoaded = async () => {
  await loadUserId();
};

const loadUserId = async () => {
  const storage = useStorage("local");
  userId = (await storage.get("userId"))!;
  if (!userId) {
    userId = uuid();
    await storage.set("userId", userId);
  }

  return userId;
};
