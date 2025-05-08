import { createStore } from 'vuex'
import actions from './modules/actions.store'
import activeTodo from './modules/activeTodo.store'
import config from './modules/config.store'
import mainStore from './modules/main.store'
import notifications from './modules/notifications.store'
import repeatingEvents from './modules/repeatingEvent.store'
import repeatingEventsDataCache from './modules/repeatingEventDateCache.store'
import todoLists from './modules/todolist.store'

export const store = createStore({
  modules: {
    config,
    todoLists,
    actions,
    notifications,
    repeatingEvents,
    repeatingEventsDataCache,
    mainStore,
    activeTodo,
  },
  state: {},
  getters: {},
  mutations: {},
  actions: {},
})
