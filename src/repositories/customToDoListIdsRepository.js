import storageRepository from './storageRepository'

export default {
  load() {
    const customToDoList = storageRepository.get('customTodoListIds')
    if (customToDoList) {
      return customToDoList
    }
    else {
      storageRepository.set('customTodoListIds', [])
      return []
    }
  },
  update(customToDoList) {
    storageRepository.set('customTodoListIds', customToDoList)
  },
}
