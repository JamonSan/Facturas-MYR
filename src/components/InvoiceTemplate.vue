<template>
  <div class="invoice-a4" id="invoice-printable">
    <!-- CABECERA -->
    <header class="inv-header">
      <div class="inv-company-info">
        <h1 class="inv-brand-name">ROBERT HUART .SL</h1>
        <p>C/ Nord, 31, 1º-3ª</p>
        <p>17600 FIGUERES, Girona</p>
        <p>Telf. 610 28 91 37</p>
      </div>
      
      <div class="inv-logo-container">
        <img src="/image.png" alt="Robert Huart Logo" class="inv-logo" />
      </div>
    </header>

    <div class="inv-title-bar">
      <h2 class="inv-title">FACTURA</h2>
    </div>

    <!-- BLOQUES DE DATOS (Cliente y Meta) -->
    <section class="inv-info-blocks">
      <!-- Datos Cliente -->
      <div class="inv-box inv-client-box">
        <div class="inv-box-title">Cliente</div>
        <div class="inv-client-grid">
          <span class="label">Nombre:</span>
          <span class="value"><strong>{{ factura.cliente?.nombre || '' }}</strong></span>
          
          <span class="label">Dirección:</span>
          <span class="value">{{ factura.cliente?.direccion || '' }}</span>
          
          <span class="label">Ciudad:</span>
          <div class="value multi-fields">
            <span class="field-item flex-2">{{ factura.cliente?.localidad || '' }}</span>
            <span class="label">Provincia:</span>
            <span class="field-item flex-2">{{ factura.cliente?.provincia || '' }}</span>
            <span class="label">CP:</span>
            <span class="field-item flex-1">{{ factura.cliente?.cp || '' }}</span>
          </div>
          
          <span class="label">NIF/CIF:</span>
          <span class="value">{{ factura.cliente?.nif || '' }}</span>
        </div>
      </div>

      <!-- Datos Factura -->
      <div class="inv-box inv-meta-box">
        <div class="inv-meta-grid">
          <span class="label">Fecha:</span>
          <span class="value align-right">{{ formatDate(factura.fecha) }}</span>
          
          <span class="label">N.º de factura:</span>
          <span class="value align-right font-mono"><strong>{{ factura.numero }}</strong></span>
        </div>
      </div>
    </section>

    <div v-if="factura.descripcion" class="inv-general-desc">
      <strong>CONCEPTO GENERAL:</strong> {{ factura.descripcion }}
    </div>

    <!-- TABLA DE CONCEPTOS -->
    <section class="inv-table-section">
      <table class="inv-table">
        <thead>
          <tr>
            <th class="col-desc">Descripción</th>
            <th class="col-price">Precio Ud.</th>
            <th class="col-total">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          <template v-if="factura.conceptos && factura.conceptos.length > 0">
            <tr v-for="(c, i) in factura.conceptos" :key="i">
              <td class="td-desc">{{ c.descripcion || '' }}</td>
              <td class="td-num">{{ formatCurrency(c.precioUnitario) }}</td>
              <td class="td-total">{{ formatCurrency(c.precioUnitario || 0) }}</td>
            </tr>
          </template>
          <tr v-else>
            <td colspan="3" class="td-empty">Sin conceptos registrados</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- PIE DE FACTURA (Detalles de pago y Totales) -->
    <section class="inv-footer-section">
      <!-- Detalles de pago -->
      <div class="inv-box inv-payment-box">
        <div class="inv-box-title">Detalles de pago</div>
        <div class="payment-details" style="margin-top: 10px;">
          <div class="payment-line">
            <span class="label">Método:</span>
            <span style="margin-left: 10px; font-weight: bold;">Transferencia bancaria</span>
          </div>
          <div class="payment-line" style="margin-top: 10px;">
            <span class="label">N.º de cuenta (IBAN)</span>
            <span class="line-blank"></span>
          </div>
        </div>
      </div>

      <!-- Totales -->
      <div class="inv-totals-box">
        <table class="totals-table">
          <tr>
            <td class="label-td">Base Imponible:</td>
            <td class="value-td">{{ formatCurrency(subtotal) }}</td>
          </tr>
          <tr>
            <td class="label-td">IVA {{ factura.ivaPercent }}%:</td>
            <td class="value-td">{{ formatCurrency(importeIva) }}</td>
          </tr>
          <tr class="total-row">
            <td class="label-td">TOTAL:</td>
            <td class="value-td">{{ formatCurrency(total) }}</td>
          </tr>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
const props = defineProps({
  factura:    { type: Object,  required: true },
  subtotal:   { type: Number,  default: 0 },
  importeIva: { type: Number,  default: 0 },
  total:      { type: Number,  default: 0 },
})

function formatCurrency(v) {
  if (!v && v !== 0) return ''
  return new Intl.NumberFormat('es-ES', {
    style: 'currency', currency: 'EUR', minimumFractionDigits: 2
  }).format(v)
}

function formatNumber(v) {
  if (!v && v !== 0) return ''
  return Number(v) % 1 === 0 ? String(Number(v)) : Number(v).toFixed(2)
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d + 'T12:00:00').toLocaleDateString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
}
</script>

<style scoped>
/* ESTILO FACTURA ROBERT HUART S.L. */
.invoice-a4 {
  width: 210mm;
  min-height: 297mm;
  background: #ffffff;
  font-family: 'Arial', sans-serif;
  font-size: 9pt;
  color: #000000;
  padding: 15mm;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

p { margin: 0 0 2px 0; }

/* Cabecera */
.inv-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2mm;
}

.inv-company-info .inv-brand-name {
  font-size: 16pt;
  font-weight: bold;
  margin: 0 0 4px 0;
  border-bottom: 2px solid #000;
  display: inline-block;
  padding-bottom: 2px;
}

.inv-company-info p {
  font-size: 10pt;
}

.inv-logo-container {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.inv-logo {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* Título Factura */
.inv-title-bar {
  text-align: right;
  border-top: 3px solid #000;
  margin-bottom: 5mm;
  padding-top: 2px;
}

.inv-title {
  font-size: 18pt;
  font-style: italic;
  font-weight: bold;
  margin: 0;
  display: inline-block;
  background: white;
  padding-left: 10px;
  transform: translateY(-16px);
}

/* Bloques de información */
.inv-info-blocks {
  display: flex;
  gap: 5mm;
  margin-bottom: 5mm;
}

.inv-box {
  border: 1px solid #000;
  border-radius: 8px;
  padding: 4mm;
  position: relative;
}

.inv-box-title {
  position: absolute;
  top: -8px;
  left: 10px;
  background: #fff;
  padding: 0 5px;
  font-weight: bold;
  font-size: 9pt;
}

/* Caja Cliente */
.inv-client-box {
  flex: 2;
}

.inv-client-grid {
  display: grid;
  grid-template-columns: 60px 1fr;
  row-gap: 4px;
  align-items: end;
}

.inv-client-grid .label {
  font-weight: normal;
  color: #333;
}

.inv-client-grid .value {
  border-bottom: 1px solid #000;
  padding-bottom: 1px;
  min-height: 14px;
}

.multi-fields {
  display: flex;
  align-items: end;
  gap: 5px;
  border-bottom: none !important;
}

.multi-fields .field-item {
  border-bottom: 1px solid #000;
  padding-bottom: 1px;
  min-height: 14px;
}

.flex-1 { flex: 1; }
.flex-2 { flex: 2; }

/* Caja Meta (Fecha y Num) */
.inv-meta-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.inv-meta-grid {
  display: grid;
  grid-template-columns: 80px 1fr;
  row-gap: 15px;
  align-items: end;
}

.inv-meta-grid .label {
  font-weight: bold;
}

.inv-meta-grid .value {
  border-bottom: 1px solid #000;
  padding-bottom: 1px;
}

.align-right { text-align: center; }
.font-mono { font-family: monospace; font-size: 10pt;}

.inv-general-desc {
  margin-bottom: 5mm;
  font-size: 9pt;
}

/* Tabla de Conceptos */
.inv-table-section {
  flex: 1;
  margin-bottom: 5mm;
}

.inv-table {
  width: 100%;
  border-collapse: collapse;
  border: 2px solid #000;
  height: 100%;
}

.inv-table th {
  border: 1px solid #000;
  border-bottom: 2px solid #000;
  padding: 5px;
  font-weight: bold;
  text-align: center;
}

.col-desc { width: 68%; }
.col-price { width: 16%; }
.col-total { width: 16%; }

.inv-table td {
  border-left: 1px solid #000;
  border-right: 1px solid #000;
  padding: 5px;
  vertical-align: top;
}

.td-desc { 
  white-space: pre-wrap; 
}

.td-num { text-align: center; }
.td-total { text-align: right; }

.td-empty {
  text-align: center;
  font-style: italic;
  color: #777;
  padding: 20px !important;
  border: none !important;
}

/* Pie de Factura */
.inv-footer-section {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: 5mm;
}

.inv-payment-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-bottom: 10px;
}

.payment-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.radio-circle {
  display: inline-block;
  width: 10px;
  height: 10px;
  border: 1px solid #000;
  border-radius: 50%;
}

.radio-circle.active {
  background-color: #000;
  box-shadow: inset 0 0 0 2px #fff;
}

.payment-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.payment-line {
  display: flex;
  align-items: end;
  gap: 5px;
}

.payment-line .line-blank {
  flex: 1;
  border-bottom: 1px solid #000;
  min-height: 14px;
}

/* Totales */
.inv-totals-box {
  width: 40%;
  display: flex;
  align-items: flex-end;
}

.totals-table {
  width: 100%;
  border-collapse: collapse;
  border: 2px solid #000;
}

.totals-table td {
  border: 1px solid #000;
  padding: 5px;
}

.totals-table .label-td {
  font-weight: bold;
  text-align: right;
  width: 60%;
}

.totals-table .value-td {
  text-align: right;
  font-weight: bold;
}

.total-row .value-td {
  background-color: #f2f2f2;
}
</style>

