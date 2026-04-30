<template>
  <div class="editor-view">
    <!-- Header -->
    <div class="view-header">
      <div>
        <h1 class="view-title">
          {{ isEditing ? 'Editar Factura' : 'Nueva Factura' }}
        </h1>
        <p class="view-subtitle">
          {{ isEditing ? `Modificando ${factura.numero}` : 'Rellena los datos para generar la factura' }}
        </p>
      </div>
      <div class="header-actions">
        <button class="btn btn-ghost" @click="resetForm">
          <IconX /> Limpiar
        </button>
        <button class="btn btn-secondary" @click="guardarBorrador" :disabled="loading">
          <IconSave /> Guardar borrador
        </button>
        <button class="btn btn-primary" @click="guardarYVerPreview" :disabled="loading">
          <IconEye /> Vista previa & PDF
        </button>
      </div>
    </div>

    <div class="editor-grid">
      <!-- ══ Columna izquierda: formulario ══ -->
      <div class="form-column">

        <!-- Bloque: datos de la factura -->
        <div class="card fade-in" style="animation-delay:0.05s">
          <div class="card-header">
            <span class="card-title">Datos de la Factura</span>
            <span class="badge badge-info">{{ factura.numero || 'Auto' }}</span>
          </div>
          <div class="form-grid-2">
            <div class="field">
              <label class="field-label">Número de Factura</label>
              <input v-model="factura.numero" placeholder="Ej: 2026-0001" />
            </div>
            <div class="field">
              <label class="field-label">Fecha</label>
              <input type="date" v-model="factura.fecha" />
            </div>
          </div>
        </div>

        <!-- Bloque: datos del cliente -->
        <div class="card fade-in" style="animation-delay:0.1s">
          <section class="editor-section">
            <div class="card-header">
              <span class="card-title">Datos del Cliente</span>
              <div class="client-selector" style="width: 100%;">
                <select v-model="clienteSeleccionadoId" class="input-control select-agenda" style="width: 100%; border: 2px solid var(--color-accent); font-weight: bold; margin-bottom: 1rem;">
                  <option value="" v-if="clientesAgenda.length === 0" disabled>-- Agenda vacía (Añade clientes en la pestaña 'Clientes') --</option>
                  <option value="" v-else>-- Elegir cliente de la agenda --</option>
                  
                  <option v-for="c in clientesAgenda" :key="c.id" :value="c.id">
                    {{ c.nombre }}
                  </option>
                </select>
              </div>
            </div>
            <div class="form-grid-2">
              <div class="field" style="grid-column: 1 / -1">
                <label class="field-label">Nombre / Empresa</label>
                <input v-model="factura.cliente.nombre" placeholder="Nombre del cliente o empresa" />
              </div>
              <div class="field">
                <label class="field-label">NIF / CIF</label>
                <input v-model="factura.cliente.nif" placeholder="00000000A" />
              </div>
              <div class="field">
                <label class="field-label">Teléfono</label>
                <input v-model="factura.cliente.telefono" placeholder="+34 600 000 000" />
              </div>
              <div class="field" style="grid-column: 1 / -1">
                <label class="field-label">Dirección</label>
                <input v-model="factura.cliente.direccion" placeholder="Calle, número, piso..." />
              </div>
              <div class="field">
                <label class="field-label">Localidad</label>
                <input v-model="factura.cliente.localidad" placeholder="Ciudad" />
              </div>
              <div class="field">
                <label class="field-label">Código Postal</label>
                <input v-model="factura.cliente.cp" placeholder="00000" />
              </div>
            </div>
          </section>
        </div>

        <!-- Bloque: descripción del trabajo -->
        <div class="card fade-in" style="animation-delay:0.15s">
          <div class="card-header">
            <span class="card-title">Descripción del Trabajo</span>
          </div>
          <div class="field">
            <label class="field-label">Descripción general</label>
            <textarea v-model="factura.descripcion" rows="3"
              placeholder="Ej: Trabajos de pintura en vivienda particular — Salón y dormitorios principales" />
          </div>
        </div>

        <!-- Bloque: conceptos / líneas -->
        <div class="card fade-in" style="animation-delay:0.2s">
          <div class="card-header">
            <span class="card-title">Conceptos</span>
            <button class="btn btn-sm btn-primary" @click="addConcepto">
              <IconPlus /> Añadir línea
            </button>
          </div>

          <div class="conceptos-header">
            <span>Descripción</span>
            <span style="text-align: right;">Precio/ud.</span>
            <span style="text-align: right;">TOTAL</span>
            <span></span>
          </div>

          <TransitionGroup name="list" tag="div" class="conceptos-list">
            <div
              v-for="(concepto, i) in factura.conceptos"
              :key="concepto._key"
              class="concepto-row"
            >
              <input
                v-model="concepto.descripcion"
                :placeholder="placeholders[i % placeholders.length]"
                class="concepto-desc"
              />
              <div class="concepto-precio-wrap">
                <span class="currency-symbol">€</span>
                <input
                  v-model.number="concepto.precioUnitario"
                  type="number"
                  min="0"
                  step="0.01"
                  class="concepto-num"
                  placeholder="0.00"
                />
              </div>
              <div class="concepto-total">
                {{ formatCurrency(concepto.precioUnitario) }}
              </div>
              <button class="btn-icon" @click="removeConcepto(i)" title="Eliminar línea">
                <IconX size="14" />
              </button>
            </div>
          </TransitionGroup>

          <div v-if="factura.conceptos.length === 0" class="empty-conceptos">
            <p>No hay conceptos. Pulsa "Añadir línea" para empezar.</p>
          </div>
        </div>

        <!-- Bloque: notas -->
        <div class="card fade-in" style="animation-delay:0.25s">
          <div class="card-header">
            <span class="card-title">Notas / Condiciones</span>
          </div>
          <div class="field">
            <textarea v-model="factura.notas" rows="3"
              placeholder="Ej: Forma de pago: Transferencia bancaria. Validez: 30 días." />
          </div>
        </div>

      </div>

      <!-- ══ Columna derecha: resumen ══ -->
      <div class="summary-column">
        <div class="summary-card card fade-in" style="animation-delay:0.3s">
          <div class="card-title" style="margin-bottom:1.25rem">Resumen</div>

          <div class="summary-rows">
            <div class="summary-row">
              <span>Subtotal</span>
              <span>{{ formatCurrency(subtotal) }}</span>
            </div>
            <div class="summary-row">
              <span class="flex items-center gap-1">
                IVA
                <select v-model.number="factura.ivaPercent" class="iva-select">
                  <option :value="0">0%</option>
                  <option :value="10">10%</option>
                  <option :value="21">21%</option>
                </select>
              </span>
              <span>{{ formatCurrency(importeIva) }}</span>
            </div>
            <hr class="divider" style="margin: 0.75rem 0" />
            <div class="summary-row summary-total">
              <span>TOTAL</span>
              <span class="total-amount">{{ formatCurrency(total) }}</span>
            </div>
          </div>

          <div class="summary-actions">
            <button class="btn btn-primary w-full btn-lg" @click="guardarYVerPreview" :disabled="loading">
              <IconEye /> Vista previa & PDF
            </button>
            <button class="btn btn-secondary w-full" @click="guardarBorrador" :disabled="loading">
              <IconSave /> {{ loading ? 'Guardando...' : 'Guardar borrador' }}
            </button>
          </div>

          <div v-if="savedMessage" class="saved-toast">
            ✅ {{ savedMessage }}
          </div>
        </div>

        <!-- Info empresa -->
        <div class="card fade-in empresa-info" style="animation-delay:0.35s">
          <div class="card-title" style="margin-bottom:0.75rem; font-size:0.8rem">Datos de Emisor</div>
          <div class="empresa-datos">
            <strong>MyR</strong>
            <span>Pinturas y Reparaciones</span>
            <span class="text-muted">CIF: B10752525</span>
            <span class="text-muted">Tel: 610 28 91 37</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ Modal: Vista Previa PDF ══ -->
    <Transition name="modal">
      <div v-if="showPreview" class="modal-overlay" @click.self="showPreview = false">
        <div class="modal-container">
          <div class="modal-header">
            <h2 class="modal-title">Vista previa de factura</h2>
            <div class="modal-actions">
              <button class="btn btn-primary" @click="generarPDF" :disabled="generatingPDF">
                <IconDownload /> {{ generatingPDF ? 'Generando...' : 'Descargar PDF' }}
              </button>
              <button class="btn-icon" @click="showPreview = false">
                <IconX />
              </button>
            </div>
          </div>
          <div class="preview-scroll">
            <InvoiceTemplate :factura="factura" :subtotal="subtotal" :importeIva="importeIva" :total="total" ref="invoiceRef" />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { saveFactura, getFactura, getNextNumeroFactura, loadClientes } from '../composables/useStorage.js'
import InvoiceTemplate from '../components/InvoiceTemplate.vue'

// ── Icons ─────────────────────────────────────────────────────────
import { IconPlus, IconX, IconSave, IconEye, IconDownload } from '../components/icons.js'

const route = useRoute()
const router = useRouter()

const clientesAgenda = ref([])
const clienteSeleccionadoId = ref('')
const loading = ref(false)
const generatingPDF = ref(false)
const showPreview = ref(false)
const savedMessage = ref('')
const invoiceRef = ref(null)
const isEditing = computed(() => !!route.params.id)

const placeholders = [
  'Mano de obra — Pintura salón',
  'Material — Pintura plástica blanca',
  'Desplazamiento',
  'Imprimación / aparejo',
  'Masilla y lijado',
]

function createEmptyFactura() {
  const today = new Date().toISOString().slice(0, 10)
  return {
    id: null,
    numero: '',
    fecha: today,
    estado: 'borrador',
    cliente: { nombre: '', nif: '', telefono: '', direccion: '', localidad: '', cp: '', provincia: '' },
    descripcion: '',
    conceptos: [],
    ivaPercent: 21,
    notas: '',
    fechaCreacion: null,
    fechaModificacion: null,
  }
}

const factura = reactive(createEmptyFactura())

// ── Computed ──────────────────────────────────────────────────────
const subtotal = computed(() =>
  factura.conceptos.reduce((sum, c) => sum + (c.precioUnitario || 0), 0)
)
const importeIva = computed(() => subtotal.value * (factura.ivaPercent / 100))
const total = computed(() => subtotal.value + importeIva.value)

// ── Métodos ───────────────────────────────────────────────────────
function formatCurrency(val) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val || 0)
}

let keyCounter = 0
function addConcepto() {
  factura.conceptos.push({ _key: ++keyCounter, descripcion: '', precioUnitario: 0 })
}

function removeConcepto(i) {
  factura.conceptos.splice(i, 1)
}

function resetForm() {
  const fresh = createEmptyFactura()
  Object.assign(factura, fresh)
  factura.conceptos = []
}

async function guardarBorrador() {
  loading.value = true
  try {
    const saved = await saveFactura({ ...factura })
    factura.id = saved.id
    factura.numero = saved.numero
    factura.fechaCreacion = saved.fechaCreacion
    factura.fechaModificacion = saved.fechaModificacion
    savedMessage.value = 'Guardado correctamente'
    setTimeout(() => { savedMessage.value = '' }, 3000)
  } finally {
    loading.value = false
  }
}

async function guardarYVerPreview() {
  await guardarBorrador()
  showPreview.value = true
}

async function generarPDF() {
  generatingPDF.value = true
  try {
    const safeClientName = factura.cliente.nombre 
      ? factura.cliente.nombre.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_')
      : 'Borrador'
    const fileName = `Factura_${factura.numero}_${safeClientName}.pdf`

    // Cambiar el título del documento temporalmente para que el navegador 
    // lo use como nombre sugerido al "Guardar como PDF"
    const originalTitle = document.title
    document.title = fileName
    
    // Disparar el generador nativo de PDF (Impresión)
    window.print()
    
    // Restaurar el título
    document.title = originalTitle
  } catch (err) {
    console.error('Error generando PDF:', err)
    alert('❌ Error al generar el PDF. Asegúrate de que la vista previa está abierta.')
  } finally {
    generatingPDF.value = false
  }
}

// ── Watcher: selector de cliente ──────────────────────────────────
watch(clienteSeleccionadoId, (newId) => {
  if (!newId) return
  const cl = clientesAgenda.value.find(c => c.id === newId)
  if (cl) {
    factura.cliente = {
      nombre: cl.nombre || '',
      direccion: cl.direccion || '',
      cp: cl.cp || '',
      localidad: cl.localidad || '',
      provincia: cl.provincia || '',
      nif: cl.nif || '',
      telefono: cl.telefono || ''
    }
  }
})

// ── Lifecycle ─────────────────────────────────────────────────────
onMounted(async () => {
  clientesAgenda.value = await loadClientes()
  if (route.params.id) {
    const saved = await getFactura(route.params.id)
    if (saved) {
      Object.assign(factura, saved)
      const cl = clientesAgenda.value.find(c => c.nombre === saved.cliente.nombre)
      if (cl) clienteSeleccionadoId.value = cl.id
    }
  } else {
    factura.numero = await getNextNumeroFactura()
  }
})
</script>

<style scoped>
.editor-view {
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
  margin-bottom: 2rem;
  flex-wrap: wrap;
}
.view-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--color-text);
}
.view-subtitle {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin-top: 0.2rem;
}
.header-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* ── Layout grid ────────────────────────────────────────────────── */
.editor-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 1.5rem;
  align-items: start;
}

.form-column {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.summary-column {
  position: sticky;
  top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ── Card header ────────────────────────────────────────────────── */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.client-selector select {
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background-color: var(--color-surface-2);
  color: var(--color-text);
  font-family: var(--font-sans);
  cursor: pointer;
  outline: none;
  font-size: 0.9rem;
}
.client-selector select:focus {
  border-color: var(--color-accent);
}

.card-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ── Form fields ────────────────────────────────────────────────── */
.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.field { display: flex; flex-direction: column; }
textarea { resize: vertical; min-height: 72px; }

/* ── Conceptos ──────────────────────────────────────────────────── */
.conceptos-header {
  display: grid;
  grid-template-columns: 1fr 130px 100px 36px;
  gap: 0.5rem;
  padding: 0 0 0.5rem;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--color-text-faint);
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 0.5rem;
}

.conceptos-list { display: flex; flex-direction: column; gap: 0.5rem; }

.concepto-row {
  display: grid;
  grid-template-columns: 1fr 130px 100px 36px;
  gap: 0.5rem;
  align-items: center;
}
.concepto-num { text-align: right; }
.concepto-precio-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.currency-symbol {
  position: absolute;
  left: 0.7rem;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  pointer-events: none;
}
.concepto-precio-wrap input { padding-left: 1.5rem; }
.concepto-total {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-accent);
  text-align: right;
}

.empty-conceptos {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-faint);
  font-size: 0.85rem;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  margin-top: 0.5rem;
}

/* ── Summary ────────────────────────────────────────────────────── */
.summary-card { padding: 1.5rem; }
.summary-rows { display: flex; flex-direction: column; gap: 0.75rem; }
.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: var(--color-text-muted);
}
.summary-total {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text);
}
.total-amount {
  font-family: var(--font-mono);
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--color-accent);
}
.iva-select {
  width: auto;
  padding: 0.2rem 0.4rem;
  font-size: 0.75rem;
  margin-left: 0.4rem;
}
.summary-actions { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1.5rem; }

.saved-toast {
  margin-top: 1rem;
  padding: 0.6rem 0.9rem;
  background: rgba(52,211,153,0.1);
  border: 1px solid rgba(52,211,153,0.3);
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  color: var(--color-success);
  text-align: center;
  animation: fadeIn 0.3s ease;
}

/* ── Empresa info ───────────────────────────────────────────────── */
.empresa-info { padding: 1.25rem; }
.empresa-datos {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}
.empresa-datos strong { color: var(--color-text); font-size: 0.875rem; }
.text-muted { color: var(--color-text-faint); }

/* ── Modal ──────────────────────────────────────────────────────── */
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
.list-enter-from { opacity: 0; transform: translateY(-8px); }
.list-leave-to  { opacity: 0; transform: translateX(-8px); }

/* ── Modal transitions ──────────────────────────────────────────── */
.modal-enter-active { transition: all 0.25s ease; }
.modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from { opacity: 0; }
.modal-leave-to  { opacity: 0; }
</style>
