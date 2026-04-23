<template>
  <BaseCard>
    <p class="text-uppercase text-secondary fw-semibold small mb-2">{{ label }}</p>
    <div class="d-flex align-items-end justify-content-between gap-3">
      <div>
        <h3 class="display-6 fw-bold mb-1">{{ value }}</h3>
        <p class="text-secondary mb-0 small">{{ help }}</p>
      </div>
      <span :class="`badge text-bg-${variant}`">{{ badge }}</span>
    </div>
  </BaseCard>
</template>

<script setup>
import BaseCard from './BaseCard.vue'

defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  help: {
    type: String,
    default: ''
  },
  badge: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'primary'
  }
})
</script>
