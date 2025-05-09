<script>
import { Modal } from 'bootstrap'
import linkList from '../components/linkList'
import toastMessage from '../components/toastMessage'
import exportTool from '../helpers/exportTool'
import notifications from '../helpers/notifications'
import configRepository from '../repositories/configRepository'
import configList from './configList'

export default {
  name: 'ConfigModal',
  components: { ToastMessage: toastMessage, LinkList: linkList },
  props: {
    configProp: { required: true },
  },
  data() {
    return {
      configData: this.$store.getters.config,
    }
  },
  computed: {
    configLinks() {
      return configList.configList(this)
    },
    watch: {
      configProp(newVal) {
        this.configData = newVal
      },
    },
  },
  methods: {
    changeConfig(key, val) {
      this.$nextTick(function () {
        this.$store.commit('updateConfig', { val, key })
        configRepository.update(this.$store.getters.config)
        if (key === 'language')
          this.$i18n.locale = this.configData.language
        if (key === 'columns') {
          setTimeout(
            () => {
              this.$emit('changeColumns')
            },
            50,
          )
        }
      })
    },
    exportData() {
      const configModal = Modal.getInstance(document.getElementById('configModal'))
      configModal.hide()
      const exportingModal = new Modal(document.getElementById('exportingModal'), { backdrop: 'static' })
      exportingModal.show()
      exportTool.export()
    },
    importData(event) {
      const configModal = Modal.getInstance(document.getElementById('configModal'))
      configModal.hide()
      const importingModal = new Modal(document.getElementById('importingModal'), { backdrop: 'static' })
      importingModal.show()
      exportTool.import(event)
    },
    goHome() {
      document.getElementById('config-home-tab').click()
    },
    setLanguage() {
      this.changeConfig('language', this.configData.language)
    },
    playSound() {
      notifications.playNotificationSound(
        this.$store.getters.config.notificationSound,
      )
    },
  },
}
</script>

<template>
  <div
    id="configModal" class="modal fade" tabindex="-1"
    aria-labelledby="exampleModalLabel" aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ $t("settings.settings") }}
          </h5>
          <i class="bi-x close-modal" data-bs-dismiss="modal" />
        </div>
        <div class="modal-body px-0" style="display: flex">
          <ul id="confTab" class="nav nav-tabs" role="tablist" style="display: none">
            <li class="nav-item" role="presentation">
              <button
                id="config-home-tab" class="nav-link active" data-bs-toggle="tab" data-bs-target="#config-home"
                role="tab"
              >
                Home
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button
                id="config-general-tab" class="nav-link" data-bs-toggle="tab" data-bs-target="#config-general"
                role="tab"
              >
                General
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button
                id="config-display-tab" class="nav-link" data-bs-toggle="tab" data-bs-target="#config-display"
                role="tab"
              >
                Display
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button
                id="config-notifications-tab" class="nav-link" data-bs-toggle="tab"
                data-bs-target="#config-notifications" role="tab"
              >
                Notifications
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button id="config-data-tab" class="nav-link" data-bs-toggle="tab" data-bs-target="#config-data" role="tab">
                Data
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button
                id="config-language-tab" class="nav-link" data-bs-toggle="tab" data-bs-target="#config-language"
                role="tab"
              >
                Language
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button
                id="config-behavior-tab" class="nav-link" data-bs-toggle="tab" data-bs-target="#config-behavior"
                role="tab"
              >
                Behavior
              </button>
            </li>
          </ul>

          <div id="config-links-menu" class="tab-pane fade show" style="width: 340px;">
            <LinkList :link-list="configLinks" />
          </div>

          <div id="confTab-content" class="tab-content px-4" style="width: 100%; height: 400px; overflow-y: auto;">
            <div id="config-general" class="tab-pane fade active show">
              <div class="d-flex flex-column mt-2 h-100">
                <div class="form-check form-switch d-flex px-1 mb-3 justify-content-between">
                  <label class="form-check-label flex-fill" for="calendarSetting">{{ $t("settings.calendar") }}</label>
                  <input
                    id="calendarSetting" v-model="configData.calendar" class="form-check-input" type="checkbox"
                    @change="changeConfig('calendar', configData.calendar)"
                  >
                </div>

                <div class="form-check form-switch d-flex px-1 mb-3 justify-content-between">
                  <label class="form-check-label flex-fill" for="customListsSetting">{{ $t("settings.customLists")
                  }}</label>
                  <input
                    id="customListsSetting" v-model="configData.customList" class="form-check-input" type="checkbox"
                    @change="changeConfig('customList', configData.customList)"
                  >
                </div>
              </div>
            </div>
            <div id="config-behavior" class="tab-pane fade">
              <div class="d-flex flex-column mt-2 h-100">
                <div class="form-check form-switch d-flex px-1 mb-3 justify-content-between">
                  <label class="form-check-label flex-fill" for="moveOldTasks">{{ $t("settings.moveOldTasks")
                  }}</label>
                  <input
                    id="moveOldTasks" v-model="configData.moveOldTasks" class="form-check-input" type="checkbox"
                    @change="changeConfig('moveOldTasks', configData.moveOldTasks)"
                  >
                </div>
                <div class="form-check form-switch d-flex px-1 mb-3 justify-content-between">
                  <label class="form-check-label flex-fill" for="weekStartOnMonday">{{ $t("settings.weekStartOnMonday")
                  }}</label>
                  <input
                    id="weekStartOnMonday" v-model="configData.weekStartOnMonday" class="form-check-input" type="checkbox"
                    @change="changeConfig('weekStartOnMonday', configData.weekStartOnMonday)"
                  >
                </div>
                <div class="form-check form-switch d-flex px-1 mb-3 justify-content-between">
                  <label class="form-check-label flex-fill" for="moveOldTasks">{{ $t("settings.startCalendarYesterday")
                  }}</label>
                  <input
                    id="moveOldTasks" v-model="configData.startCalendarYesterday" class="form-check-input"
                    type="checkbox"
                    @change="changeConfig('startCalendarYesterday', configData.startCalendarYesterday)"
                  >
                </div>
                <div class="form-check form-switch d-flex px-1 mb-3 justify-content-between">
                  <label class="form-check-label flex-fill" for="autoReorderTasks">{{ $t("settings.autoReorderTasks")
                  }}</label>
                  <input
                    id="autoReorderTasks" v-model="configData.autoReorderTasks" class="form-check-input"
                    type="checkbox"
                    @change="changeConfig('autoReorderTasks', configData.autoReorderTasks)"
                  >
                </div>
                <div class="form-check form-switch d-flex px-1 mb-3 justify-content-between">
                  <label class="form-check-label flex-fill" for="moveCompletedTaskToBottom">{{
                    $t("settings.moveCompletedTaskToBottom")
                  }}</label>
                  <input
                    id="moveCompletedTaskToBottom" v-model="configData.moveCompletedTaskToBottom" class="form-check-input"
                    type="checkbox"
                    @change="changeConfig('moveCompletedTaskToBottom', configData.moveCompletedTaskToBottom)"
                  >
                </div>
                <div class="form-check form-switch d-flex px-1 mb-3 justify-content-between">
                  <label class="form-check-label flex-fill" for="moveCompletedSubTaskToBottom">{{
                    $t("settings.moveCompletedSubTaskToBottom")
                  }}</label>
                  <input
                    id="moveCompletedSubTaskToBottom" v-model="configData.moveCompletedSubTaskToBottom" class="form-check-input"
                    type="checkbox"
                    @change="changeConfig('moveCompletedSubTaskToBottom', configData.moveCompletedSubTaskToBottom)"
                  >
                </div>
              </div>
            </div>
            <div id="config-display" class="tab-pane fade">
              <div class="d-flex flex-column mt-2 h-100">
                <div class="form-check form-switch d-flex px-1 mb-3 justify-content-between">
                  <label class="form-check-label" for="darkThemeSetting">{{
                    $t("settings.darkTheme")
                  }}</label>
                  <input
                    id="darkThemeSetting" v-model="configData.darkTheme" class="form-check-input" type="checkbox"
                    @change="changeConfig('darkTheme', configData.darkTheme)"
                  >
                </div>

                <div class="horizontal-divider mb-3" />
                <div class="px-1 mb-3">
                  <label for="columnsConfig" class="form-check-label">{{ $t("settings.columns") }}: {{
                    configData.columns
                  }}</label>
                  <input
                    id="columnsConfig" v-model="configData.columns" type="range" class="form-range mt-2 px-2" min="1"
                    max="12" @change="changeConfig('columns', configData.columns)"
                  >
                </div>

                <div class="px-1 mb-3">
                  <label for="columnsConfig" class="form-check-label">{{ $t("settings.lists_columns") }}: {{
                    configData.customColumns
                  }}</label>
                  <input
                    id="columnsConfig" v-model="configData.customColumns" type="range" class="form-range mt-2 px-2" min="1"
                    max="12"
                    @change="changeConfig('customColumns', configData.customColumns)"
                  >
                </div>

                <div class="px-1 mb-3 zoom-config">
                  <label for="zoomConfig" class="form-check-label">{{ $t("settings.zoom") }}: {{ configData.zoom
                  }}%</label>
                  <input
                    id="zoomConfig" v-model="configData.zoom" type="range" class="form-range mt-2 px-2" min="50" max="200"
                    step="5" @change="changeConfig('zoom', configData.zoom)"
                  >
                </div>

                <div class="form-check form-switch d-flex px-1 mb-3 justify-content-between">
                  <label class="form-check-label" for="compactViewSetting">{{
                    $t("settings.compactView")
                  }}</label>
                  <input
                    id="compactViewSetting" v-model="configData.compactView" class="form-check-input" type="checkbox"
                    @change="changeConfig('compactView', configData.compactView)"
                  >
                </div>
                <div class="form-check form-switch d-flex px-1 mb-3 justify-content-between">
                  <label class="form-check-label" for="fullscreenToDoModal">{{
                    $t("settings.fullscreenToDoModal")
                  }}</label>
                  <input
                    id="fullscreenToDoModal" v-model="configData.fullscreenToDoModal" class="form-check-input"
                    type="checkbox"
                    @change="changeConfig('fullscreenToDoModal', configData.fullscreenToDoModal)"
                  >
                </div>
              </div>
            </div>
            <div id="config-notifications" class="tab-pane fade">
              <div class="d-flex flex-column mt-3 h-100">
                <div class="form-check form-switch d-flex px-0 mb-3  justify-content-between">
                  <label class="form-check-label" style="margin-left: 0px" for="notificationIndicator">{{
                    $t("settings.notificationIndicator")
                  }}</label>
                  <input
                    id="notificationIndicator" v-model="configData.notificationIndicator" class="form-check-input"
                    type="checkbox"
                    @change="changeConfig('notificationIndicator', configData.notificationIndicator)"
                  >
                </div>

                <div class="horizontal-divider mb-3" />

                <label for="notificationSound" class="form-label">{{ $t("settings.notificationSound") }}:</label>
                <div class="d-flex">
                  <select
                    id="notificationSound" v-model="configData.notificationSound"
                    class="col-sm-9 form-select flex-fill" aria-label="Default select example" @change="
                      changeConfig('notificationSound', configData.notificationSound)
                    "
                  >
                    <option value="none">
                      None
                    </option>
                    <option value="pop">
                      Pop
                    </option>
                    <option value="bell">
                      Bell
                    </option>
                    <option value="soft-bell">
                      Soft Bell
                    </option>
                    <option value="soft">
                      Soft
                    </option>
                    <option value="tiny">
                      Tiny
                    </option>
                    <option value="piano">
                      Piano
                    </option>
                    <option value="positive">
                      Positive
                    </option>
                    <option value="metal">
                      Metal
                    </option>
                  </select>
                  <button class="btn" style="margin-left: 8px" type="button" @click="playSound">
                    <i class="bi-play-circle a" />
                  </button>
                </div>
              </div>
            </div>
            <div id="config-data" class="tab-pane fade">
              <div class="d-flex flex-column mt-2 h-100">
                <div>
                  <div>
                    <div class="form-check form-switch d-flex px-1 mb-3 justify-content-between align-items-center">
                      <label class="form-check-label" for="export-data-btn">{{ $t("settings.exportData") }}</label>
                      <button
                        id="export-data-btn" type="button" class="btn py-1 px-2 border" style="width: 140px;"
                        @click="exportData"
                      >
                        <i class="icons bi-cloud-arrow-down mx-2" />
                        {{ $t("settings.export") }}
                      </button>
                    </div>

                    <div class="form-check form-switch d-flex px-1 mb-3 justify-content-between align-items-center">
                      <label class="form-check-label" for="import-data-btn">{{ $t("settings.importData") }}</label>
                      <button
                        id="import-data-btn" type="button" class="btn py-1 px-2 border" style="width: 140px;"
                        @click="$refs.loadData.click"
                      >
                        <i class="icons bi-cloud-arrow-up mx-2" />
                        {{ $t("settings.import") }}
                      </button>
                    </div>

                    <div class="form-check form-switch d-flex px-1 mb-3 justify-content-between align-items-center">
                      <label class="form-check-label" for="clear-data-btn">{{ $t("settings.clearData") }}</label>
                      <button
                        id="clear-data-btn" type="button" class="btn py-1 px-2 border" style="width: 140px;"
                        data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target="#clearDataModal"
                      >
                        <i class="icons bi-x-circle mx-2" />
                        {{ $t("settings.clear") }}
                      </button>
                    </div>
                  </div>
                  <input
                    id="file-selector" ref="loadData" type="file" class="d-none" accept=".wtdb"
                    @change="importData($event)"
                  >
                </div>
              </div>
            </div>
            <div id="config-language" class="tab-pane fade">
              <div class="d-flex flex-column mt-2 h-100">
                <label for="language" class="form-label">{{ $t("settings.language") }}:</label>
                <select
                  id="language" v-model="configData.language" class="col-sm-9 form-select"
                  aria-label="Default select example" @change="setLanguage"
                >
                  <option value="en">
                    English
                  </option>
                  <option value="es">
                    Español
                  </option>
                  <option value="fr">
                    Français
                  </option>
                  <option value="de">
                    Deutsch
                  </option>
                  <option value="it">
                    Italiano
                  </option>
                  <option value="pt">
                    Português
                  </option>
                  <option value="ru">
                    русский
                  </option>
                  <option value="hi">
                    हिंदी
                  </option>
                  <option value="ja">
                    日本
                  </option>
                  <option value="pl">
                    Polski
                  </option>
                  <option value="ar">
                    عرب
                  </option>
                  <option value="ko">
                    한국어
                  </option>
                  <option value="zh_cn">
                    简体中文
                  </option>
                  <option value="zh_tw">
                    繁體中文
                  </option>
                  <option value="uk">
                    український
                  </option>
                  <option value="tr">
                    Türk
                  </option>
                  <option value="vi">
                    Tiếng Việt
                  </option>
                  <option value="he">
                    עִברִית
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 1056">
      <ToastMessage id="invalidFile" ref="invalidFile" text="$t('settings.invalidFile')" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.form-check-input {
  width: 2.8em !important;
  height: 1.4em !important;
}

#config-links-menu {
  border-right: 1px solid rgba(0, 0, 0, 0.06);

.dark-theme & {
  border-right: 1px solid rgba(255, 255, 255, 0.06);
}
}

.icons {
  font-size: 18px;
  margin-right: 5px;
}

.form-check-label {
  margin-left: 10px;
  padding-top: 5px;
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
  max-width: 800px;
  max-height: 500px;
}

.form-range::-webkit-slider-thumb {
  background: $check-color;

  .dark-theme & {
    background: $dt-check-color;
  }
}

.form-range::-webkit-slider-thumb {
  background: $check-color;

  .dark-theme & {
    background: $dt-check-color;
  }
}

.form-range::-ms-thumb {
  background: $check-color;

  .dark-theme & {
    background: $dt-check-color;
  }
}

@-moz-document url-prefix() {
  .zoom-config {
    display: none;
  }
}
</style>
