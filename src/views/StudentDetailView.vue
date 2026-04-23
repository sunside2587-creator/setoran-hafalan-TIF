<template>
  <div class="d-grid gap-4">
    <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
      <div>
        <RouterLink :to="{ name: 'dashboard' }" class="btn btn-link text-decoration-none px-0">
          &larr; Kembali ke dashboard
        </RouterLink>
        <h2 class="h3 fw-bold mb-1">{{ studentInfo?.nama || 'Detail Mahasiswa' }}</h2>
        <p class="text-secondary mb-0">{{ studentInfo?.nim }} - {{ studentInfo?.email }}</p>
      </div>

      <button class="btn btn-outline-primary w-100 student-refresh-btn" @click="loadDetail" :disabled="isLoading">
        {{ isLoading ? 'Memuat...' : 'Refresh data' }}
      </button>
    </div>

    <div v-if="errorMessage" class="alert alert-danger mb-0">{{ errorMessage }}</div>
    <div v-if="successMessage" class="alert alert-success mb-0">{{ successMessage }}</div>

    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-3 text-secondary mb-0">Memuat detail setoran mahasiswa...</p>
    </div>

    <template v-else-if="detail">
      <section class="row g-3">
        <div class="col-md-6 col-xl-3">
          <StatCard
            label="Sudah Setor"
            :value="setoranInfo.total_sudah_setor"
            help="Komponen yang sudah tervalidasi"
            :badge="`${setoranInfo.persentase_progres_setor}%`"
            variant="success"
          />
        </div>
        <div class="col-md-6 col-xl-3">
          <StatCard
            label="Belum Setor"
            :value="setoranInfo.total_belum_setor"
            help="Komponen yang belum disetor"
            badge="Sisa"
            variant="danger"
          />
        </div>
        <div class="col-md-6 col-xl-3">
          <StatCard
            label="Terakhir Setor"
            :value="setoranInfo.terakhir_setor"
            help="Tanggal setoran terakhir"
            badge="Aktivitas"
            variant="primary"
          />
        </div>
        <div class="col-md-6 col-xl-3">
          <StatCard
            label="Semester"
            :value="studentInfo.semester"
            help="Semester aktif mahasiswa"
            :badge="`Angkatan ${studentInfo.angkatan}`"
            variant="warning"
          />
        </div>
      </section>

      <section class="row g-3">
        <div class="col-xl-4">
          <BaseCard>
            <h3 class="h5 fw-bold mb-3">Ringkasan kategori</h3>
            <div class="d-grid gap-3">
              <div
                v-for="item in detail.data.setoran.ringkasan"
                :key="item.label"
                class="rounded-3 border p-3"
              >
                <div class="d-flex justify-content-between gap-3 mb-2">
                  <strong>{{ item.label }}</strong>
                  <span>{{ item.persentase_progres_setor }}%</span>
                </div>
                <div class="progress mb-2" role="progressbar">
                  <div
                    class="progress-bar"
                    :class="`bg-${progressVariant(item.persentase_progres_setor)}`"
                    :style="{ width: `${item.persentase_progres_setor}%` }"
                  ></div>
                </div>
                <p class="text-secondary small mb-0">
                  {{ item.total_sudah_setor }} dari {{ item.total_wajib_setor }} komponen sudah disetor.
                </p>
              </div>
            </div>
          </BaseCard>
        </div>

        <div class="col-xl-8">
          <BaseCard>
            <div class="d-flex flex-wrap justify-content-between gap-3 mb-3">
              <div>
                <h3 class="h5 fw-bold mb-1">Validasi setoran</h3>
                <p class="text-secondary mb-0">Pilih komponen hafalan yang ingin disahkan.</p>
              </div>
              <div class="text-secondary small align-self-center">
                {{ selectedForSubmit.length }} komponen dipilih
              </div>
            </div>

            <form class="d-grid gap-3" @submit.prevent="handleSubmitSetoran">
              <div class="row g-3 align-items-end">
                <div class="col-md-6">
                  <label class="form-label">Tanggal setoran</label>
                  <input v-model="submitDate" type="date" class="form-control" />
                </div>
                <div class="col-md-6">
                  <button
                    type="submit"
                    class="btn btn-primary w-100"
                    :disabled="isSubmitting || !selectedForSubmit.length"
                  >
                    {{ isSubmitting ? 'Menyimpan...' : 'Simpan validasi setoran' }}
                  </button>
                </div>
              </div>

              <div class="d-grid gap-3">
                <div class="d-md-none setoran-mobile-list">
                  <article v-for="item in pendingItems" :key="item.id" class="mobile-info-card">
                    <div class="d-flex align-items-start gap-3 mb-3">
                      <input v-model="selectedForSubmit" class="form-check-input mt-1" type="checkbox" :value="item.id" />
                      <div class="min-w-0 flex-grow-1">
                        <div class="fw-semibold">{{ item.nama }}</div>
                        <div class="text-secondary small arabic-text">{{ item.nama_arab }}</div>
                      </div>
                    </div>

                    <div class="d-grid gap-2 small">
                      <div class="mobile-meta-row">
                        <span class="text-secondary">Kategori</span>
                        <strong>{{ item.label }}</strong>
                      </div>
                      <div class="mobile-meta-row">
                        <span class="text-secondary">Status</span>
                        <span class="badge text-bg-light border text-dark">Belum setor</span>
                      </div>
                    </div>
                  </article>
                  <EmptyState
                    v-if="!pendingItems.length"
                    title="Semua komponen sudah tervalidasi"
                    description="Tidak ada komponen tersisa untuk divalidasi pada mahasiswa ini."
                  />
                </div>

                <div class="table-responsive d-none d-md-block">
                  <table class="table align-middle">
                    <thead>
                      <tr>
                        <th style="width: 56px;"></th>
                        <th>Komponen</th>
                        <th>Kategori</th>
                        <th>Status</th>
                        <th>Tanggal setor</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in pendingItems" :key="item.id">
                        <td>
                          <input v-model="selectedForSubmit" class="form-check-input" type="checkbox" :value="item.id" />
                        </td>
                        <td>
                          <div class="fw-semibold">{{ item.nama }}</div>
                          <div class="text-secondary small arabic-text">{{ item.nama_arab }}</div>
                        </td>
                        <td>{{ item.label }}</td>
                        <td><span class="badge text-bg-light border text-dark">Belum setor</span></td>
                        <td>-</td>
                      </tr>
                      <tr v-if="!pendingItems.length">
                        <td colspan="5">
                          <EmptyState
                            title="Semua komponen sudah tervalidasi"
                            description="Tidak ada komponen tersisa untuk divalidasi pada mahasiswa ini."
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </form>
          </BaseCard>
        </div>
      </section>

      <section class="row g-3">
        <div class="col-xl-7">
          <BaseCard>
            <div class="d-flex flex-wrap justify-content-between gap-3 mb-3">
              <div>
                <h3 class="h5 fw-bold mb-1">Komponen yang sudah disetor</h3>
                <p class="text-secondary mb-0">Pilih data yang ingin dibatalkan validasinya.</p>
              </div>
              <button
                class="btn btn-outline-danger"
                @click="handleDeleteSetoran"
                :disabled="isDeleting || !selectedForDelete.length"
              >
                {{ isDeleting ? 'Membatalkan...' : 'Batalkan validasi terpilih' }}
              </button>
            </div>

            <div class="d-grid gap-3">
              <div class="d-md-none setoran-mobile-list">
                <article v-for="item in completedItems" :key="item.info_setoran.id" class="mobile-info-card">
                  <div class="d-flex align-items-start gap-3 mb-3">
                    <input
                      v-model="selectedForDelete"
                      class="form-check-input mt-1"
                      type="checkbox"
                      :value="item.id"
                    />
                    <div class="min-w-0 flex-grow-1">
                      <div class="fw-semibold">{{ item.nama }}</div>
                      <div class="text-secondary small text-break">{{ item.info_setoran.id }}</div>
                    </div>
                  </div>

                  <div class="d-grid gap-2 small">
                    <div class="mobile-meta-row">
                      <span class="text-secondary">Kategori</span>
                      <strong>{{ item.label }}</strong>
                    </div>
                    <div class="mobile-meta-row">
                      <span class="text-secondary">Tanggal setor</span>
                      <strong>{{ formatDate(item.info_setoran.tgl_setoran) }}</strong>
                    </div>
                    <div class="mobile-meta-row">
                      <span class="text-secondary">Tanggal validasi</span>
                      <strong>{{ formatDate(item.info_setoran.tgl_validasi) }}</strong>
                    </div>
                  </div>
                </article>
                <EmptyState
                  v-if="!completedItems.length"
                  title="Belum ada setoran"
                  description="Mahasiswa ini belum memiliki komponen yang tervalidasi."
                />
              </div>

              <div class="table-responsive d-none d-md-block">
                <table class="table align-middle">
                  <thead>
                    <tr>
                      <th style="width: 56px;"></th>
                      <th>Komponen</th>
                      <th>Kategori</th>
                      <th>Tanggal setor</th>
                      <th>Tanggal validasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in completedItems" :key="item.info_setoran.id">
                      <td>
                        <input
                          v-model="selectedForDelete"
                          class="form-check-input"
                          type="checkbox"
                          :value="item.id"
                        />
                      </td>
                      <td>
                        <div class="fw-semibold">{{ item.nama }}</div>
                        <div class="text-secondary small">{{ item.info_setoran.id }}</div>
                      </td>
                      <td>{{ item.label }}</td>
                      <td>{{ formatDate(item.info_setoran.tgl_setoran) }}</td>
                      <td>{{ formatDate(item.info_setoran.tgl_validasi) }}</td>
                    </tr>
                    <tr v-if="!completedItems.length">
                      <td colspan="5">
                        <EmptyState
                          title="Belum ada setoran"
                          description="Mahasiswa ini belum memiliki komponen yang tervalidasi."
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </BaseCard>
        </div>

        <div class="col-xl-5">
          <BaseCard>
            <h3 class="h5 fw-bold mb-3">Riwayat aktivitas</h3>
            <div class="timeline">
              <article v-for="log in detail.data.setoran.log" :key="log.id" class="timeline-item">
                <div class="d-flex justify-content-between gap-3">
                  <span :class="`badge text-bg-${log.aksi === 'VALIDASI' ? 'success' : 'danger'}`">
                    {{ log.aksi }}
                  </span>
                  <span class="text-secondary small">{{ formatDateTime(log.timestamp) }}</span>
                </div>
                <p class="fw-semibold mt-2 mb-1">{{ log.keterangan }}</p>
                <p class="text-secondary small mb-0">{{ log.dosen_yang_mengesahkan.nama }}</p>
              </article>
            </div>
          </BaseCard>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import BaseCard from '../components/BaseCard.vue'
import EmptyState from '../components/EmptyState.vue'
import StatCard from '../components/StatCard.vue'
import { deleteSetoran, fetchMahasiswaSetoran, submitSetoran } from '../services/api'
import { formatDate, formatDateTime, progressVariant } from '../utils/format'

const route = useRoute()
const nim = computed(() => route.params.nim)

const isLoading = ref(true)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const detail = ref(null)
const selectedForSubmit = ref([])
const selectedForDelete = ref([])
const submitDate = ref(new Date().toISOString().slice(0, 10))

const studentInfo = computed(() => detail.value?.data?.info ?? {})
const setoranInfo = computed(() => detail.value?.data?.setoran?.info_dasar ?? {})
const detailItems = computed(() => detail.value?.data?.setoran?.detail ?? [])
const pendingItems = computed(() => detailItems.value.filter((item) => !item.sudah_setor))
const completedItems = computed(() => detailItems.value.filter((item) => item.sudah_setor))

async function loadDetail() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    detail.value = await fetchMahasiswaSetoran(nim.value)
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}

async function handleSubmitSetoran() {
  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const payload = {
      data_setoran: pendingItems.value
        .filter((item) => selectedForSubmit.value.includes(item.id))
        .map((item) => ({
          nama_komponen_setoran: item.nama,
          id_komponen_setoran: item.id
        })),
      ...(submitDate.value ? { tgl_setoran: submitDate.value } : {})
    }

    const response = await submitSetoran(nim.value, payload)
    successMessage.value = response.message
    selectedForSubmit.value = []
    await loadDetail()
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isSubmitting.value = false
  }
}

async function handleDeleteSetoran() {
  isDeleting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const payload = {
      data_setoran: completedItems.value
        .filter((item) => selectedForDelete.value.includes(item.id))
        .map((item) => ({
          id: item.info_setoran.id,
          id_komponen_setoran: item.id,
          nama_komponen_setoran: item.nama
        }))
    }

    const response = await deleteSetoran(nim.value, payload)
    successMessage.value = response.message
    selectedForDelete.value = []
    await loadDetail()
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isDeleting.value = false
  }
}

onMounted(loadDetail)
</script>
