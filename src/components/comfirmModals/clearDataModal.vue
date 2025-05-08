<script>
import comfirmModal from '../../components/comfirmModal.vue'
import exportTool from '../../helpers/exportTool'

export default {
  name: 'ClearDataModal',
  components: {
    ComfirmModal: comfirmModal,
  },
  methods: {
    clearData() {
      exportTool.clear()
    },
  },
}
</script>

<template>
  <ComfirmModal
    id="clearDataModal" :title="$t('settings.clearData')" :text="$t('settings.clearDataDetails')"
    ico="bi-x-circle" :ok-text="$t('settings.clearData')" @on-ok="clearData"
  />
</template>
