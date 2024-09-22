/**
 * For saving and retrieving user's words from IndexedDB
 */

class MyDatabase {
    static instance;

    constructor() {
        this.dbName = 'cantonese_database';
        this.dbVersion = 1;
        this.storeName = 'my_store4';
        this.db = null;
    }

    static getInstance() {
        if (!MyDatabase.instance) {
            MyDatabase.instance = new MyDatabase();
        }
        return MyDatabase.instance;
    }

    static displayDate(date) {
        if (date === undefined || (date instanceof Date) === false) {
            console.log('date is undefined or not a date object. ', date);
            return "";
        }

        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hour = date.getHours().toString().padStart(2, '0');
        const minute = date.getMinutes().toString().padStart(2, '0');

        // console.log(`${year}-${month}-${day} ${hour}:${minute}`);
        return `${year}-${month}-${day} ${hour}:${minute}`;
    }

    open() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            request.onerror = event => {
                console.error('Error opening database:', event.target.error);
                reject(event.target.error);
            };
            request.onsuccess = event => {
                this.db = event.target.result;
                console.log('Database opened successfully:', this.db);
                resolve(this.db);
            };
            request.onupgradeneeded = event => {
                const db = event.target.result;
                const store = db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
                store.createIndex('text_key', 'text_key', { unique: true });
                console.log('Database upgraded successfully:', db);
            };
        });
    }

    add(text_key, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(this.storeName, 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const dateStr = MyDatabase.displayDate(new Date());
            // const dateStr = new Date().toISOString();
            const request = store.add({ text_key, data, date: dateStr });
            request.onerror = event => {
                console.error('Error adding data:', event.target.error);
                reject(event.target.error);
            };
            request.onsuccess = event => {
                console.log('Data added successfully:', event.target.result);
                resolve(event.target.result);
            };
        });
    }

    getData(text_key, callbackFn) {
        const transaction = this.db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const index = store.index('text_key');
        const request = index.get(text_key);
        request.onerror = event => {
            console.error('Error getting data:', event.target.error);
            if (callbackFn) {
                callbackFn(null);
            }
        };
        request.onsuccess = event => {
            const result = event.target.result;
            console.log('Data retrieved successfully:', result);
            if (callbackFn) {
                callbackFn(result ? result.data : null);
            }
        };
    }

    getAll(callbackFn) {
        const transaction = this.db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.getAll();

        request.onerror = event => {
            console.error('Error getting all data:', event.target.error);
            if (callbackFn) {
                callbackFn(null);
            }
        };

        request.onsuccess = event => {
            let result = event.target.result;

            // Reverse the order of the result array
            if (Array.isArray(result)) {
                result = result.reverse();
            }

            console.log('All data retrieved and reversed successfully:', result);
            if (callbackFn) {
                callbackFn(result ? result : null);
            }
        };
    }

    update(text_key, data) {
        const transaction = this.db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const index = store.index('text_key');
        // const request = index.delete(text_key);
        const request = index.put(data, text_key);
        request.onerror = event => {
            console.error('Error updating data:', event.target.error);
        };
        request.onsuccess = event => {
            console.log('Data updated successfully:', event.target.result);
        };
    }

    deleteAll(callbackFn) {
        const transaction = this.db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.clear();
        request.onerror = event => {
            console.error('Error deleting all data:', event.target.error);
            callbackFn(false);
        };
        request.onsuccess = event => {
            console.log('All data deleted successfully');
            callbackFn(true);
        };
    }

    deleteIds(idsArray, callbackFn) {
        if (callbackFn === undefined) {
            console.error('callbackFn is undefined');
            return;
        }

        if (!idsArray || !Array.isArray(idsArray) || idsArray.length === 0) {
            console.error('Invalid or empty idsArray:', idsArray);
            callbackFn(false);
            return;
        }

        const transaction = this.db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);

        let deletedCount = 0;

        transaction.oncomplete = () => {
            console.log(`${deletedCount} items deleted successfully`);
            callbackFn(true);
        };

        transaction.onerror = (event) => {
            console.error('Transaction error:', event.target.error);
            callbackFn(false);
        };

        idsArray.forEach((id) => {
            const request = store.delete(id);
            request.onsuccess = () => {
                deletedCount++;
            };
            request.onerror = (event) => {
                console.error(`Error deleting id ${id}:`, event.target.error);
            };
        });
    }


    delete(text_key, callbackFn) {
        if (!text_key || typeof text_key !== 'string') {
            console.error('Invalid text_key:', text_key);
            callbackFn(false);
            return;
        }

        const transaction = this.db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);

        console.log('Attempting to delete row with text_key:', text_key);

        // First, we need to find the row with the matching text_key
        const getRequest = store.index('text_key').get(text_key);

        getRequest.onerror = event => {
            console.error('Error finding row:', event.target.error);
            callbackFn(false);
        };

        getRequest.onsuccess = event => {
            const matchingRow = event.target.result;
            if (!matchingRow) {
                console.error('No row found with text_key:', text_key);
                callbackFn(false);
                return;
            }

            // Now that we have the matching row, we can delete it using its id
            const deleteRequest = store.delete(matchingRow.id);

            deleteRequest.onerror = event => {
                console.error('Error deleting data:', event.target.error);
                callbackFn(false);
            };

            deleteRequest.onsuccess = event => {
                console.log('Data deleted successfully');
                callbackFn(true);
            };
        };
    }
}

export const myDatabase = MyDatabase.getInstance();

// class MyDatabase {
//     static instance;

//     constructor() {
//         this.dbName = 'myDatabase3';
//         this.dbVersion = 1;
//         this.storeName = 'myStore3';
//         this.db = null;
//     }

//     static getInstance() {
//         if (!MyDatabase.instance) {
//             MyDatabase.instance = new MyDatabase();
//         }
//         return MyDatabase.instance;
//     }

//     open() {
//         return new Promise((resolve, reject) => {
//             const request = indexedDB.open(this.dbName, this.dbVersion);
//             request.onerror = event => {
//                 console.error('Error opening database:', event.target.error);
//                 reject(event.target.error);
//             };
//             request.onsuccess = event => {
//                 this.db = event.target.result;
//                 console.log('Database opened successfully:', this.db);
//                 resolve(this.db);
//             };
//             request.onupgradeneeded = event => {
//                 const db = event.target.result;
//                 const store = db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
//                 store.createIndex('textKey', 'textKey', { unique: true });
//                 console.log('Database upgraded successfully:', db);
//             };
//         });
//     }

// add(textKey, data) {
//     return new Promise((resolve, reject) => {
//         const transaction = this.db.transaction(this.storeName, 'readwrite');
//         const store = transaction.objectStore(this.storeName);
//         const request = store.add({ textKey, data });
//         request.onerror = event => {
//             console.error('Error adding data:', event.target.error);
//             reject(event.target.error);
//         };
//         request.onsuccess = event => {
//             console.log('Data added successfully:', event.target.result);
//             resolve(event.target.result);
//         };
//     });
// }

//     getData(textKey, callbackFn) {
//         const transaction = this.db.transaction(this.storeName, 'readonly');
//         const store = transaction.objectStore(this.storeName);
//         const index = store.index('textKey');
//         const request = index.get(textKey);
//         request.onerror = event => {
//             console.error('Error getting data:', event.target.error);
//             if (callbackFn) {
//                 callbackFn(null);
//             }
//         };
//         request.onsuccess = event => {
//             const result = event.target.result;
//             console.log('Data retrieved successfully:', result);
//             if (callbackFn) {
//                 callbackFn(result ? result.data : null);
//             }
//         };
//     }

//     // ... other methods remain the same
// }

// export const myDatabase = MyDatabase.getInstance();
