<script>
import comfirmModal from '../../components/comfirmModal.vue'
import notifications from '../../helpers/notifications'
import toDoListRepository from '../../repositories/toDoListRepository'

export default {
  name: 'ClearListModal',
  components: {
    ComfirmModal: comfirmModal,
  },
  methods: {
    clearList() {
      const listId = this.$store.getters.listToClearId
      this.$store.commit('clearTodoList', listId)
      toDoListRepository.update(listId, [])
      notifications.refreshDayNotifications(this, listId)
    },
  },
}
</script>

<template>
  <ComfirmModal
    id="clearListModal" :title="$t('ui.clearList')" :text="$t('ui.clearListConfirm')" ico="bi-trash"
    :ok-text="$t('ui.clear')" @on-ok="clearList"
  />
</template>
