<template>
  <div class="student-detail-page d-grid gap-4">
    <section class="student-overview-card">
      <div class="student-overview-main">
        <RouterLink :to="{ name: 'dashboard' }" class="student-back-link">
          &larr; Kembali ke dashboard
        </RouterLink>
        <div class="student-overview-copy">
          <h2 class="h3 fw-bold mb-2">{{ studentInfo?.nama || 'Detail Mahasiswa' }}</h2>
          <p class="text-secondary mb-3">{{ studentInfo?.nim }} - {{ studentInfo?.email }}</p>
          <div class="student-meta-chips">
            <span class="student-meta-chip">Angkatan {{ studentInfo?.angkatan || '-' }}</span>
            <span class="student-meta-chip">Semester {{ studentInfo?.semester || '-' }}</span>
            <span class="student-meta-chip">PA {{ studentInfo?.dosen_pa?.nama || '-' }}</span>
          </div>
        </div>
      </div>

      <div class="student-overview-actions">
        <button class="btn btn-outline-primary student-refresh-btn" @click="loadDetail" :disabled="isLoading">
          {{ isLoading ? 'Memuat...' : 'Refresh' }}
        </button>
      </div>
    </section>

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
            label="Total Wajib"
            :value="setoranInfo.total_wajib_setor"
            help="Jumlah komponen hafalan"
            badge="Target"
            variant="warning"
          />
        </div>
      </section>

       <section>
        <BaseCard>
          <div class="activity-cta-card">
            <div>
              <p class="section-eyebrow mb-2">Riwayat Aktivitas</p>
              <h3 class="h5 fw-bold mb-1">Lihat semua aktivitas </h3>
              <h2 class="h3 fw-bold mb-1">{{ studentInfo?.nama || 'Mahasiswa' }}</h2>
              <p class="text-secondary mb-0">
                Riwayat validasi dan pembatalan setoran mahasiswa.
              </p>
            </div>
            <RouterLink
              :to="{ name: 'student-activity', params: { nim } }"
              class="btn btn-outline-primary activity-cta-button"
            >
              Buka halaman aktivitas
            </RouterLink>
          </div>
        </BaseCard>
      </section>

      <section class="row g-3 align-items-start">
        <div class="col-12">
          <BaseCard>
            <div class="section-toolbar">
              <div>
                <p class="section-eyebrow mb-2">Validation</p>
                
                <h3 class="h5 fw-bold mb-1">Validasi setoran</h3>
                <p class="text-secondary mb-0">Pilih komponen hafalan yang ingin disahkan untuk mahasiswa ini.</p>
              </div>
              <div class="selection-pill">
                {{ selectedForSubmit.length }} dipilih
              </div>
            </div>

            <form class="d-grid gap-3" @submit.prevent="handleSubmitSetoran">
              <div class="validation-toolbar">
                <div class="validation-date-field">
                  <label class="form-label">Tanggal setoran</label>
                  <input v-model="submitDate" type="date" class="form-control" />
                </div>
                <button
                  type="submit"
                  class="btn btn-primary validation-submit-btn"
                  :disabled="isSubmitting || !selectedForSubmit.length"
                >
                  {{ isSubmitting ? 'Menyimpan...' : 'Simpan validasi setoran' }}
                </button>
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

                <div class="table-responsive d-none d-md-block setoran-table-shell">
                  <table class="table align-middle mb-0">
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

      <section class="row g-3 align-items-start">
        <div class="col-xl-12">
          <BaseCard>
            <div class="section-toolbar">
              <div>
                <p class="section-eyebrow mb-2">Validated Items</p>
                

                <h3 class="h5 fw-bold mb-1">Komponen yang sudah disetor</h3>
                
                <p class="text-secondary mb-0">Pilih data jika Anda ingin membatalkan validasi yang sudah tersimpan.</p>
              </div>
              <button
                class="btn btn-outline-danger validation-submit-btn"
                @click="handleDeleteSetoran"
                :disabled="isDeleting || !selectedForDelete.length"
              >
                {{ isDeleting ? 'Membatalkan...' : 'Batalkan validasi' }}
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

              <div class="table-responsive d-none d-md-block setoran-table-shell">
                <table class="table align-middle mb-0">
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
import { formatDate } from '../utils/format'

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
