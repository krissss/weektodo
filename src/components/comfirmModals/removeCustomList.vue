<script>
import { Modal } from 'bootstrap'
import comfirmModal from '../../components/comfirmModal.vue'
import customToDoListIdsRepository from '../../repositories/customToDoListIdsRepository'
import toDoListRepository from '../../repositories/toDoListRepository'

export default {
  name: 'RemoveCustomList',
  components: {
    ComfirmModal: comfirmModal,
  },
  computed: {
    listId() {
      if (this.$store.getters.actions.cListToRmv) {
        return this.$store.getters.actions.cListToRmv.name
      }
      return null
    },
  },
  methods: {
    removeCustomList() {
      this.$store.commit('removeCustomTodoList', this.$store.getters.actions.cListToRmv)
      const modalEl = document.getElementById('customListRemoveModal')
      const modal = Modal.getInstance(modalEl)
      customToDoListIdsRepository.update(this.$store.getters.cTodoListIds)
      toDoListRepository.remove(this.$store.getters.actions.cListToRmv.id)
      modal.hide()
    },
  },
}
</script>

<template>
  <ComfirmModal
    id="customListRemoveModal" :title="$t('ui.rmList')" :text="`${$t('ui.rmListConfirm')} ${listId}?`"
    ico="bi-x-circle" :ok-text="$t('ui.remove')" @on-ok="removeCustomList"
  />
</template>
