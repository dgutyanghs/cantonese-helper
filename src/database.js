/**
 * For saving and retrieving user's words from IndexedDB
 */
class MyDatabase {
    static instance;

    constructor() {
        this.dbName = 'myDatabase2';
        this.dbVersion = 1;
        this.storeName = 'myStore2';
        this.db = null;
    }

    static getInstance() {
        if (!MyDatabase.instance) {
            MyDatabase.instance = new MyDatabase();
        }
        return MyDatabase.instance;
    }

    // rest of the class remains the same
    // open() {
    //     const request = indexedDB.open(this.dbName, this.dbVersion);
    //     request.onerror = event => {
    //         console.error('Error opening database:', event.target.error);
    //     };
    //     request.onsuccess = event => {
    //         this.db = event.target.result;
    //         console.log('Database opened successfully:', this.db);
    //     };
    //     request.onupgradeneeded = event => {
    //         const db = event.target.result;
    //         const store = db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
    //         store.createIndex('textKey', 'textKey', { unique: true });
    //         console.log('Database upgraded successfully:', db);
    //     };
    // }

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
                store.createIndex('textKey', 'textKey', { unique: true });
                console.log('Database upgraded successfully:', db);
            };
        });
    }

    // add2(textKey, data) {
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

    add(textKey, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(this.storeName, 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.add({ textKey, data });
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

    getData(textKey, callbackFn) {
        const transaction = this.db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const index = store.index('textKey');
        const request = index.get(textKey);
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
            console.log('All data retrieved successfully:', event.target.result);
            // return event.target.result;
            if (callbackFn) {
                callbackFn(event.target.result);
            }
        };
    }

    update(id, data) {
        const transaction = this.db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.put(data, id);
        request.onerror = event => {
            console.error('Error updating data:', event.target.error);
        };
        request.onsuccess = event => {
            console.log('Data updated successfully:', event.target.result);
        };
    }

    delete(id) {
        const transaction = this.db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(id);
        request.onerror = event => {
            console.error('Error deleting data:', event.target.error);
        };
        request.onsuccess = event => {
            console.log('Data deleted successfully:', event.target.result);
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
