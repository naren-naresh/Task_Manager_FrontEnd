import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { indexedDB, IDBKeyRange, IDBRequest, IDBTransaction, IDBDatabase, IDBObjectStore, IDBIndex } from 'fake-indexeddb';

// Inject all necessary IDB globals
global.indexedDB = indexedDB;
global.IDBKeyRange = IDBKeyRange;
global.IDBRequest = IDBRequest;
global.IDBTransaction = IDBTransaction;
global.IDBDatabase = IDBDatabase;
global.IDBObjectStore = IDBObjectStore;
global.IDBIndex = IDBIndex;

expect.extend(matchers);

afterEach(() => {
  cleanup();
});