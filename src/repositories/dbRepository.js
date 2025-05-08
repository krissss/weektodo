export default {
  open() {
    const req = indexedDB.open('weekToDo', 4)
    req.onupgradeneeded = function (event) {
      const db = event.target.result
      if (!db.objectStoreNames.contains('todo_lists')) {
        db.createObjectStore('todo_lists', { autoIncrement: false })
      }

      if (!db.objectStoreNames.contains('repeating_events')) {
        db.createObjectStore('repeating_events', { autoIncrement: false })
      }

      if (!db.objectStoreNames.contains('repeating_events_by_date')) {
        db.createObjectStore('repeating_events_by_date', { autoIncrement: false })
      }
    }
    req.onerror = function (event) {
      console.log(`error opening database ${event.target.errorCode}`)
    }
    return req
  },
  get(db, table, id) {
    const tx = db.transaction([table], 'readonly')
    const store = tx.objectStore(table)
    const req = store.get(id)
    return req
  },
  add(db, table, id, obj) {
    const tx = db.transaction([table], 'readwrite')
    const store = tx.objectStore(table)
    const req = store.add(obj, id)
    return req
  },
  update(db, table, id, obj) {
    const tx = db.transaction([table], 'readwrite')
    const store = tx.objectStore(table)
    const new_obj = JSON.parse(JSON.stringify(obj))
    const req = store.put(new_obj, id)
    return req
  },
  delete(db, table, id) {
    const tx = db.transaction([table], 'readwrite')
    const store = tx.objectStore(table)
    const req = store.delete(id)
    return req
  },
  selectAll(db, table) {
    const tx = db.transaction([table], 'readwrite')
    const store = tx.objectStore(table)
    const req = store.openCursor()
    return req
  },
  clear(db, table) {
    const tx = db.transaction([table], 'readwrite')
    const store = tx.objectStore(table)
    const req = store.clear()
    return req
  },
}
