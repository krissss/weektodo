<script>
import { Modal, Toast } from 'bootstrap'
import moment from 'moment'
import comfirmModal from '../components/comfirmModal.vue'
import repeatingEventHelper from '../helpers/repeatingEvents.js'
import repeatingEventRepository from '../repositories/repeatingEventRepository'

export default {
  name: 'RecurrentEventsModal',
  components: {
    ComfirmModal: comfirmModal,
  },
  data() {
    return {
      index: 0,
      idToRemove: null,
      repeatingType: 'all',
    }
  },
  computed: {
    recurringTasks() {
      const tasks = []
      for (const key in this.$store.getters.repeatingEventList) {
        if (this.repeatingType == 'all' || this.repeatingType == this.$store.getters.repeatingEventList[key].type)
          tasks.push(this.$store.getters.repeatingEventList[key])
      }
      return tasks
    },
    language() {
      return this.$store.getters.config.language
    },
  },
  watch: {},
  methods: {
    frecuency(task) {
      switch (task.type) {
        case '0':
          return `${this.$t('todoDetails.yearly')} / ${moment(task.start_date).locale(this.language).format('MMM Do')}`
        case '1':
          return `${this.$t('todoDetails.monthly')} / ${moment(task.start_date).locale(this.language).format('Do')}`
        case '2':
          return `${this.$t('todoDetails.weekly')} / ${moment(task.start_date).locale(this.language).format('dddd')}`
        case '3':
          return this.$t('todoDetails.daily')
        case '4':
          return this.$t('todoDetails.weekdays')
        case '5':
          return this.$t('todoDetails.customWeekdays')
        case '6':
          return `${this.$t('todoDetails.daysOfMonth')} / ${task.repeating_rule.split('BYMONTHDAY=')[1]}`
      }
    },
    removeRecurringTask(id) {
      this.idToRemove = id
      const modal = new Modal(document.getElementById('removeReModal'), { backdrop: 'static' })
      modal.show()
    },
    removeRepeatingTaskComfirmed() {
      repeatingEventRepository.remove(this.idToRemove)
      this.$store.commit('removeRepeatingEvent', this.idToRemove)
      this.$store.getters.selectedDates.forEach((date) => {
        repeatingEventHelper.removeGeneratedRepeatingEvents(date, this)
      })
      this.$store.commit('resetRepeatingEventDateCache')
      this.$store.commit('loadRepeatingEventDateCache', this.$store.getters.repeatingEventList)
      const modal = new Modal(document.getElementById('RecurrentEventsModal'))
      modal.show()
      const toast = new Toast(document.getElementById('recurrentTaskRemoved'))
      toast.show()
    },
    removeRepeatingTaskCanceled() {
      const modal = new Modal(document.getElementById('RecurrentEventsModal'))
      modal.show()
    },
  },
}
</script>

<template>
  <div id="RecurrentEventsModal" class="modal fade" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <div class="d-flex">
            <h5 class="modal-title">
              {{ $t("ui.recurringTasks") }}
            </h5>

            <select
              v-model="repeatingType"
              class="form-select re-input w-auto mx-3"
              aria-label="Default select example"
              :disabled="repeatingEvent"
            >
              <option value="all">
                {{ $t("ui.showAll") }}
              </option>
              <option value="3">
                {{ $t("todoDetails.daily") }}
              </option>
              <option value="2">
                {{ $t("todoDetails.weekly") }}
              </option>
              <option value="4">
                {{ $t("todoDetails.weekdays") }}
              </option>
              <option value="5">
                {{ $t("todoDetails.customWeekdays") }}
              </option>
              <option value="1">
                {{ $t("todoDetails.monthly") }}
              </option>
              <option value="6">
                {{ $t("todoDetails.daysOfMonth") }}
              </option>
              <option value="0">
                {{ $t("todoDetails.yearly") }}
              </option>
            </select>
          </div>
          <i class="bi-x close-modal" data-bs-dismiss="modal" />
        </div>
        <div class="modal-body">
          <table class="table table-hover">
            <thead>
              <tr>
                <th class="recurrent-heading" scope="col">
                  {{ $t("ui.task") }}
                </th>
                <th class="recurrent-heading" scope="col">
                  {{ $t("ui.Frecuency") }}
                </th>
                <th scope="col" />
              </tr>
            </thead>
            <tbody>
              <tr v-for="task in recurringTasks" :key="task.id">
                <td class="reccurent-items">
                  {{ task.data.text }}
                </td>
                <td class="recurring-freq">
                  {{ frecuency(task) }}
                </td>
                <td>
                  <i
                    class="bi-trash mx-2"
                    :title="$t('ui.remove')"
                    data-bs-dismiss="modal"
                    @click="removeRecurringTask(task.id)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <ComfirmModal
    id="removeReModal"
    :title="$t('ui.removeRepeatingTask')"
    :text="$t('ui.repeatingTaskRemoveConfirm')"
    ico="bi-x-circle"
    :ok-text="$t('ui.remove')"
    @on-ok="removeRepeatingTaskComfirmed"
    @on-cancel="removeRepeatingTaskCanceled"
  />
</template>

<style scoped lang="scss">
.modal-dialog {
  max-width: 800px;
}

.modal-body {
  height: 400px;
  overflow: auto;
  margin-bottom: 20px;
}

.table {
  --bs-table-hover-bg: #f4f4f4;
  color: #212529;
}

.dark-theme .table {
  --bs-table-bg: #21262d;
  --bs-table-striped-bg: #2c3034;
  --bs-table-striped-color: #fff;
  --bs-table-active-bg: #373b3e;
  --bs-table-active-color: #fff;
  --bs-table-hover-bg: #323539;
  --bs-table-hover-color: #fff;
  color: #fff;
  border-color: #373b3e;
}

.bi-trash {
  cursor: pointer;

  &:hover {
    color: black;
  }

  .dark-theme & {
    color: #babbbe;

    &:hover {
      color: white;
    }
  }
}
.recurrent-heading{
  .dark-theme & {
       color:rgb(222, 222, 222);
  }

}

.reccurent-items , .recurring-freq{
    .dark-theme & {
    color: #babbbe;
  }
}
</style>
