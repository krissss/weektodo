import dbRepository from './dbRepository'

export default {
  update(repeatingEventId, repeatingEvent) {
    const db_req = dbRepository.open()
    db_req.onsuccess = function (event) {
      const db = event.target.result
      dbRepository.update(db, 'repeating_events', repeatingEventId, repeatingEvent)
    }
  },
  remove(repeatingEventId) {
    const db_req = dbRepository.open()
    db_req.onsuccess = function (event) {
      const db = event.target.result
      dbRepository.delete(db, 'repeating_events', repeatingEventId)
    }
  },
}
