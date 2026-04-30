<script setup>
import { useRegisterSW } from 'virtual:pwa-register/vue'

const {
  offlineReady,
  needRefresh,
  updateServiceWorker,
} = useRegisterSW({
  onRegisterError(error) {
    console.error('Error durante la instalación del Service Worker:', error)
  },
})

const close = async () => {
  offlineReady.value = false
  needRefresh.value = false
}
</script>

<template>
  <div
    v-if="offlineReady || needRefresh"
    class="pwa-toast fade-in"
    role="alert"
  >
    <div class="message">
      <span v-if="offlineReady">
        ✅ Aplicación lista para usarse sin conexión.
      </span>
      <span v-else>
        🎉 ¡Nueva versión disponible!
      </span>
    </div>
    <div class="actions">
      <button v-if="needRefresh" @click="updateServiceWorker()" class="btn btn-primary btn-sm">
        Actualizar
      </button>
      <button @click="close" class="btn btn-ghost btn-sm">
        Cerrar
      </button>
    </div>
  </div>
</template>

<style scoped>
.pwa-toast {
  position: fixed;
  right: 20px;
  bottom: 20px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-accent);
  box-shadow: var(--shadow-lg);
  padding: 1rem 1.5rem;
  border-radius: var(--radius-md);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 300px;
}
.message {
  font-weight: 600;
  font-size: 0.95rem;
}
.actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}
.fade-in {
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
