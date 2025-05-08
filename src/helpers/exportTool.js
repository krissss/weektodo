import { Modal, Toast } from 'bootstrap'
import migrations from '../migrations/migrations'
import dbRepository from '../repositories/dbRepository'
import storageRepository from '../repositories/storageRepository'

export default {
  export() {
    const filename = 'WeekToDoBackup.wtdb'
    const data = storageRepository.as_json()
    data.todoLists = {}
    data.repeating_events = {}
    data.repeating_events_by_date = {}
    const db_req = dbRepository.open()

    db_req.onsuccess = function (event) {
      const db = event.target.result
      const request = dbRepository.selectAll(db, 'todo_lists')
      request.onsuccess = function () {
        const cursor = request.result
        if (cursor) {
          data.todoLists[cursor.key] = cursor.value
          cursor.continue()
        }
        else {
          getRepeatinEventData(filename, data, event)
        }
      }
    }
  },
  import(event) {
    const fr = readFile(event.target.files)
    fr.onload = function () {
      const toast = new Toast(document.getElementById('invalidFile'))
      try {
        const data = JSON.parse(fr.result)
        if ('config' in data) {
          importData(data)
          migrations.migrate()
        }
        else {
          toast.show()
        }
      }
      catch (e) {
        toast.show()
      }
    }
  },
  clear() {
    storageRepository.clean()
    const db_req = dbRepository.open()
    db_req.onsuccess = function (event) {
      const db = event.target.result
      const request = dbRepository.clear(db, 'todo_lists')
      request.onsuccess = function () {
        const request2 = dbRepository.clear(db, 'repeating_events')
        request2.onsuccess = function () {
          const request3 = dbRepository.clear(db, 'repeating_events_by_date')
          request3.onsuccess = function () {
            location.reload()
          }
        }
      }
    }
  },
}

function getRepeatinEventData(filename, data, event) {
  const db = event.target.result
  const request = dbRepository.selectAll(db, 'repeating_events')
  request.onsuccess = function () {
    const cursor = request.result
    if (cursor) {
      data.repeating_events[cursor.key] = cursor.value
      cursor.continue()
    }
    else {
      getRepeatinEventByDateData(filename, data, event)
    }
  }
}

function getRepeatinEventByDateData(filename, data, event) {
  const db = event.target.result
  const request = dbRepository.selectAll(db, 'repeating_events_by_date')
  request.onsuccess = function () {
    const cursor = request.result
    if (cursor) {
      data.repeating_events_by_date[cursor.key] = cursor.value
      cursor.continue()
    }
    else {
      const string_data = JSON.stringify(data)
      createExportLink(filename, string_data)
    }
  }
}

function createExportLink(filename, fileBody) {
  const element = document.createElement('a')
  element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(fileBody)}`)
  element.setAttribute('download', filename)
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
  setTimeout(() => {
    const exportingModal = Modal.getInstance(document.getElementById('exportingModal'))
    exportingModal.hide()
  }, 1000)
}

function readFile(files) {
  const fileList = files
  let fr = null
  if (fileList[0]) {
    fr = new FileReader()
    fr.readAsText(fileList[0])
  }
  return fr
}

function importData(data) {
  importLocalStorageData(data)
  importIndexedDbData(data, 'todo_lists')
}

function importLocalStorageData(data) {
  storageRepository.clean()
  const configData = JSON.parse(data.config)
  configData.importing = true
  data.config = JSON.stringify(configData)
  storageRepository.load_json(data)
}

function importIndexedDbData(a_data, table) {
  const data = a_data
  const db_req = dbRepository.open()
  db_req.onsuccess = function (event) {
    const db = event.target.result
    const request = dbRepository.clear(db, table)
    request.onsuccess = function () {
      importDbRecords(db, data, table)
    }
  }
}

function importDbRecords(db, data_a, table) {
  let keys, data

  if (table == 'todo_lists') {
    keys = Object.keys(data_a.todoLists)
    data = data_a.todoLists
  }
  else if (table == 'repeating_events') {
    if (!('repeating_events' in data_a))
      location.reload() // if not exist is an old data, finish the import and reload
    keys = Object.keys(data_a.repeating_events)
    data = data_a.repeating_events
  }
  else {
    keys = Object.keys(data_a.repeating_events_by_date)
    data = data_a.repeating_events_by_date
  }

  let i = keys.length
  let req

  if (i == 0) {
    if (table == 'todo_lists') {
      importIndexedDbData(data_a, 'repeating_events')
    }
    else if (table == 'repeating_events') {
      importIndexedDbData(data_a, 'repeating_events_by_date')
    }
    else {
      location.reload()
    }
  }
  else {
    while (i--) {
      req = dbRepository.add(db, table, keys[i], data[keys[i]])
    }
    req.onsuccess = function () {
      if (table == 'todo_lists') {
        importIndexedDbData(data_a, 'repeating_events')
      }
      else if (table == 'repeating_events') {
        importIndexedDbData(data_a, 'repeating_events_by_date')
      }
      else {
        location.reload()
      }
    }
  }
}
