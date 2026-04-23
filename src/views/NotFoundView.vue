<template>
  <div class="row justify-content-center">
    <div class="col-lg-6">
      <div class="card border-0 shadow-sm">
        <div class="card-body text-center p-5">
          <p class="text-uppercase text-secondary fw-semibold small mb-2">404</p>
          <h2 class="h3 fw-bold mb-3">Halaman tidak ditemukan</h2>
          <p class="text-secondary mb-4">
            Rute yang Anda buka tidak tersedia pada aplikasi setoran hafalan ini.
          </p>
          <RouterLink :to="{ name: 'dashboard' }" class="btn btn-primary">
            Kembali ke dashboard
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>
