<script>
import { Toast } from 'bootstrap'
import linkList from '../components/linkList'
import donateLists from './donate/donateLists'

export default {
  name: 'DonateModal',
  components: {
    LinkList: linkList,
  },
  computed: {
    donateList() {
      return donateLists.donateList(this)
    },
    shareList() {
      return donateLists.shareList(this)
    },
  },
  methods: {
    goHome() {
      document.getElementById('homeTab').click()
    },
    async copy() {
      await navigator.clipboard.writeText('https://weektodo.me')
      const toast = new Toast(document.getElementById('copiedAddress'))
      toast.show()
    },
  },
}
</script>

<template>
  <div id="donateModal" class="modal  fade" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ $t("donate.supportUs") }}
          </h5>
          <i class="bi-x close-modal" data-bs-dismiss="modal" />
        </div>
        <div class="modal-body">
          <div class="row">
            <div style="text-align: justify; line-height: 21px;">
              {{ $t("donate.supportMessage1") }}
            </div>
            <div>
              <ul id="myTab" class="nav nav-tabs" role="tablist" style="display: none">
                <li class="nav-item" role="presentation">
                  <button
                    id="homeTab" class="nav-link active" data-bs-toggle="tab" data-bs-target="#donate-home"
                    role="tab"
                  >
                    Home
                  </button>
                </li>
                <li class="nav-item" role="presentation">
                  <button
                    id="shareTab" class="nav-link" data-bs-toggle="tab" data-bs-target="#donate-share"
                    role="tab"
                  >
                    Share
                  </button>
                </li>
              </ul>
              <div id="nav-tabContent" class="tab-content mt-0">
                <div id="donate-home" class="tab-pane fade show active">
                  <LinkList :link-list="donateList" />
                </div>
                <div id="donate-share" class="tab-pane fade">
                  <div class="d-flex flex-column mt-3 h-100 ">
                    <LinkList :link-list="shareList" />
                    <div class="input-group mt-2 mb-3 px-3">
                      <input type="text" class="form-control" value="https://weektodo.me" disabled>
                      <button class="btn btn-outline-secondary" type="button" @click="copy">
                        {{ $t("donate.copy") }}
                        <i class="bi-clipboard" style="padding-left: 5px;" />
                      </button>
                    </div>
                    <button class="btn mt-auto" type="button" @click="goHome">
                      <i class="bi-arrow-left a" /> {{ $t("donate.goBack") }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-dialog {
  max-width: 400px;
}

#nav-tabContent {
  margin-top: 20px;
}

#donate-home {
  margin-top: 10px;
}

.nav-tabs {
  border-bottom: none;
}

.btn-outline-secondary {
  border: 1px solid #ced4da;
  opacity: 1;
}

.form-control:disabled{
  opacity: 1;
}

.btn-outline-secondary {
  color: rgb(66, 66, 66);
}
.btn-outline-secondary:hover {
  color: rgb(66, 66, 66);
}

.dark-theme .btn-outline-secondary {
  border: 1px solid #ced4da;

}

.dark-theme .btn-outline-secondary:hover {
  opacity: 1;
}
</style>
