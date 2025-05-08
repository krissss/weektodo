<script>
import MarkdownIt from 'markdown-it'
import markdownTargetBlankLinks from '../../helpers/markdownTargetBlankLinks'

export default {
  name: 'DescriptionTextArea',
  props: {
    todoDesc: { required: true },
  },
  emits: ['updatedDescription'],
  data() {
    return {
      desc: '',
      editingDescription: false,
      md: new MarkdownIt(),
    }
  },
  watch: {
    todoDesc(newValue) {
      this.desc = newValue
    },
  },
  mounted() {
    markdownTargetBlankLinks.renderBlankLinks(this.md)
  },
  methods: {
    resizeTextArea() {
      const textArea = this.$refs.descriptionInput
      textArea.style.height = '18px'
      textArea.style.height = `${textArea.scrollHeight}px`
    },
    editDescription() {
      this.editingDescription = true
      this.$nextTick(function () {
        this.resizeTextArea()
        this.$refs.descriptionInput.focus()
        this.$refs.descriptionInput.setSelectionRange(0, 0)
        this.$refs.descriptionInput.scrollTop = 0
      })
    },
    doneEditDescription() {
      this.editingDescription = false
      this.$emit('updatedDescription', this.desc)
    },
    todoDescription() {
      return this.md.render(this.desc)
    },
    goToMarkDown() {
      window.open('https://commonmark.org/help/', '_blank')
    },
  },
}
</script>

<template>
  <div v-show="editingDescription" class="position-relative">
    <textarea
      ref="descriptionInput" v-model="desc" class="todo-description-textarea mt-2"
      :placeholder="$t('todoDetails.notes')" @input="resizeTextArea" @blur="doneEditDescription"
    />
    <i class="bi-markdown-fill" :title="$t('todoDetails.markdown')" @mousedown="goToMarkDown" />
  </div>
  <div
    v-show="!editingDescription && desc != ''" class="mt-2 todo-description" @dblclick="editDescription"
    v-html="todoDescription()"
  />
  <div
    v-show="!editingDescription && desc.replace(/^\s*$(?:\r\n?|\n)/gm, '') == ''" class="description-empty mt-2"
    @dblclick="editDescription"
  >
    {{ $t("todoDetails.notes") }}
  </div>
</template>

<style>
.todo-description-textarea {
    font-size: 14px;
    line-height: 19px;
    min-height: 150px;
    overflow: hidden;
    width: 100%;
    resize: none;
    background: unset;
    cursor: auto;
    outline: unset;
    border: 2px solid black;
    border-radius: 3px;

    .dark-theme & {
        border: 1px solid rgba(255, 255, 255, 0.658);
        color: #c9d1d9;
    }
}

.bi-markdown-fill {
    font-size: 20px;
    margin-top: -50px;
    position: absolute;
    right: 10px;
    bottom: 5px;
    opacity: 0.3;
    cursor: pointer;

    &:hover {
        opacity: 1;
    }
}

.todo-description {
    word-wrap: break-word;
    zoom: 89%;
    user-select: auto;
    -moz-user-select: auto;
    -webkit-user-drag: auto;
    -webkit-user-select: auto;
    -ms-user-select: auto;
    padding: 4px;
    border: 2px solid transparent;
}

.description-empty {
    color: grey;
    font-size: 14px;
    line-height: 21px;
    padding: 2px;
    border: 2px solid transparent;
}
</style>
