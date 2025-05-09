<script>
import ClickHandler from '@manuelernestog/click-handler'
import { Modal, Toast } from 'bootstrap'
import linkifyStr from 'linkify-string'
import moment from 'moment'
import Datepicker from 'vue3-datepicker'
import comfirmModal from '../../components/comfirmModal.vue'
import toastMessage from '../../components/toastMessage'
import languageHelper from '../../helpers/languageHelper.js'
import notifications from '../../helpers/notifications'
import repeatingEventHelper from '../../helpers/repeatingEvents.js'
import tasksHelper from '../../helpers/tasksHelper'
import dbRepository from '../../repositories/dbRepository'
import repeatingEventRepository from '../../repositories/repeatingEventRepository'
import toDoListRepository from '../../repositories/toDoListRepository'
import colorPicker from './colorPicker'
import descriptionTextArea from './descriptionTextArea.vue'
import repeatingEvent from './repeatingEvent'
import timePicker from './timePicker'

export default {
  name: 'ToDoModal',
  components: {
    ColorPicker: colorPicker,
    Datepicker,
    ToastMessage: toastMessage,
    TimePicker: timePicker,
    RepeatingEvent: repeatingEvent,
    ComfirmModal: comfirmModal,
    DescriptionTextArea: descriptionTextArea,
  },
  props: {
    selectedTodo: { required: true, type: Object },
  },
  data() {
    return {
      pickedDate: new Date(),
      pickedCList: '',
      pickedCListName: '',
      cListOptions: [],
      todo: {
        text: '',
        checked: false,
        desc: '',
        subTaskList: [],
        alarm: false,
      },
      todoList: null,
      index: 0,
      newSubTask: { text: '', checked: false, editing: false },
      tempTitle: '',
      tempSubTask: '',
      editingTitle: false,
      showingCalendar: true,
      loadingView: false,
      options: { target: '_blank', defaultProtocol: 'https' },
      clickhandler: new ClickHandler(),
    }
  },
  computed: {
    language() {
      const lang = this.$store.getters.config.language
      return languageHelper.getLanguagePack(lang)
    },
    showCL() {
      return this.$store.getters.config.customList
    },
    showCal() {
      return this.$store.getters.config.calendar
    },
    todoText() {
      return linkifyStr(this.todo.text, this.options)
    },
    fullscreenToDoModal() {
      return this.$store.getters.config.fullscreenToDoModal
    },
    moveSubtaskToBotttom() {
      return this.$store.getters.config.moveCompletedSubTaskToBottom
    },
    weekStartOnMonday() {
      return this.$store.getters.config.weekStartOnMonday ? 1 : 0
    },
  },
  watch: {
    selectedTodo(newVal) {
      this.todoList = this.$store.getters.todoLists[newVal.toDo.listId]
      this.index = newVal.index
      this.todo = this.todoList[this.index]
      if (this.todo.desc == undefined) {
        this.todo.desc = ''
        this.todo.subTaskList = []
        this.todo.color = 'none'
        this.todo.priority = 0
        this.todo.tags = []
        this.todo.time = null
        this.todo.alarm = false
        this.todo.repeatingEvent = null
      }
      this.showingCalendar = moment(this.todo.listId, 'YYYYMMDD', true).isValid()
      this.getCListOptions()
      this.loadingView = true
      if (this.showingCalendar) {
        this.pickedDate = moment(this.todo.listId).toDate()
        this.pickedCList = ''
        this.pickedCListName = ''
      }
      else {
        this.cListOptions.forEach((x) => {
          if (x.listId == this.todo.listId) {
            this.pickedCListName = x.listName
          }
        })
        this.pickedCList = this.todo.listId
        this.pickedDate = null
      }
      this.$nextTick(function () {
        this.loadingView = false
      })
    },
    pickedDate(newVal) {
      if (this.loadingView)
        return

      const newListId = moment(newVal).format('YYYYMMDD')
      if (newListId != this.todo.listId) {
        this.moveToTodoList(newListId)
      }
    },
    pickedCList(newVal) {
      if (this.loadingView)
        return

      this.moveToTodoList(newVal)
    },
  },
  methods: {
    removeSubTask(index) {
      this.todo.subTaskList.splice(index, 1)
      this.updateTodo()
    },
    addSubTask() {
      if (this.newSubTask.text != '') {
        const newTodo = {
          text: this.newSubTask.text,
          checked: false,
          editing: false,
        }
        this.todo.subTaskList.push(newTodo)
        this.newSubTask.text = ''
      }
      this.updateTodo()
    },
    cancelAddSubTask() {
      this.newSubTask.text = ''
      this.$refs.newSubTask.blur()
    },
    editSubTask(index) {
      this.todo.subTaskList[index].editing = true
      this.$nextTick(function () {
        this.$refs[`subTaskEdit${index}`][0].focus()
        this.$refs[`subTaskEdit${index}`][0].select()
        this.tempSubTask = this.todo.subTaskList[index].text
      })
    },
    doneEditSubTask(index) {
      this.todo.subTaskList[index].editing = false
      this.updateTodo()
    },
    cancelEditSubTask(index) {
      this.todo.subTaskList[index].text = this.tempSubTask
      this.$refs[`subTaskEdit${index}`].blur()
    },
    editTitle() {
      this.editingTitle = true
      this.$nextTick(function () {
        this.tempTitle = this.todo.text
        this.$refs.titleInput.focus()
        this.$refs.titleInput.select()
      })
    },
    cancelEditTitle() {
      this.todo.text = this.tempTitle
      this.$refs.titleInput.blur()
    },
    doneEditTitle() {
      this.editingTitle = false
      this.updateTodo()
    },
    startDrag(event, index) {
      event.dataTransfer.setData('index', index)
    },
    onDragenter(event) {
      event.target.parentElement.classList.add('drag-hover')
    },
    onDragleave(event) {
      event.target.parentElement.classList.remove('drag-hover')
    },
    onDrop(event, to_index) {
      const from_index = event.dataTransfer.getData('index')
      const sub_task = this.todo.subTaskList.splice(Number.parseInt(from_index), 1)[0]
      this.todo.subTaskList.splice(to_index, 0, sub_task)
      event.target.parentElement.classList.remove('drag-hover')
      this.updateTodo()
    },
    showCalendar() {
      document.getElementById('todo-date-picker-input').focus()
    },
    checkTodoClickhandler(resetRepeatinEvent = true) {
      this.clickhandler.handle(() => { this.checkTodo(resetRepeatinEvent) }, () => { })
    },
    checkTodo(resetRepeatinEvent = true) {
      if (this.todo.checked) {
        if (this.$store.getters.config.moveCompletedTaskToBottom) {
          this.$store.commit('moveTodoToEnd', { toDoListId: this.todo.listId, index: this.index })
        }
        this.index = this.todoList.length - 1
      }
      this.updateTodoWithReorder(resetRepeatinEvent)
    },
    updateTodo(resetRepeatinEvent = true) {
      if (resetRepeatinEvent) {
        this.todo.repeatingEvent = null
      }
      this.updateTodoList(this.todo.listId, this.todoList)
    },
    updateTodoWithReorder(resetRepeatinEvent = true) {
      if (resetRepeatinEvent) {
        this.todo.repeatingEvent = null
      }

      if (this.$store.getters.config.autoReorderTasks) {
        this.updateTodoList(this.todo.listId, tasksHelper.reorderTasksList(this.todoList))
      }
      else {
        this.updateTodoList(this.todo.listId, this.todoList)
      }
    },
    updateTodoList(todoListId, TodoList) {
      notifications.refreshDayNotifications(this, todoListId)
      toDoListRepository.update(todoListId, TodoList)
    },
    getCListOptions() {
      this.cListOptions = this.$store.getters.cTodoListIds
    },
    moveToTodoList(newListID) {
      if (newListID == 'Invalid date' || newListID == '')
        return

      if (moment(newListID, 'YYYYMMDD', true).isValid()) {
        this.pickedCListName = ''
        this.pickedCList = ''
      }
      else {
        this.cListOptions.forEach((x) => {
          if (x.listId == this.pickedCList) {
            this.pickedCListName = x.listName
          }
        })
      }

      const oldListId = this.todo.listId
      this.todoList.splice(this.index, 1)
      this.updateTodoList(oldListId, this.todoList)
      this.todo.listId = newListID
      this.todo.repeatingEvent = null
      if (this.$store.getters.todoLists[newListID]) {
        this.$store.commit('addTodo', this.todo)
        this.todoList = this.$store.getters.todoLists[this.todo.listId]
        this.index = this.todoList.length - 1
        this.todo = this.todoList[this.index]

        if (this.$store.getters.config.autoReorderTasks) {
          this.updateTodoList(newListID, tasksHelper.reorderTasksList(this.todoList))
        }
        else {
          this.updateTodoList(newListID, this.todoList)
        }
      }
      else {
        this.loadToDoFormDB(newListID)
      }
    },
    loadToDoFormDB(newListID) {
      const db_req = dbRepository.open()
      const instancePointer = this
      db_req.onsuccess = function (event) {
        const db = event.target.result
        const get_req = dbRepository.get(db, 'todo_lists', newListID)
        get_req.onsuccess = function (event) {
          const newTodoList = event.target.result ? event.target.result : []
          newTodoList.push(instancePointer.todo)
          instancePointer.todoList = newTodoList
          instancePointer.index = newTodoList.length - 1
          this.updateTodoList(newListID, instancePointer.todoList)
        }.bind(this)
      }.bind(this)
    },
    removeTodo() {
      this.$store.commit('setUndoElement', { type: 'task', todo: this.todo, index: this.index })
      this.$store.commit('removeTodo', { toDoListId: this.todo.listId, index: this.index })
      this.updateTodoList(this.todo.listId, this.$store.getters.todoLists[this.todo.listId])
      const toast = new Toast(document.getElementById('taskRemoved'))
      toast.show()
    },
    undoRemoveTask() {
      const obj = this.$store.getters.undoElement
      this.$store.commit('insertTodo', { toDoListId: obj.todo.listId, index: obj.index, toDo: obj.todo })
      this.updateTodoList(obj.todo.listId, this.$store.getters.todoLists[obj.todo.listId])
      const toast = new Toast(document.getElementById('taskRemoved'))
      toast.hide()
    },
    removeAll() {
      const modal = new Modal(document.getElementById('removeReModalToDoDetails'), { backdrop: 'static' })
      modal.show()
    },
    removeAllComfirmed() {
      repeatingEventRepository.remove(this.todo.repeatingEvent)
      this.$store.commit('removeRepeatingEvent', this.todo.repeatingEvent)
      this.$store.getters.selectedDates.forEach((date) => {
        repeatingEventHelper.removeGeneratedRepeatingEvents(date, this)
      })
      this.$store.commit('resetRepeatingEventDateCache')
      this.$store.commit('loadRepeatingEventDateCache', this.$store.getters.repeatingEventList)
      const toast = new Toast(document.getElementById('recurrentTaskRemoved'))
      toast.show()
    },
    removeAllCanceled() {
      const modal = new Modal(document.getElementById('toDoModal'))
      modal.show()
    },
    duplicateTodo() {
      const newTodo = {
        text: this.todo.text,
        checked: this.todo.checked,
        listId: this.todo.listId,
        desc: this.todo.desc,
        subTaskList: this.todo.subTaskList,
        color: this.todo.color,
        priority: 0,
        tags: [],
        time: this.todo.time,
        alarm: this.todo.alarm,
        repeatingEvent: null,
      }
      this.$store.commit('addTodo', newTodo)

      if (this.$store.getters.config.autoReorderTasks) {
        this.updateTodoList(this.todo.listId, tasksHelper.reorderTasksList(this.$store.getters.todoLists[this.todo.listId]))
      }
      else {
        this.updateTodoList(this.todo.listId, this.$store.getters.todoLists[this.todo.listId])
      }

      const toast = new Toast(document.getElementById('taskDuplicated'))
      toast.show()
    },
    async copyTodo() {
      await navigator.clipboard.writeText(this.todoToString())
      const toast = new Toast(document.getElementById('copiedTaskToClipboard'))
      toast.show()
    },
    todoToString() {
      let text = ''
      text += this.todo.text
      if (this.todo.desc != '') {
        text += '\n\n'
        text += `${this.$t('todoDetails.notes')}:\n\n`
        text += this.todo.desc
      }
      if (this.todo.subTaskList.length > 0) {
        text += '\n\n'
        text += `${this.$t('todoDetails.subtasks')}:\n\n`
        this.todo.subTaskList.forEach((task) => {
          text += `- ${task.text}\n`
        })
      }
      return text
    },
    changeColor(color) {
      this.todo.color = color
      this.updateTodo()
    },
    changeTime(time) {
      this.todo.time = time
      if (!time) {
        this.todo.alarm = false
      }
      this.updateTodoWithReorder()
    },
    changeAlarm() {
      if (this.todo.time) {
        this.todo.alarm = !this.todo.alarm
        this.updateTodo()
      }
    },
    changeDescription(desc) {
      this.todo.desc = desc
      this.updateTodo()
    },
    changeRepeatingEvent(repeatingEvent) {
      this.todo.repeatingEvent = repeatingEvent
      this.updateTodo(false)
    },
    changeSubTaskClickhandler(index) {
      this.clickhandler.handle(() => { this.changeSubTask(index) }, () => { this.editSubTask(index) }, index)
    },
    changeSubTask(index) {
      if (this.todo.subTaskList[index].checked && this.moveSubtaskToBotttom) {
        this.todo.subTaskList.push(this.todo.subTaskList.splice(index, 1)[0])
      }
      this.updateTodo()
    },
    linkifyText(text) {
      return linkifyStr(text, this.options)
    },
    pressEsc() {
      if (document.activeElement.id == 'toDoModal') {
        this.$refs.closeModal.click()
      }
    },
  },
}
</script>

<template>
  <div
    id="toDoModal" class="modal fade" :class="{ fullscreen: fullscreenToDoModal }" tabindex="-1"
    aria-hidden="true" @keydown.esc="pressEsc"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header d-flex">
          <div class="todo-list-selector">
            <div class="d-flex align-items-center">
              <div v-show="showingCalendar" class="align-items-center date-picker-btn" @click="showCalendar()">
                <i class="bi-calendar-event mx-2" />
                <Datepicker
                  id="todo-date-picker-input" v-model="pickedDate" class="py-2" :locale="language"
                  input-format="dd/MM/yyyy" :week-starts-on="weekStartOnMonday"
                />
              </div>
              <div v-show="!showingCalendar" class="align-items-center date-picker-btn">
                <div id="customListDropDown" class="align-items-center date-picker-btn py-2" data-bs-toggle="dropdown">
                  <i class="bi-view-list mx-2" />
                  <div id="todo-list-select">
                    {{ pickedCListName }}
                  </div>
                </div>
                <ul class="dropdown-menu" aria-labelledby="customListDropDown">
                  <li v-for="option in cListOptions" :key="option.listId" :value="option.listId">
                    <button class="dropdown-item" type="button" @click="pickedCList = option.listId">
                      <i
                        class="bi-check2" :style="{
                          visibility: option.listId == pickedCList ? 'visible' : 'hidden',
                        }"
                      />
                      <span>{{ option.listName }}</span>
                    </button>
                  </li>
                </ul>
              </div>
              <div v-if="showCL && showCal" class="d-flex align-items-center">
                <div class="selector-divider" />
                <i id="btnGroupDrop1" class="bi-chevron-down p-2" type="button" data-bs-toggle="dropdown" />
                <ul class="dropdown-menu" aria-labelledby="btnGroupDrop1">
                  <li>
                    <button class="dropdown-item" type="button" @click="showingCalendar = true">
                      <i class="bi-calendar-check" />
                      <span>{{ $t("settings.calendar") }}</span>
                    </button>
                  </li>
                  <li>
                    <button class="dropdown-item" type="button" @click="showingCalendar = false">
                      <i class="bi-view-list" />
                      <span>{{ $t("settings.customLists") }}</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="d-flex ms-auto align-items-center">
            <TimePicker :time="todo.time" @time-selected="changeTime" />
            <i
              :class="{ 'bi-bell': !todo.alarm, 'bi-bell-fill': todo.alarm }" class="header-menu-icons"
              :title="$t('todoDetails.alarm')" @click="changeAlarm"
            />
            <RepeatingEvent
              v-if="showingCalendar" :repeating-event="todo.repeatingEvent" :todo="todo"
              @repeating-event-selected="changeRepeatingEvent"
            />
            <ColorPicker :color="todo.color" @color-selected="changeColor" />
            <i
              id="btnTaskOptionMenu" class="bi-three-dots-vertical header-menu-icons" type="button"
              data-bs-toggle="dropdown" :title="$t('todoDetails.actions')"
            />
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="btnTaskOptionMenu">
              <li>
                <button class="dropdown-item" type="button" @click="copyTodo">
                  <i class="bi-clipboard" />
                  <span>{{ $t("donate.copy") }}</span>
                </button>
              </li>
              <li>
                <button class="dropdown-item" type="button" data-bs-dismiss="modal" @click="duplicateTodo">
                  <i class="bi-back" />
                  <span>{{ $t("todoDetails.duplicate") }}</span>
                </button>
              </li>
              <li>
                <hr class="dropdown-divider">
              </li>
              <li>
                <button class="dropdown-item" type="button" data-bs-dismiss="modal" @click="removeTodo">
                  <i class="bi-trash" /> <span>{{ $t("ui.remove") }}</span>
                </button>
              </li>
              <li v-if="todo.repeatingEvent">
                <button class="dropdown-item" type="button" data-bs-dismiss="modal" @click="removeAll">
                  <i class="bi-trash" /> <span>{{ $t("ui.removeAll") }}</span>
                </button>
              </li>
            </ul>
            <div>
              <i
                ref="closeModal" class="bi-x close-modal header-menu-icons" data-bs-dismiss="modal"
                :title="$t('todoDetails.close')"
              />
            </div>
          </div>
        </div>
        <div class="modal-body">
          <div class="form-check">
            <input
              id="todo-header" v-model="todo.checked" class="form-check-input" type="checkbox" value=""
              @change="checkTodoClickhandler(false)"
            >
            <div class="title-container">
              <label
                v-show="!editingTitle" class="form-check-label todo-title" for="todo-header"
                :class="{ 'completed-task': todo.checked }" @dblclick="editTitle"
              >
                <span v-html="todoText" />
              </label>
              <label
                v-show="!editingTitle && todo.text == ''" class="form-check-label todo-title todo-title-empty-title"
                for="todo-header" @dblclick="editTitle"
              >
                {{ $t("todoDetails.taskTitle") }}
              </label>
              <input
                v-show="editingTitle" ref="titleInput" v-model="todo.text" class="todo-title-input" type="text"
                :placeholder="$t('todoDetails.taskTitle')" @blur="doneEditTitle()" @keyup.enter="doneEditTitle()"
              >
              <DescriptionTextArea
                :todo-desc="todo.desc"
                @updated-description="changeDescription"
              />
            </div>
          </div>
          <div class="mt-3" />
          <div class="horizontal-divider mb-0 mt-3" />
          <ul class="sub-tasks">
            <li v-for="(subTask, index) in todo.subTaskList" :key="index" class="sub-task">
              <div v-show="!subTask.editing" draggable="true" @dragstart="startDrag($event, index)" @dragover.prevent>
                <div class="d-flex flex-row align-items-center" :class="{ checked: subTask.checked }">
                  <input
                    :id="`sub-task-${index}`" v-model="subTask.checked" class="form-check-input flex-grow-1 mx-3 mt-0"
                    type="checkbox" @change="changeSubTaskClickhandler(index)"
                  >
                  <label
                    class="form-check-label" :for="`sub-task-${index}`" @dragenter.self="onDragenter($event)"
                    @dragleave.self="onDragleave($event)" @drop="onDrop($event, index)" @dragover.prevent
                  >
                    <span v-html="linkifyText(subTask.text)" />
                  </label>
                  <i class="bi-trash mx-2" :title="$t('ui.remove')" @click="removeSubTask(index)" />
                </div>
              </div>
              <input
                v-show="subTask.editing" :ref="`subTaskEdit${index}`" v-model="subTask.text"
                class="edit-sub-task" @blur="doneEditSubTask(index)" @keyup.enter="doneEditSubTask(index)"
              >
            </li>
            <div class="new-sub-task d-flex align-items-center">
              <label for="new-sub-task"><i class="bi-plus-square mx-3" /></label>
              <input
                id="new-sub-task" ref="newSubTask" v-model="newSubTask.text" type="text"
                :placeholder="$t('todoDetails.addSubTask')" autocomplete="off" @blur="addSubTask()" @keyup.enter="addSubTask()"
              >
            </div>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 1056">
    <ToastMessage id="copiedTaskToClipboard" :text="$t('todoDetails.copiedTaskToClipboard')" />
    <ToastMessage
      id="taskRemoved" :text="$t('todoDetails.taskRemoved')" :sub-text="`(${$t('ui.undo')})`"
      @sub-text-click="undoRemoveTask"
    />
    <ToastMessage id="recurrentTaskRemoved" :text="$t('todoDetails.recurrentTaskRemoved')" />
    <ToastMessage id="taskDuplicated" :text="$t('todoDetails.taskDuplicated')" />
  </div>

  <ComfirmModal
    id="removeReModalToDoDetails" :title="$t('ui.removeRepeatingTask')"
    :text="$t('ui.repeatingTaskRemoveConfirm')" ico="bi-x-circle" :ok-text="$t('ui.remove')" @on-ok="removeAllComfirmed"
    @on-cancel="removeAllCanceled"
  />
</template>

<style scoped lang="scss">
.modal-dialog {
  max-height: 80%;

  .modal-content {
    height: 100%;

    .modal-body {
      overflow-x: hidden;
      overflow-y: auto;
      max-height: calc(100vh - 180px);
      ;
      margin: 16px 0px 16px 0px;
      padding: 0px 16px 0px 16px;
    }
  }
}

#toDoModal.fullscreen {
  .modal-dialog {
    margin: 0px;
    height: 85%;
    width: 90%;
    max-width: unset;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    .sub-tasks {
      max-height: unset;
    }
  }
}

.todo-list-selector .bi-chevron-down {
  @include btn-icon;
}

.todo-list-selector .date-picker-btn {
  display: flex;
  @include btn-icon;
  padding: 0px;

  #todo-list-select {
    font-size: 15px;
  }
}

.todo-list-selector .selector-divider {
  height: 21px;
  width: 1px;
  background-color: #b9b9b9;
  margin: 0px 4px 0px 4px;
}

.todo-title {
  font-size: 18px;
  font-weight: 500;
  line-height: 22px;
  border: 2px solid transparent;
  padding: 1px 2px 1px 2px;
}

.todo-title-input {
  font-size: 18px;
  line-height: 22px;
  width: 100%;
  font-weight: 500;
  outline: unset;
  border: 2px solid black;
  border-radius: 3px;

  .dark-theme & {
    border: 1px solid rgba(255, 255, 255, 0.658);
    background-color: unset;
  }
}

.todo-title-empty-title {
  color: grey;
  margin-left: -8px;
}

.dropdown-item {
  color: #3c3c3c;
}

.sub-tasks {
  list-style: none;
  padding: 0px 10px 10px 10px;
  margin: 0px;

  li>div {
    -webkit-user-drag: element;
  }

  .sub-task {
    border-bottom: 1px solid #eaecef;

    .dark-theme & {
      border-bottom: 1px solid #464647;
    }

    label {
      width: 100%;
      padding: 10px 5px 10px 0px;
      min-height: 38px;
      height: auto;
    }

    .form-check-input {
      width: 16px !important;
      height: 16px !important;
      min-width: 16px;
      min-height: 16px;
    }

    i {
      color: #87888a;
      display: none;
      cursor: pointer;

      &:hover {
        color: black;
      }

      .checked & {
        opacity: 1 !important;
      }

      .dark-theme & {
        color: #babbbe;

        &:hover {
          color: white;
        }
      }
    }

    .drag-hover {
      color: rgba(157, 157, 157, 0.43);
      background-color: rgb(250, 249, 249);

      .dark-theme & {
        color: rgb(87, 87, 87);
        background-color: #1f1e20;
      }
    }

    &:hover {
      background-color: $btn-hover-bg-color;

      .dark-theme & {
        background-color: $dt-btn-hover-bg-color;
      }

      i {
        display: block;
      }
    }
  }

  .new-sub-task {
    padding: 0px 5px 0px 0px;
    width: 100%;

    i {
      color: lightgrey;
    }

    input {
      border: none;
      width: 100%;
      height: 38px;
      outline: unset;

      border: 2px solid transparent;

      .dark-theme & {
        background-color: unset;
      }

      &:focus {
        border: 2px solid black;
        border-radius: 3px;

        .dark-theme & {
          border: 1px solid rgba(255, 255, 255, 0.658);
          background-color: #21262d;
        }
      }
    }
  }

  .edit-sub-task {
    outline: unset;
    border: none;
    width: 100%;
    height: 38px;
    width: calc(100% - 48px);
    margin-left: 48px;
    border: 2px solid black;
    border-radius: 3px;

    .dark-theme & {
      border: 2px solid white;
      background-color: #21262d;
    }
  }
}

.sub-task .checked input,
.sub-task .checked label {
  opacity: 0.6;
  text-decoration: line-through;
}

.title-container {
  margin-left: 14px;
  margin-top: 1px;
}

.form-check-input {
  width: 1.3em !important;
  height: 1.3em !important;
}

.dark-theme .form-select {
  background-color: #15161e;
  border: 1px solid #30363d;
  color: #c9d1d9;
}

.form-select:focus {
  box-shadow: none;
}

.modal-dialog {
  max-width: 650px;
}

.header-menu-icons {
  margin-left: 6px;
  @include btn-icon;
}

.header-menu-icons.bi-x {
  font-size: 1.9rem;
  padding: 0px;
}

.modal.modal-static .modal-dialog {
  transform: none;
}

#todo-list-select {
  padding: 0px;
  border: none;
  background-color: unset;
  cursor: pointer;
  width: 90px;
  font-size: 15px;
  line-height: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
}

.completed-task {
  text-decoration: line-through;
}
</style>
