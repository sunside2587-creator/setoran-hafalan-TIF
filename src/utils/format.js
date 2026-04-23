export function formatDate(dateString) {
  if (!dateString) {
    return '-'
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium'
  }).format(new Date(dateString))
}

export function formatDateTime(dateString) {
  if (!dateString) {
    return '-'
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(dateString))
}

export function progressVariant(progress) {
  if (progress >= 80) {
    return 'success'
  }

  if (progress >= 40) {
    return 'warning'
  }

  return 'danger'
}
