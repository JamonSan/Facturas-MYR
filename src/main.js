import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import EditorView from './views/EditorView.vue'
import HistorialView from './views/HistorialView.vue'
import ClientesView from './views/ClientesView.vue'
import './style.css'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/editor' },
    { path: '/editor', component: EditorView, name: 'editor' },
    { path: '/editor/:id', component: EditorView, name: 'editar' },
    { path: '/historial', component: HistorialView, name: 'historial' },
    { path: '/clientes', component: ClientesView, name: 'clientes' },
  ]
})

const app = createApp(App)
app.use(router)
app.mount('#app')
