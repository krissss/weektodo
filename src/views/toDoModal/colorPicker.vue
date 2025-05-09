<script>
export default {
  name: 'ColorPicker',
  props: {
    color: { required: true, type: [String, null] },
  },
  emits: ['ColorSelected'],
  data() {
    return {
      colorPicker: '',
      // todo: {text: "", checked: false, desc: "", subTaskList: []},
    }
  },
  watch: {
    color(newVal) {
      this.updateBtnShape(newVal)
    },
  },
  methods: {
    selectColor(color) {
      this.$emit('ColorSelected', color)
    },
    updateBtnShape(color) {
      if (color == 'none') {
        document.getElementById('btnTaskColorPicker').classList.remove('bi-circle-fill')
        document.getElementById('btnTaskColorPicker').classList.add('bi-circle')
      }
      else {
        document.getElementById('btnTaskColorPicker').classList.add('bi-circle-fill')
        document.getElementById('btnTaskColorPicker').classList.remove('bi-circle')
      }
    },
  },
}
</script>

<template>
  <div class="dropdown-center">
    <i
      id="btnTaskColorPicker" class="header-menu-icons bi-circle-fill" type="button" data-bs-toggle="dropdown"
      :style="`color: ${color}`" :title="$t('todoDetails.color')"
    />

    <ul class="dropdown-menu color-picker-dropdown px-2" aria-labelledby="btnTaskTimePicker">
      <div class="d-flex align-items-center">
        <i class="bi-circle colors-menu-icons" type="button" @click="selectColor('none')" />
        <i
          class="bi-circle-fill colors-menu-icons" type="button" style="color: #77e785"
          @click="selectColor('#77e785')"
        />
        <i
          class="bi-circle-fill colors-menu-icons" type="button" style="color: #06b6d4"
          @click="selectColor('#06b6d4')"
        />
        <i
          class="bi-circle-fill colors-menu-icons" type="button" style="color: #5e6ef2"
          @click="selectColor('#5e6ef2')"
        />
      </div>
      <div>
        <i
          class="bi-circle-fill colors-menu-icons" type="button" style="color: #8b5cf6"
          @click="selectColor('#8b5cf6')"
        />
        <i
          class="bi-circle-fill colors-menu-icons" type="button" style="color: #ed56a1"
          @click="selectColor('#ed56a1')"
        />
        <i
          class="bi-circle-fill colors-menu-icons" type="button" style="color: #ed544b"
          @click="selectColor('#ed544b')"
        />
        <i
          class="bi-circle-fill colors-menu-icons" type="button" style="color: #f97316"
          @click="selectColor('#f97316')"
        />
      </div>
      <div>
        <i
          class="bi-circle-fill colors-menu-icons" type="button" style="color: #f9d54a"
          @click="selectColor('#f9d54a')"
        />
        <i
          class="bi-circle-fill colors-menu-icons" type="button" style="color: #ba7956"
          @click="selectColor('#ba7956')"
        />
        <i
          class="bi-circle-fill colors-menu-icons" type="button" style="color: #6b7280"
          @click="selectColor('#6b7280')"
        />
        <i
          class="bi-circle-fill colors-menu-icons" type="button" style="color: #030712"
          @click="selectColor('#030712')"
        />
      </div>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.header-menu-icons {
  margin-left: 6px;
  @include btn-icon;
}

.colors-menu-icons {
  margin-left: 1px;
  @include btn-icon;
}

.color-picker-dropdown {
  min-width: 7rem;

  i {
    margin-right: 0px;
  }
}
</style>
