<script>
import { Modal } from 'bootstrap'
import moment from 'moment'
import activeToDo from './components/activeToDo.vue'
import clearDataModal from './components/comfirmModals/clearDataModal.vue'
import clearListModal from './components/comfirmModals/clearListModal.vue'
import removeCustomList from './components/comfirmModals/removeCustomList'
import sideBar from './components/layout/sideBar'
import toastMessage from './components/toastMessage'
import toDoList from './components/toDoList'
import notifications from './helpers/notifications'
import taskHelper from './helpers/tasksHelper'
import migrations from './migrations/migrations'
import configRepository from './repositories/configRepository'
import customToDoListIdsRepository from './repositories/customToDoListIdsRepository'
import repeatingEventRepository from './repositories/repeatingEventRepository'
import toDoListRepository from './repositories/toDoListRepository'
import version_json from './repositories/version'
import aboutModal from './views/aboutModal'
import configModal from './views/configModal'
import donateModal from './views/donateModal'
import importingModal from './views/importingModal.vue'
import RecurrentEventsModal from './views/RecurrentEventsModal.vue'
import ReorderCustomListsModal from './views/ReorderCustomListsModal.vue'
import tipsModal from './views/tipsModal'
import toDoModal from './views/toDoModal/toDoModal'
import welcomeModal from './views/welcomeModal'

export default {
  name: 'App',
  components: {
    DonateModal: donateModal,
    ConfigModal: configModal,
    ToDoList: toDoList,
    SideBar: sideBar,
    RemoveCustomList: removeCustomList,
    AboutModal: aboutModal,
    WelcomeModal: welcomeModal,
    TipsModal: tipsModal,
    ToDoModal: toDoModal,
    ClearDataModal: clearDataModal,
    RecurrentEventsModal,
    ImportingModal: importingModal,
    ReorderCustomListsModal,
    ClearListModal: clearListModal,
    ToastMessage: toastMessage,
    ActiveToDo: activeToDo,
  },
  data() {
    return {
      selected_date: null,
      cTodoList: this.$store.getters.cTodoListIds,
      calendarHeight: 'calc(50% - 50px)',
      ipcRenderer: null,
      initialLoadCompleted: false,
      initialListToLoad: 0,
      initialListLoaded: 0,
    }
  },
  computed: {
    dates_array() {
      if (!this.selected_date)
        return []
      const dates_array = [moment(this.selected_date).subtract(1, 'd').format('YYYYMMDD'), this.selected_date]

      for (let i = 1; i < this.columns; i++) {
        dates_array.push(moment(this.selected_date).add(i, 'd').format('YYYYMMDD'))
      }

      if (this.$store.getters.config.startCalendarYesterday) {
        dates_array.unshift(moment(this.selected_date).subtract(2, 'd').format('YYYYMMDD'))
      }
      else {
        dates_array.push(moment(this.selected_date).add(this.columns, 'd').format('YYYYMMDD'))
      }

      this.$store.commit('updateSelectedDates', dates_array)
      return dates_array
    },
    showCustomList() {
      return this.$store.getters.config.customList
    },
    showCalendar() {
      return this.$store.getters.config.calendar
    },
    columns() {
      return this.$store.getters.config.columns
    },
    customColumns() {
      return this.$store.getters.config.customColumns
    },
    zoom() {
      return this.$store.getters.config.zoom
    },
    darkTheme() {
      return this.$store.getters.config.darkTheme
    },
    resizableStyle() {
      if (this.showCalendar && this.showCustomList) {
        return { height: this.calendarHeight }
      }
      else {
        return {}
      }
    },
    selectedTodo() {
      if (this.$store.getters.actions.selectedTodo) {
        return this.$store.getters.actions.selectedTodo
      }
      return null
    },
    activeTodo() {
      if (this.$store.getters.activeTodo) {
        return this.$store.getters.activeTodo
      }
      return null
    },
    mainDividerPositionClass() {
      if (this.$store.getters.config.mainDividerPosition == 0) {
        return 'on-bottom'
      }
      else if (this.$store.getters.config.mainDividerPosition == 1) {
        return 'on-center'
      }
      else {
        return 'on-top'
      }
    },
    hideTopListContainer() {
      if (!this.$store.getters.config.customList || !this.$store.getters.config.calendar)
        return false

      return this.$store.getters.config.mainDividerPosition == 2
    },
    hideBottomListContainer() {
      if (!this.$store.getters.config.customList || !this.$store.getters.config.calendar)
        return false

      return this.$store.getters.config.mainDividerPosition == 0
    },
  },
  beforeCreate() {
    const config = configRepository.load()
    if (version_json.version != config.version) {
      migrations.migrate()
    }

    if (Notification.permission !== 'denied') {
      Notification.requestPermission()
    }
    this.$store.commit('loadCustomTodoListsIds', customToDoListIdsRepository.load())
    this.$store.commit('loadConfig', configRepository.load())
    this.$i18n.locale = this.$store.getters.config.language

    this.$store.dispatch('loadAllRepeatingEvent').then(
      () => {
        const totalDaysCount = Number.parseInt(this.$store.getters.config.columns) + 2
        const totalCustomListCount = this.$store.getters.cTodoListIds.length
        this.initialListToLoad = totalDaysCount + totalCustomListCount
        this.deleteOldRepeatingEvents()
        this.selected_date = moment().format('YYYYMMDD')
        this.$nextTick(() => {
          this.weekResetScroll()
        })
        this.$store.commit('loadRepeatingEventDateCache', this.$store.getters.repeatingEventList)
      },
    )
  },
  mounted() {
    this.$refs.weekListContainer.scrollLeft = this.todoListWidth()
    this.calendarHeight = this.$store.getters.config.calendarHeight
    window.addEventListener('resize', this.weekResetScroll)
    document.onreadystatechange = () => {
      if (document.readyState == 'complete') {
        setTimeout(this.hideSplash, 500)
      }
    }

    if (this.$store.getters.config.importing) {
      this.$store.commit('updateConfig', { val: false, key: 'importing' })
      configRepository.update(this.$store.getters.config)
    }

    this.resetAppOnDayChange()
  },
  methods: {
    weekMoveLeft() {
      this.selected_date = moment(this.selected_date).subtract(1, 'd').format('YYYYMMDD')
      this.$refs.weekListContainer.scrollLeft = this.todoListWidth() * 2
      this.$refs.weekListContainer.scroll({
        left: this.$refs.weekListContainer.scrollLeft - this.todoListWidth(),
        top: 0,
        behavior: 'smooth',
      })
    },
    weekMoveRight() {
      this.selected_date = moment(this.selected_date).add(1, 'd').format('YYYYMMDD')
      this.$refs.weekListContainer.scrollLeft = 0
      this.$refs.weekListContainer.scroll({
        left: this.$refs.weekListContainer.scrollLeft + this.todoListWidth(),
        top: 0,
        behavior: 'smooth',
      })
    },
    deleteOldRepeatingEvents() {
      for (const event of Object.entries(this.$store.getters.repeatingEventList)) {
        if (moment(event[1].end_date).isBefore(moment())) {
          repeatingEventRepository.remove(event[0])
          this.$store.commit('removeRepeatingEvent', event[0])
        }
      }
    },
    weekResetScroll() {
      this.$refs.weekListContainer.scrollLeft = this.todoListWidth()
    },
    customMoveRight() {
      this.$refs.customListContainer.scrollLeft
        = this.$refs.customListContainer.scrollLeft + this.customTodoListWidth() - 13
    },
    customMoveLeft() {
      this.$refs.customListContainer.scrollLeft = this.$refs.customListContainer.scrollLeft - this.customTodoListWidth()
    },
    resetCustomList() {
      this.$nextTick(function () {
        this.$refs.customListContainer.scrollLeft = 0
      })
    },
    todoListWidth() {
      return this.$refs.weekListContainer.clientWidth / this.columns
    },
    customTodoListWidth() {
      return this.$refs.customListContainer.clientWidth / this.customColumns
    },
    setSelectedDate(date) {
      this.selected_date = date
      this.$nextTick(() => {
        document
          .getElementById(`list${date}`)
          .getElementsByClassName('new-todo-input')[0]
          .focus()
      })
    },
    hideSplash() {
      if (this.$store.getters.config.firstTimeOpen) {
        this.showWelcomeModal()
      }
    },
    showWelcomeModal() {
      const modal = new Modal(document.getElementById('welcomeModal'), {
        backdrop: 'static',
      })
      modal.show()
      this.$store.commit('updateConfig', { val: false, key: 'firstTimeOpen' })
      configRepository.update(this.$store.getters.config)
    },
    compatible() {
      return window.IndexedDB
    },
    resizerDblClick() {
      if (this.$store.getters.config.mainDividerPosition != 1)
        return

      this.calendarHeight = 'calc(50% - 50px)'
      this.$store.commit('updateConfig', {
        val: this.calendarHeight,
        key: 'calendarHeight',
      })
      configRepository.update(this.$store.getters.config)
    },
    resizerMouseDownHandler(e) {
      if (this.$store.getters.config.mainDividerPosition != 1)
        return

      this.resizerY = e.clientY - 50
      document.addEventListener('mousemove', this.resizerMouseMoveHandler)
      document.addEventListener('mouseup', this.resizerMouseUpHandler)
    },
    resizerMouseMoveHandler(e) {
      this.calendarHeight = `${((e.clientY - 50) * 100) / this.zoom}px`
    },
    resizerMouseUpHandler() {
      document.removeEventListener('mousemove', this.resizerMouseMoveHandler)
      document.removeEventListener('mouseup', this.resizerMouseUpHandler)
      this.$store.commit('updateConfig', {
        val: this.calendarHeight,
        key: 'calendarHeight',
      })
      configRepository.update(this.$store.getters.config)
    },
    refreshTodayNotifications() {
      notifications.refreshDayNotifications(this, moment().format('YYYYMMDD'))
    },
    todoListMounted() {
      this.methodsAfterInitialLoad()
    },
    methodsAfterInitialLoad() {
      if (!this.initialLoadCompleted) {
        this.initialListLoaded++
        if (this.initialListLoaded == this.initialListToLoad) {
          this.initialLoadCompleted = true
          if (this.$store.getters.config.moveOldTasks) {
            this.moveOldTasksToToday().then(() => {
              this.refreshTodayNotifications()
              this.$store.commit('updateConfig', { val: moment().format('YYYYMMDD'), key: 'lastDayOpened' })
              configRepository.update(this.$store.getters.config)
            })
          }
          else {
            this.refreshTodayNotifications()
            this.$store.commit('updateConfig', { val: moment().format('YYYYMMDD'), key: 'lastDayOpened' })
            configRepository.update(this.$store.getters.config)
          }
        }
      }
    },
    initialNotificationText() {
      const yesterdayTasks = this.$store.getters.todoLists[moment().subtract(1, 'd').format('YYYYMMDD')]
      const todayTasks = this.$store.getters.todoLists[moment().format('YYYYMMDD')]

      const yesterayPendingTasksCount = taskHelper.pendingTasksCount(yesterdayTasks)
      const todayPendingTasksCount = taskHelper.pendingTasksCount(todayTasks)

      if (yesterayPendingTasksCount == 0 && todayPendingTasksCount == 0) {
        return this.$t('notifications.noPendingTasksToday')
      }
      else if (yesterayPendingTasksCount == 0) {
        return this.$t('notifications.pendingTasksToday', [todayPendingTasksCount])
      }
      else if (todayPendingTasksCount == 0) {
        return this.$t('notifications.pendingTasksYesterday', [yesterayPendingTasksCount])
      }
      else {
        return this.$t('notifications.pendingTasksYesterdayAndToday', [yesterayPendingTasksCount, todayPendingTasksCount])
      }
    },
    resetAppOnDayChange() {
      const x = new moment()
      const y = new moment().add(1, 'd').startOf('date')
      const duration = moment.duration(y.diff(x)).asMilliseconds()

      setTimeout(
        () => {
          this.refreshTodayNotifications()
          this.resetAppOnDayChange()
        },
        duration,
      )
    },
    async moveOldTasksToToday() {
      const promise = new Promise((resolve) => {
        const todayListId = moment().format('YYYYMMDD')
        let daysBefore = moment().diff(moment(this.$store.getters.config.lastDayOpened), 'days')
        if (daysBefore == 0)
          daysBefore = 7
        for (let i = 1; i <= daysBefore; i++) {
          const listId = moment().subtract(i, 'd').format('YYYYMMDD')
          this.$store.dispatch('loadTodoLists', listId).then(() => {
            this.$store.commit('moveUndoneItems', { origenId: listId, destinyId: todayListId })
            toDoListRepository.update(listId, this.$store.getters.todoLists[listId])
            if (this.$store.getters.config.autoReorderTasks) {
              toDoListRepository.update(
                todayListId,
                tasksHelper.reorderTasksList(this.$store.getters.todoLists[todayListId]),
              )
            }
            else {
              toDoListRepository.update(todayListId, this.$store.getters.todoLists[todayListId])
            }
            if (i == daysBefore) {
              resolve('done!')
            }
          })
        }
      })
      return promise
    },
    setDividerPosition(position) {
      this.$nextTick(function () {
        document.getElementById('app-container').classList.add('scrolling')
        setTimeout(() => {
          document.getElementById('app-container').classList.remove('scrolling')
        }, 400)
        this.$store.commit('updateConfig', { val: position, key: 'mainDividerPosition' })
        configRepository.update(this.$store.getters.config)
      })
    },
    downloadNewVersion() {
      window.open('https://weektodo.me', '_blank')
    },
    seeChangeLog() {
      window.open('https://weektodo.me/changelog', '_blank')
    },
  },
}
</script>

<template>
  <input class="hidden-input-for-focus" type="text">
  <div v-show="compatible" id="app-container" class="app-container" :class="{ 'dark-theme': darkTheme }">
    <div class="hidden-mobile app-body" :style="{ zoom: `${zoom}%` }">
      <SideBar @change-date="setSelectedDate" />

      <div class="h-100 d-flex flex-column">
        <div
          v-show="showCalendar"
          ref="calendarContainer"
          class="todo-lists-container"
          :style="resizableStyle"
          :class="{
            'full-screen': !showCustomList,
            'hidden-lists-container': hideTopListContainer,
            'full-screen-divider': hideBottomListContainer,
          }"
        >
          <i ref="weekLeft" class="bi-chevron-left slider-btn" @click="weekMoveLeft" />
          <div ref="weekListContainer" class="todo-slider weekdays">
            <ToDoList
              v-for="date in dates_array"
              :id="date"
              :key="date"
              :show-custom-list="showCustomList"
              @todo-list-mounted="todoListMounted"
            />
          </div>
          <i ref="weekRight" class="bi-chevron-right slider-btn" @click="weekMoveRight" />
        </div>

        <div
          v-show="showCustomList && showCalendar"
          id="resizer"
          class="main-horizontal-divider"
          :class="mainDividerPositionClass"
          @mousedown="resizerMouseDownHandler"
          @dblclick="resizerDblClick"
        >
          <div class="inner-main-horizontal-divider" />
          <div class="divider-icons-container">
            <i
              class="bi-chevron-up move-to-center-up divider-icons"
              :title="$t('ui.restorePanel')"
              @click="setDividerPosition(1)"
            />
            <i
              class="bi-chevron-up move-to-corner-up divider-icons"
              :title="$t('ui.maximizeListPanel')"
              @click="setDividerPosition(2)"
            />
            <i
              class="bi-chevron-down move-to-center-down divider-icons"
              :title="$t('ui.restorePanel')"
              @click="setDividerPosition(1)"
            />
            <i
              class="bi-chevron-down move-to-corner-down divider-icons"
              :title="$t('ui.maximizeCalendarPanel')"
              @click="setDividerPosition(0)"
            />
          </div>
        </div>

        <div
          v-show="showCustomList"
          class="todo-lists-container"
          :class="{
            'full-screen': !showCalendar,
            'flex-grow-1': showCalendar,
            'hidden-lists-container': hideBottomListContainer,
          }"
        >
          <i
            class="bi-chevron-left slider-btn"
            :style="{
              visibility: cTodoList.length > customColumns ? 'visible' : 'hidden',
            }"
            @click="customMoveLeft"
          />
          <div ref="customListContainer" class="todo-slider slides">
            <ToDoList
              v-for="(cTodoList, index) in cTodoList"
              :id="cTodoList.listId"
              :key="cTodoList.listId"
              :custom-todo-list="true"
              :c-todo-list-index="index"
              :show-custom-list="showCustomList"
              @todo-list-mounted="todoListMounted"
            />
          </div>
          <i
            class="bi-chevron-right slider-btn"
            :style="{
              visibility: cTodoList.length > customColumns ? 'visible' : 'hidden',
            }"
            @click="customMoveRight"
          />
        </div>

        <div v-show="!showCustomList && !showCalendar" style="margin: auto">
          <img v-if="darkTheme" src="/img/WeekToDoDarkLogo.webp">
          <img v-else src="/img/WeekToDoLightLogo.webp">
        </div>
      </div>

      <RemoveCustomList />
      <ConfigModal :config-prop="$store.getters.config" @change-columns="weekResetScroll" />
      <ClearDataModal />
      <ClearListModal />
      <AboutModal />
      <DonateModal />
      <WelcomeModal />
      <TipsModal />
      <ToDoModal :selected-todo="selectedTodo" />
      <ActiveToDo :active-todo="activeTodo" />
      <RecurrentEventsModal />
      <ImportingModal id="importingModal" :text="$t('settings.importing')" />
      <ImportingModal id="exportingModal" :text="$t('settings.exporting')" />

      <ReorderCustomListsModal @reset-custom-list="resetCustomList" />
    </div>
    <div class="mobile d-flex flex-column justify-content-center align-items-center">
      <i class="bi-exclamation-diamond mb-4" style="font-size: 100px" />
      <h3 style="text-align: center">
        {{ $t("ui.mobileWarning") }}
      </h3>
    </div>

    <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 1056">
      <ToastMessage
        id="versionChanges"
        :text="$t('ui.softwareUpdated')"
        :sub-text="$t('ui.seeChanges')"
        @sub-text-click="seeChangeLog"
      />

      <ToastMessage
        id="newVersionAvailable"
        :text="$t('ui.newVersionAvailable')"
        :sub-text="$t('ui.download')"
        @sub-text-click="downloadNewVersion"
      />

      <ToastMessage id="copiedAddress" :text="$t('donate.copiedAddres')" />
    </div>
  </div>
  <div v-if="!compatible" class="compatible d-flex flex-column justify-content-center align-items-center p-5">
    <i class="bi-exclamation-diamond mb-4" style="font-size: 100px" />
    <h3 style="text-align: center">
      {{ $t("ui.compatible") }}
    </h3>
  </div>
</template>

<style lang="scss">
body {
  line-height: unset !important;
}

.todo-lists-container {
  display: flex;
  overflow: auto;
  min-height: 5px;
  height: 5px;
  transition: height 0.15s ease-out 0s;
  margin-top: 20px;
  margin-bottom: 25px;
  // margin-bottom: 5px;
}

.slider-btn {
  padding: 3px;
  font-size: 2rem;
  align-self: center;
  flex-grow: 0;
  margin-left: 6px;
  margin-right: 6px;
  cursor: pointer;
  transition: 0.4s cubic-bezier(0.2, 1, 0.1, 1);
}

.slider-btn:hover {
  border-radius: 6px;
  background-color: #eaecef;
}

.slider-btn:active {
  background-color: #dddfe2;
}

.v3dp__popout {
  border-radius: 7px !important;
}

.side-bar .v3dp__popout {
  margin-left: 72px;
  margin-top: 0px;
}

.todo-slider {
  flex-grow: 1;
  display: flex;
  overflow-x: hidden;
  min-height: -webkit-fill-available;
  min-height: -moz-available;
  height: fit-content;
}

@-moz-document url-prefix() {
  .todo-slider {
    min-height: -moz-available;
    height: unset;
  }
}

.slides {
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
}

.dark-theme *::-webkit-scrollbar-thumb {
  background: #333940;
  border-radius: 5px;
}

.dark-theme *::-webkit-scrollbar-thumb:hover {
  background: #39484f;
}

.dark-theme *::-webkit-scrollbar-thumb:active {
  background: #51656f;
}

.full-screen {
  height: 100%;
  resize: unset;
}

.full-screen .todo-slider {
  margin-top: 20px;
}

/*----------------Dark Theme------------------*/
.dark-theme {
  background-color: #13171d;
  color: #c9d1d9;
}

.dark-theme input {
  background-color: #13171d;
  color: #c9d1d9;
}

.dark-theme input.form-range {
  background-color: unset;
}

.dark-theme .slider-btn:hover {
  border-radius: 6px;
  background-color: #21262d;
}

.dark-theme .slider-btn:active {
  background-color: #2a2e36;
}

.mobile {
  width: 100%;
  height: 100%;
  z-index: 999;
  position: absolute;
  padding: 20%;
}

.dark-theme .mobile {
  background-color: #13171d;
}

.compatible {
  width: 100%;
  height: 100%;
  z-index: 999;
  /*position: absolute;*/
}

.hidden-input-for-focus {
  position: absolute;
  top: -100px;
}

.main-horizontal-divider {
  z-index: 5;

  &.on-top {
    cursor: unset;

    .inner-main-horizontal-divider {
      display: none;
    }

    .divider-icons-container {
      margin-top: 5px;
      visibility: visible;
      opacity: 0.3;
    }

    .move-to-corner-down,
    .move-to-corner-up,
    .move-to-center-up {
      display: none;
    }
  }

  &.on-bottom {
    cursor: unset;

    .inner-main-horizontal-divider {
      display: none;
    }

    .divider-icons-container {
      margin-top: -25px;
      visibility: visible;
      opacity: 0.3;
    }

    .move-to-corner-up,
    .move-to-corner-down,
    .move-to-center-down {
      display: none;
    }
  }

  &.on-center {
    .move-to-center-down,
    .move-to-center-up {
      display: none;
    }
  }

  &:hover {
    .divider-icons-container {
      visibility: visible;
      opacity: 1;
    }
  }
}

.divider-icons-container {
  visibility: hidden;
  opacity: 0;
  transition: 0.4s cubic-bezier(0.2, 1, 0.1, 1);
  z-index: 6;
  position: absolute;
  right: 70px;
  margin-top: -8px;
}

.divider-icons {
  @include btn-icon;
  padding: 6px;
  background-color: white;

  &:hover {
    opacity: 1;
  }

  .dark-theme & {
    background-color: #13171d;
  }
}

.hidden-lists-container {
  height: 0px !important;
  margin: 0px;
  min-height: 0px;
}

.full-screen-divider {
  height: 100% !important;
}
</style>
