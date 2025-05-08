<script>
import appView from './welcome/appView'
import doneView from './welcome/doneView'
import LanguageView from './welcome/languageView'
import backupView from './welcome/privacityView'
import ThemeView from './welcome/themeView'

export default {
  name: 'AboutModal',
  components: {
    LanguageView,
    ThemeView,
    DoneView: doneView,
    BackupView: backupView,
    AppView: appView,
  },
  data() {
    return {}
  },
  methods: {},
}
</script>

<template>
  <div id="welcomeModal" class="modal fade" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-body pb-2">
          <ul id="myTab" class="nav nav-tabs d-none" role="tablist">
            <li class="nav-item" role="presentation">
              <button
                id="welcome-1-tab" class="nav-link active" data-bs-toggle="tab" data-bs-target="#welcome-1"
                role="tab"
              >
                1
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button
                id="welcome-2-tab" class="nav-link" data-bs-toggle="tab" data-bs-target="#welcome-2"
                role="tab"
              >
                2
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button
                id="welcome-2-1-tab" class="nav-link" data-bs-toggle="tab" data-bs-target="#welcome-2-1"
                role="tab"
              >
                2-1
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button
                id="welcome-3-tab" class="nav-link" data-bs-toggle="tab" data-bs-target="#welcome-3"
                role="tab"
              >
                3
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button
                id="welcome-4-tab" class="nav-link" data-bs-toggle="tab" data-bs-target="#welcome-4"
                role="tab"
              >
                4
              </button>
            </li>
          </ul>
          <div id="nav-tabContent" class="tab-content mt-4">
            <div id="welcome-1" class="tab-pane fade show active">
              <LanguageView />
            </div>
            <div id="welcome-2" class="tab-pane fade">
              <ThemeView />
            </div>
            <div id="welcome-2-1" class="tab-pane fade">
              <AppView />
            </div>
            <div id="welcome-3" class="tab-pane fade">
              <BackupView />
            </div>
            <div id="welcome-4" class="tab-pane fade">
              <DoneView />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .modal-dialog {
    max-width: 550px;
  }
</style>
