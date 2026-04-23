<template>
  <div class="text-center py-5">
    <h2 class="h5 fw-bold mb-2">{{ title }}</h2>
    <p class="text-secondary mb-0">{{ description }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
})
</script>
