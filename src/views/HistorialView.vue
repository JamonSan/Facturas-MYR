<template>
  <div class="historial-view">
    <!-- Header -->
    <div class="view-header">
      <div>
        <h1 class="view-title">Historial de Facturas</h1>
        <p class="view-subtitle">{{ facturas.length }} factura{{ facturas.length !== 1 ? 's' : '' }} guardadas</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-ghost btn-sm" @click="importarBackup" title="Importar backup JSON">
          <IconUpload /> Importar backup
        </button>
        <button class="btn btn-secondary" @click="exportarBackup" :disabled="facturas.length === 0">
          <IconDownload /> Exportar backup
        </button>
        <RouterLink to="/editor" class="btn btn-primary">
          <IconPlus /> Nueva Factura
        </RouterLink>
      </div>
    </div>

    <!-- Filtros y búsqueda -->
    <div class="filters-bar card">
      <div class="search-wrap">
        <IconSearch class="search-icon" />
        <input
          v-model="searchQuery"
          placeholder="Buscar por cliente, número o descripción..."
          class="search-input"
        />
      </div>
      <div class="filter-group">
        <select v-model="filterEstado" class="filter-select">
          <option value="">Todos los estados</option>
          <option value="borrador">Borrador</option>
          <option value="emitida">Emitida</option>
          <option value="pagada">Pagada</option>
        </select>
      </div>
    </div>

    <!-- Lista de facturas -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando facturas...</p>
    </div>

    <div v-else-if="filteredFacturas.length === 0" class="empty-state">
      <div class="empty-icon">📄</div>
      <h3>{{ searchQuery || filterEstado ? 'Sin resultados' : 'Sin facturas aún' }}</h3>
      <p>{{ searchQuery || filterEstado ? 'Prueba con otros filtros' : 'Crea tu primera factura con el botón "Nueva Factura"' }}</p>
      <RouterLink v-if="!searchQuery && !filterEstado" to="/editor" class="btn btn-primary" style="margin-top:1rem">
        <IconPlus /> Crear primera factura
      </RouterLink>
    </div>

    <div v-else class="data-table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>N.º Factura</th>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Descripción</th>
            <th class="text-right">Total</th>
            <th class="text-center">Estado</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="f in filteredFacturas" :key="f.id">
            <td class="font-mono text-accent"><strong>{{ f.numero }}</strong></td>
            <td>{{ formatDate(f.fecha) }}</td>
            <td class="font-semibold">{{ f.cliente?.nombre || 'Sin nombre' }}</td>
            <td class="text-muted truncate-text" style="max-width: 200px;">{{ f.descripcion || '—' }}</td>
            <td class="text-right font-mono font-bold">{{ formatCurrency(calcTotal(f)) }}</td>
            <td class="text-center"><span :class="['badge', badgeClass(f.estado)]">{{ f.estado }}</span></td>
            <td>
              <div class="table-actions">
                <RouterLink :to="`/editor/${f.id}`" class="btn-icon text-accent" title="Editar">
                  <IconEdit size="16" />
                </RouterLink>
                <button class="btn-icon text-info" @click="previewFactura(f)" title="Ver PDF">
                  <IconEye size="16" />
                </button>
                <button class="btn-icon text-danger" @click="confirmarEliminar(f)" title="Eliminar">
                  <IconTrash size="16" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Input oculto para importar JSON -->
    <input ref="fileInput" type="file" accept=".json" style="display:none" @change="handleFileImport" />

    <!-- Modal confirm eliminar -->
    <Transition name="modal">
      <div v-if="facturaAEliminar" class="modal-overlay" @click.self="facturaAEliminar = null">
        <div class="confirm-modal card">
          <div class="confirm-icon">🗑️</div>
          <h3>¿Eliminar factura?</h3>
          <p>Vas a eliminar la factura <strong>{{ facturaAEliminar.numero }}</strong> de <strong>{{ facturaAEliminar.cliente?.nombre }}</strong>. Esta acción no se puede deshacer.</p>
          <div class="confirm-actions">
            <button class="btn btn-ghost" @click="facturaAEliminar = null">Cancelar</button>
            <button class="btn btn-danger" @click="eliminarFactura">Eliminar</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Preview PDF modal -->
    <Transition name="modal">
      <div v-if="previewFacturaData" class="modal-overlay" @click.self="previewFacturaData = null">
        <div class="modal-container">
          <div class="modal-header">
            <h2 class="modal-title">Factura {{ previewFacturaData.numero }}</h2>
            <div class="modal-actions">
              <button class="btn btn-primary" @click="descargarPDF">
                <IconDownload /> Descargar PDF
              </button>
              <button class="btn-icon" @click="previewFacturaData = null">
                <IconX />
              </button>
            </div>
          </div>
          <div class="preview-scroll">
            <InvoiceTemplate
              :factura="previewFacturaData"
              :subtotal="calcSubtotal(previewFacturaData)"
              :importeIva="calcIva(previewFacturaData)"
              :total="calcTotal(previewFacturaData)"
              ref="previewRef"
            />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAllFacturas, deleteFactura, exportarBackupJSON, importarBackupJSON } from '../composables/useStorage.js'
import InvoiceTemplate from '../components/InvoiceTemplate.vue'

// ── Icons ─────────────────────────────────────────────────────────
import { IconPlus, IconX, IconSearch, IconEdit, IconEye, IconTrash, IconDownload, IconUpload } from '../components/icons.js'

const facturas = ref([])
const loading = ref(true)
const searchQuery = ref('')
const filterEstado = ref('')
const facturaAEliminar = ref(null)
const previewFacturaData = ref(null)
const fileInput = ref(null)
const previewRef = ref(null)

// ── Filtrado ──────────────────────────────────────────────────────
const filteredFacturas = computed(() => {
  let result = facturas.value
  if (filterEstado.value) {
    result = result.filter(f => f.estado === filterEstado.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(f =>
      f.numero?.toLowerCase().includes(q) ||
      f.cliente?.nombre?.toLowerCase().includes(q) ||
      f.descripcion?.toLowerCase().includes(q)
    )
  }
  return result
})

// ── Helpers ───────────────────────────────────────────────────────
function calcSubtotal(f) {
  return (f.conceptos || []).reduce((s, c) => s + (c.precioUnitario || 0), 0)
}
function calcIva(f) { return calcSubtotal(f) * ((f.ivaPercent || 0) / 100) }
function calcTotal(f) { return calcSubtotal(f) + calcIva(f) }

function formatCurrency(v) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(v || 0)
}
function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}
function badgeClass(estado) {
  return { borrador: 'badge-info', emitida: 'badge-warning', pagada: 'badge-success' }[estado] || 'badge-info'
}

// ── Acciones ──────────────────────────────────────────────────────
async function cargarFacturas() {
  loading.value = true
  facturas.value = await getAllFacturas()
  loading.value = false
}

function confirmarEliminar(f) { facturaAEliminar.value = f }

async function eliminarFactura() {
  await deleteFactura(facturaAEliminar.value.id)
  facturaAEliminar.value = null
  await cargarFacturas()
}

function exportarBackup() { exportarBackupJSON() }

function importarBackup() { fileInput.value?.click() }

async function handleFileImport(e) {
  const file = e.target.files[0]
  if (!file) return
  try {
    const count = await importarBackupJSON(file)
    alert(`✅ ${count} facturas importadas correctamente.`)
    await cargarFacturas()
  } catch {
    alert('❌ Error al importar el archivo. Asegúrate de que es un backup válido.')
  }
  e.target.value = ''
}

function previewFactura(f) { previewFacturaData.value = f }

async function descargarPDF() {
  try {
    const f = previewFacturaData.value

    const safeClientName = f.cliente?.nombre 
      ? f.cliente.nombre.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_')
      : 'Desconocido'
    const fileName = `Factura_${f.numero}_${safeClientName}.pdf`

    // Usar el título del documento para controlar el nombre del archivo nativo
    const originalTitle = document.title
    document.title = fileName
    
    // Disparar el diálogo de impresión nativo (Guardar como PDF)
    window.print()
    
    // Restaurar el título original
    document.title = originalTitle
  } catch (err) {
    console.error('Error PDF:', err)
    alert('❌ Error al generar el PDF.')
  }
}

onMounted(cargarFacturas)
</script>

<style scoped>
.historial-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* ── Header ─────────────────────────────────────────────────────── */
.view-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.view-title { font-size: 1.6rem; font-weight: 700; }
.view-subtitle { font-size: 0.85rem; color: var(--color-text-muted); margin-top: 0.2rem; }
.header-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; }

/* ── Filters ────────────────────────────────────────────────────── */
.filters-bar {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 0.9rem 1.25rem;
}
.search-wrap {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}
.search-icon {
  position: absolute;
  left: 0.75rem;
  color: var(--color-text-faint);
  pointer-events: none;
}
.search-input { padding-left: 2.25rem !important; }
.filter-select { width: auto; }

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

.text-right { text-align: right !important; }
.text-center { text-align: center !important; }
.font-mono { font-family: var(--font-mono); }
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
.text-accent { color: var(--color-accent); }
.text-muted { color: var(--color-text-muted); }
.text-info { color: var(--color-info); }
.text-danger { color: var(--color-danger); }

.truncate-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
  vertical-align: middle;
}

/* ── Estados vacíos ─────────────────────────────────────────────── */
.loading-state, .empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--color-text-muted);
}
.empty-icon { font-size: 3rem; margin-bottom: 1rem; }
.empty-state h3 { font-size: 1.1rem; font-weight: 600; color: var(--color-text); margin-bottom: 0.5rem; }
.empty-state p { font-size: 0.875rem; }

/* ── Spinner ─────────────────────────────────────────────────────── */
.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Confirm modal ───────────────────────────────────────────────── */
.confirm-modal {
  max-width: 420px;
  width: 100%;
  text-align: center;
  padding: 2rem;
}
.confirm-icon { font-size: 2.5rem; margin-bottom: 1rem; }
.confirm-modal h3 { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem; }
.confirm-modal p { font-size: 0.875rem; color: var(--color-text-muted); margin-bottom: 1.5rem; }
.confirm-actions { display: flex; gap: 0.75rem; justify-content: center; }

/* ── Preview modal ──────────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 1.5rem;
  overflow-y: auto;
}
.modal-container {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 820px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
}
.modal-title { font-size: 1rem; font-weight: 600; }
.modal-actions { display: flex; gap: 0.5rem; align-items: center; }
.preview-scroll { padding: 1.5rem; overflow-x: auto; }

/* ── List transitions ───────────────────────────────────────────── */
.list-enter-active { transition: all 0.25s ease; }
.list-leave-active { transition: all 0.2s ease; }
.list-enter-from { opacity: 0; transform: translateY(10px); }
.list-leave-to  { opacity: 0; transform: scale(0.95); }

/* ── Modal transitions ──────────────────────────────────────────── */
.modal-enter-active { transition: all 0.25s ease; }
.modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from { opacity: 0; }
.modal-leave-to  { opacity: 0; }
</style>
