import { QueueItem } from "~/shared/validators/queueItem";
import { Err, Ok } from "~/shared/Result";
import { services } from "~/shared/allServices";
import crypto from "crypto-js";
import { ref, getDatabase, get } from "firebase/database";
import { useFirebaseApp } from "~/composables/useFirebase";
import { BaseError } from "../api/helpers/BaseError";

const { AES, enc } = crypto;

export const getAuth = async (item: QueueItem) => {
  let auth: Record<string, string> = {};

  if (item.status === "pending") {
    let authData: Record<string, string> = {};

    {
      const app = useFirebaseApp();
      const dbRef = ref(
        getDatabase(app),
        "users/" + item.user + "/services/" + item.service + "/auth/"
      );
      const snapshot = await get(dbRef);
      authData = snapshot.val();
    }

    // const authData = await db
    //   .ref('users/' + item.user + '/services/' + item.service + '/auth/')
    //   .get()
    //   .then((snapshot) => snapshot.val());

    if (!authData) {
      const error = new BaseError({
        message: "Missing Auth Data",
        name: "ServerError",
      });
      return Err(error);
    }

    const serviceInfo = services[item.service];
    try {
      auth = serviceInfo.auth.reduce((acc, key) => {
        try {
          acc[key] = AES.decrypt(authData[key], item.pw).toString(enc.Utf8);
        } catch (e) {
          throw new BaseError({
            message: "Your masterkey is wrong",
            cause: e as Error,
            name: "UserError",
          });
        }

        return acc;
      }, {} as Record<string, string>);
    } catch (e) {
      return Err(e as BaseError);
    }
  }

  return Ok(auth);
};
