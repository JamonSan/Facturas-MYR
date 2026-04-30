<script setup>
import { ref, onMounted } from 'vue'
import ReloadPrompt from './components/ReloadPrompt.vue'

const isDarkTheme = ref(false)

const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value
  if (isDarkTheme.value) {
    document.documentElement.classList.add('dark-theme')
    localStorage.setItem('myr-theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark-theme')
    localStorage.setItem('myr-theme', 'light')
  }
}

onMounted(() => {
  const savedTheme = localStorage.getItem('myr-theme')
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDarkTheme.value = true
    document.documentElement.classList.add('dark-theme')
  }
})
</script>

<template>
  <div id="app-root">
    <!-- Sidebar Navigation -->
    <aside class="sidebar">
      <RouterLink to="/editor" class="sidebar-logo" title="Ir al inicio">
        <img src="/image.png" alt="MyR Huart Logo" class="brand-image" />
      </RouterLink>

      <nav class="sidebar-nav">
        <RouterLink to="/editor" class="nav-item" active-class="nav-item--active">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          <span>Nueva Factura</span>
        </RouterLink>
        <RouterLink to="/historial" class="nav-item" active-class="nav-item--active">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span>Historial</span>
        </RouterLink>
        <RouterLink to="/clientes" class="nav-item" active-class="nav-item--active">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <span>Clientes</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <button class="btn-icon theme-toggle" @click="toggleTheme" :title="isDarkTheme ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'">
          <svg v-if="isDarkTheme" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
        <div class="version-badge">v1.0.0</div>
      </div>
    </aside>

    <!-- Main content -->
    <main class="main-content">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    
    <!-- PWA Update Prompt -->
    <ReloadPrompt />
  </div>
</template>

<style scoped>
#app-root {
  display: flex;
  min-height: 100vh;
}

/* ---- Sidebar ---- */
.sidebar {
  width: 220px;
  min-width: 220px;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.5rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 1.5rem;
  text-decoration: none;
  transition: transform var(--transition);
}

.sidebar-logo:hover {
  transform: scale(1.03);
}

.brand-image {
  width: 100%;
  max-width: 140px;
  height: auto;
  object-fit: contain;
  border-radius: 50%; /* Hace que el fondo se corte en forma circular */
  box-shadow: 0 4px 14px rgba(0,0,0,0.08); /* Sombra suave para darle volumen */
  transition: transform var(--transition), box-shadow var(--transition);
  /* En tema claro multiplicaba, pero con bordes curvos y tema oscuro mejor quitarlo o dejarlo normal */
  background-color: #fffaf9; /* Fondo crema para asegurar consistencia del logo en modo oscuro */
}

/* ---- Nav ---- */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.9rem;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all var(--transition);
}
.nav-item:hover {
  color: var(--color-text);
  background: var(--color-surface-2);
}
.nav-item--active {
  color: var(--color-accent);
  background: var(--color-accent-dim);
}
.nav-item--active svg {
  color: var(--color-accent);
}

/* ---- Footer ---- */
.sidebar-footer {
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.theme-toggle {
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all var(--transition);
}
.theme-toggle:hover {
  background: var(--color-surface-2);
  color: var(--color-accent);
}
.version-badge {
  font-size: 0.7rem;
  color: var(--color-text-faint);
  font-family: var(--font-mono);
  text-align: center;
}

/* ---- Main Content ---- */
.main-content {
  flex: 1;
  overflow-y: auto;
  min-height: 100vh;
}

/* ---- Page transitions ---- */
.page-enter-active,
.page-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
