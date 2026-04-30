import localforage from 'localforage'

// Configura las instancias de localforage para MyR
const facturasStore = localforage.createInstance({
  name: 'myr-facturas',
  storeName: 'facturas'
})

const clientesStore = localforage.createInstance({
  name: 'myr-facturas',
  storeName: 'clientes'
})

const CONFIG_KEY = '__config__'

// ─── Facturas ────────────────────────────────────────────────────────────────

export async function getAllFacturas() {
  const facturas = []
  await facturasStore.iterate((value, key) => {
    if (!key.startsWith('__')) facturas.push(value)
  })
  // Ordenar por fecha desc
  facturas.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
  return facturas
}

export async function getFactura(id) {
  return await facturasStore.getItem(id)
}

export async function saveFactura(factura) {
  // Deep clone para eliminar proxies reactivos de Vue antes de guardar en IndexedDB
  const plain = JSON.parse(JSON.stringify(factura))
  if (!plain.id) {
    plain.id = 'FAC-' + Date.now()
    plain.fechaCreacion = new Date().toISOString()
  }
  if (!plain.numero) {
    plain.numero = await getNextNumeroFactura()
  }
  plain.fechaModificacion = new Date().toISOString()
  await facturasStore.setItem(plain.id, plain)
  return plain
}

export async function deleteFactura(id) {
  await facturasStore.removeItem(id)
}

// ─── Clientes ────────────────────────────────────────────────────────────────

export async function loadClientes() {
  const clientes = []
  await clientesStore.iterate((value) => {
    clientes.push(value)
  })
  return clientes.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''))
}

export async function saveCliente(cliente) {
  const plain = JSON.parse(JSON.stringify(cliente))
  if (!plain.id) {
    plain.id = 'CLI-' + Date.now()
  }
  await clientesStore.setItem(plain.id, plain)
  return plain
}

export async function deleteCliente(id) {
  await clientesStore.removeItem(id)
}

// ─── Número correlativo ───────────────────────────────────────────────────────

export async function getNextNumeroFactura() {
  const config = (await facturasStore.getItem(CONFIG_KEY)) || { ultimoNumero: 0 }
  config.ultimoNumero += 1
  await facturasStore.setItem(CONFIG_KEY, config)
  const year = new Date().getFullYear()
  return `${year}-${String(config.ultimoNumero).padStart(4, '0')}`
}

// ─── Exportar / Importar backup ──────────────────────────────────────────────

export async function exportarBackupJSON() {
  const facturas = await getAllFacturas()
  const clientes = await loadClientes()
  const data = {
    exportadoEn: new Date().toISOString(),
    app: 'MyR Facturas v1.0',
    totalFacturas: facturas.length,
    facturas,
    clientes
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `myr-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importarBackupJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result)
        const facturas = data.facturas || []
        for (const f of facturas) {
          await facturasStore.setItem(f.id, f)
        }
        
        const clientes = data.clientes || []
        for (const c of clientes) {
          await clientesStore.setItem(c.id, c)
        }
        
        resolve({ facturas: facturas.length, clientes: clientes.length })
      } catch (err) {
        reject(err)
      }
    }
    reader.readAsText(file)
  })
}
