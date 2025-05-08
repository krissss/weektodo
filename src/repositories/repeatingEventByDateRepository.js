import dbRepository from './dbRepository'

export default {
  update(date, generatedRepeatingEvents) {
    const db_req = dbRepository.open()
    db_req.onsuccess = function (event) {
      const db = event.target.result
      dbRepository.update(db, 'repeating_events_by_date', date, generatedRepeatingEvents)
    }
  },
  remove(date) {
    const db_req = dbRepository.open()
    db_req.onsuccess = function (event) {
      const db = event.target.result
      dbRepository.delete(db, 'repeating_events_by_date', date)
    }
  },
}
