<template>
  <div class="view-container">
    <header class="view-header">
      <div class="header-titles">
        <h1 class="page-title">Directorio de Clientes</h1>
        <p class="page-subtitle">Gestiona la información de tus clientes habituales</p>
      </div>
      <button class="btn btn-primary" @click="openModal()">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nuevo Cliente
      </button>
    </header>

    <div class="clientes-content">
      <div v-if="clientes.length === 0" class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        <h3>No tienes clientes guardados</h3>
        <p>Añade clientes para autocompletar sus datos rápidamente al crear facturas.</p>
        <button class="btn btn-secondary" @click="openModal()">Añadir primer cliente</button>
      </div>

      <div v-else class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nombre / Empresa</th>
              <th>NIF/CIF</th>
              <th>Teléfono</th>
              <th>Población</th>
              <th class="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cliente in clientes" :key="cliente.id">
              <td class="font-semibold">{{ cliente.nombre }}</td>
              <td class="font-mono text-muted">{{ cliente.nif || '—' }}</td>
              <td>{{ cliente.telefono || '—' }}</td>
              <td class="text-muted">
                {{ [cliente.localidad, cliente.provincia].filter(Boolean).join(', ') || '—' }}
              </td>
              <td>
                <div class="table-actions">
                  <button class="btn-icon text-accent" @click="openModal(cliente)" title="Editar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="16 3 21 8 8 21 3 21 3 16 16 3"></polygon></svg>
                  </button>
                  <button class="btn-icon text-danger" @click="confirmDelete(cliente)" title="Eliminar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Formulario -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ currentCliente.id ? 'Editar Cliente' : 'Nuevo Cliente' }}</h2>
          <button class="btn-icon" @click="closeModal">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <form @submit.prevent="saveForm" class="modal-body">
          <div class="form-group">
            <label>Nombre / Empresa *</label>
            <input v-model="currentCliente.nombre" type="text" class="input-control" required placeholder="Ej: Juan Perez o Empresa S.L.">
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>NIF / CIF</label>
              <input v-model="currentCliente.nif" type="text" class="input-control" placeholder="Ej: 12345678Z">
            </div>
            <div class="form-group">
              <label>Teléfono</label>
              <input v-model="currentCliente.telefono" type="text" class="input-control" placeholder="Ej: 600 000 000">
            </div>
          </div>

          <div class="form-group">
            <label>Dirección</label>
            <input v-model="currentCliente.direccion" type="text" class="input-control" placeholder="Ej: Calle Mayor 1, Puerta 2">
          </div>

          <div class="form-row multi">
            <div class="form-group">
              <label>Código Postal</label>
              <input v-model="currentCliente.cp" type="text" class="input-control" placeholder="Ej: 28001">
            </div>
            <div class="form-group flex-2">
              <label>Localidad / Ciudad</label>
              <input v-model="currentCliente.localidad" type="text" class="input-control" placeholder="Ej: Madrid">
            </div>
            <div class="form-group flex-2">
              <label>Provincia</label>
              <input v-model="currentCliente.provincia" type="text" class="input-control" placeholder="Ej: Madrid">
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">Cancelar</button>
            <button type="submit" class="btn btn-primary">Guardar Cliente</button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { loadClientes, saveCliente, deleteCliente } from '../composables/useStorage'

const clientes = ref([])
const showModal = ref(false)
const currentCliente = ref({})

const fetchClientes = async () => {
  clientes.value = await loadClientes()
}

onMounted(() => {
  fetchClientes()
})

const openModal = (cliente = null) => {
  if (cliente) {
    // Clonar para no modificar la tabla directamente hasta guardar
    currentCliente.value = JSON.parse(JSON.stringify(cliente))
  } else {
    currentCliente.value = {
      nombre: '', nif: '', telefono: '', direccion: '', cp: '', localidad: '', provincia: ''
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  currentCliente.value = {}
}

const saveForm = async () => {
  if (!currentCliente.value.nombre) return
  await saveCliente(currentCliente.value)
  await fetchClientes()
  closeModal()
}

const confirmDelete = async (cliente) => {
  if (confirm(`¿Estás seguro de que quieres eliminar a "${cliente.nombre}"?\nEsto no afectará a las facturas ya creadas, pero desaparecerá de tu agenda.`)) {
    await deleteCliente(cliente.id)
    await fetchClientes()
  }
}
</script>

<style scoped>
/* ── Tabla de Datos ───────────────────────────────────────────── */
.data-table-container {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow-x: auto;
  box-shadow: var(--shadow-sm);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.data-table th {
  background: var(--color-surface-2);
  color: var(--color-text-muted);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
  vertical-align: middle;
}

.data-table tbody tr:hover {
  background: rgba(104,201,233,0.05);
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.table-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.text-center { text-align: center !important; }
.font-mono { font-family: var(--font-mono); }
.font-semibold { font-weight: 600; }
.text-accent { color: var(--color-accent); }
.text-muted { color: var(--color-text-muted); }
.text-danger { color: var(--color-danger); }

/* Modal Estilos */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  width: 90%;
  max-width: 600px;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 { margin: 0; font-size: 1.25rem; }

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-footer {
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group { flex: 1; }
.form-row.multi .flex-2 { flex: 2; }

@media (max-width: 600px) {
  .form-row { flex-direction: column; gap: 1rem; }
}

.text-danger { color: var(--color-danger); }
.text-danger:hover { background: rgba(248, 113, 113, 0.1); }
</style>
