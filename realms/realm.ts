import { createUseQuery } from '@realm/react/src/useQuery';
import { createUseRealm } from '@realm/react/src/useRealm';
import Realm from 'realm';

export let realm: Realm | null = null;
export const getRealm = () => {
  return realm!;
};

export const setRealm = (newRealm: Realm) => {
  realm = newRealm;
};

export type SchemaToData<T extends { schema: Realm.ObjectSchema }> = T extends {
  schema: Realm.ObjectSchema;
  new (...args: any): any;
}
  ? { [K in keyof T['schema']['properties']]: InstanceType<T>[K] }
  : never;

////////////////////////////////////////////////////////////////////////////
//
// Copyright 2021 Realm Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////

import { CachedObject, createCachedObject } from '@realm/react/src/cachedObject';
import { CollectionCallback, getObjectForPrimaryKey, getObjects } from '@realm/react/src/helpers';
import { useEffect, useMemo, useReducer, useRef } from 'react';

/**
 * Generates the `useObject` hook from a given `useRealm` hook.
 * @param useRealm - Hook that returns an open Realm instance
 * @returns useObject - Hook that is used to gain access to a single Realm object from a primary key
 */
export function createUseObject(useRealm: () => Realm) {
  function useObject<T>(type: string, primaryKey: T[keyof T]): (T & Realm.Object<T>) | null;
  function useObject<T extends Realm.Object<any>>(type: { new (...args: any): T }, primaryKey: T[keyof T]): T | null;
  function useObject<T extends Realm.Object>(
    type: string | { new (...args: any): T },
    primaryKey: T[keyof T],
  ): T | null {
    const realm = useRealm();

    // Create a forceRerender function for the cachedObject to use as its updateCallback, so that
    // the cachedObject can force the component using this hook to re-render when a change occurs.
    const [, forceRerender] = useReducer((x) => x + 1, 0);

    // Get the original object from the realm, so we can check if it exists
    const originalObject = getObjectForPrimaryKey(realm, type, primaryKey);

    // Store the primaryKey as a ref, since when it is an objectId or UUID, it will be a new instance on every render
    const primaryKeyRef = useRef(primaryKey);

    const collectionRef = useRef(getObjects(realm, type));

    const objectRef = useRef<T & Realm.Object<T>>();
    const updatedRef = useRef(true);

    // Initializing references with a function call or class constructor will
    // cause the function or constructor to be called on ever render.
    // Even though this value is thrown away on subsequent renders, `createCachedObject` will end up registering a listener.
    // Therefore, we initialize the references with null, and only create the object if it is null
    // Ref: https://github.com/facebook/react/issues/14490
    const cachedObjectRef = useRef<null | CachedObject>(null);

    if (!cachedObjectRef.current) {
      cachedObjectRef.current = createCachedObject({
        object: originalObject ?? null,
        realm,
        updateCallback: forceRerender,
        updatedRef,
      });
    }

    // Create a ref, since the object returned from `objectForPrimaryKey` is always going to have a different reference
    const originalObjectRef = useRef(originalObject);

    // Wrap the cachedObject in useMemo, so we only replace it with a new instance if `primaryKey` or `type` change
    const { object, tearDown } = useMemo(
      // TODO: There will be an upcoming breaking change that makes objectForPrimaryKey return null
      // When this is implemented, remove `?? null`
      () => {
        // This should never happen, but if it does, we want to return a null result
        if (!cachedObjectRef.current) {
          return { object: null, tearDown: () => undefined };
        }

        // Re-instantiate the cachedObject if the primaryKey has changed or the originalObject has gone from null to not null
        if (
          !arePrimaryKeysIdentical(primaryKey, primaryKeyRef.current) ||
          (!originalObjectRef.current && originalObject)
        ) {
          cachedObjectRef.current = createCachedObject({
            object: originalObject ?? null,
            realm,
            updateCallback: forceRerender,
            updatedRef,
          });
          originalObjectRef.current = originalObject;

          // Primary key has updated, so update the reference
          primaryKeyRef.current = primaryKey;
          // Signal that the object reference needs to be updated
          updatedRef.current = true;
        }
        return cachedObjectRef.current;
      },
      [realm, originalObject, primaryKey],
    );

    // Invoke the tearDown of the cachedObject when useObject is unmounted
    useEffect(() => {
      return tearDown;
    }, [tearDown]);

    // If the object doesn't exist, listen for insertions to the collection and force a rerender if the inserted object has the correct primary key
    useEffect(() => {
      const collection = collectionRef.current;
      const collectionListener: CollectionCallback = (_, changes) => {
        const primaryKeyProperty = collection?.[0]?.objectSchema()?.primaryKey;
        for (const index of changes.insertions) {
          const object = collection[index];
          if (primaryKeyProperty) {
            //@ts-expect-error - if the primaryKeyProperty exists, then it is indexable. However, we don't allow it when we don't actually know the type of the object
            const insertedPrimaryKey = object[primaryKeyProperty];
            if (arePrimaryKeysIdentical(insertedPrimaryKey, primaryKeyRef.current)) {
              forceRerender();
              collection.removeListener(collectionListener);
              break;
            }
          }
        }
      };

      if (!originalObjectRef.current) {
        collection.addListener(collectionListener);
      }

      return () => {
        // If the app is closing, the realm will be closed and the listener does not need to be removed if
        if (!realm.isClosed && collection) {
          collection.removeListener(collectionListener);
        }
      };
    }, [realm, type, forceRerender]);

    // If the object has been deleted or doesn't exist for the given primary key, just return null
    if (!object?.isValid()) {
      return null;
    }

    if (updatedRef.current) {
      // Wrap object in a proxy to update the reference on rerender ( should only rerender when something has changed )
      objectRef.current = new Proxy(object, {}) as T & Realm.Object<T>;
      updatedRef.current = false;
    }
    // This will never be undefined, but the type system doesn't know that
    return objectRef.current as T;
  }

  return useObject;
}

// This is a helper function that determines if two primary keys are equal.  It will also handle the case where the primary key is an ObjectId or UUID
function arePrimaryKeysIdentical(a: unknown, b: unknown): boolean {
  if (typeof a !== typeof b) {
    return false;
  }
  if (typeof a === 'string' || typeof a === 'number') {
    return a === b;
  }
  if (a instanceof Realm.BSON.ObjectId && b instanceof Realm.BSON.ObjectId) {
    return a.toHexString() === b.toHexString();
  }
  if (a instanceof Realm.BSON.UUID && b instanceof Realm.BSON.UUID) {
    return a.toHexString() === b.toHexString();
  }
  return false;
}

type RealmContext = {
  /**
   * Returns the instance of the {@link Realm} opened by the `RealmProvider`.
   * @example
   * ```
   * const realm = useRealm();
   * ```
   * @returns a realm instance
   */
  useRealm: ReturnType<typeof createUseRealm>;
  /**
   * Returns a {@link Realm.Collection} of {@link Realm.Object}s from a given type.
   * The hook will update on any changes to any object in the collection
   * and return an empty array if the collection is empty.
   *
   * The result of this can be consumed directly by the `data` argument of any React Native
   * VirtualizedList or FlatList.  If the component used for the list's `renderItem` prop is {@link React.Memo}ized,
   * then only the modified object will re-render.
   * @example
   * ```tsx
   * // Return all collection items
   * const collection = useQuery(Object)
   *
   * // Return all collection items sorted by name and filtered by category
   * const filteredAndSorted = useQuery(Object, (collection) => collection.filtered('category == $0',category).sorted('name'), [category]);
   * ```
   * @param type - The object type, depicted by a string or a class extending Realm.Object
   * @param query - A function that takes a {@link Realm.Collection} and returns a {@link Realm.Collection} of the same type.
   * This allows for filtering and sorting of the collection, before it is returned.
   * @param deps - An array of dependencies that will be passed to {@link React.useMemo}
   * @returns a collection of realm objects or an empty array
   */
  useQuery: ReturnType<typeof createUseQuery>;
  /**
   * Returns a {@link Realm.Object} from a given type and value of primary key.
   * The hook will update on any changes to the properties on the returned object
   * and return null if it either doesn't exists or has been deleted.
   * @example
   * ```
   * const object = useObject(ObjectClass, objectId);
   * ```
   * @param type - The object type, depicted by a string or a class extending {@link Realm.Object}
   * @param primaryKey - The primary key of the desired object which will be retrieved using {@link Realm.objectForPrimaryKey}
   * @returns either the desired {@link Realm.Object} or `null` in the case of it being deleted or not existing.
   */
  useObject: ReturnType<typeof createUseObject>;
};

// export const useRealm = getRealm;
// export const useQuery = createUseQuery(getRealm);
// export const useObject = createUseObject(getRealm);
export { useRealm, useQuery, useObject } from '@realm/react';
