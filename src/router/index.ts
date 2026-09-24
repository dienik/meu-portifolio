import { createRouter, createWebHashHistory } from 'vue-router'
import HeroSection from '../components/HeroSection.vue'
import ProjectsPage from '../components/ProjectPage.vue'
import RegistrationDashboard from '../components/dashboard/RegistrationDashboard.vue'
import MapStudio from '../components/map/MapStudio.vue'
import WktCompareStudio from '../components/map/WktCompareStudio.vue'
import RainMapStudio from '../components/map/RainMapStudio.vue'
import RetrieveStudio from '../components/agent/RetrieveStudio.vue'

const routes = [
  { path: '/', name: 'home', component: HeroSection },
  { path: '/projects', name: 'design-system', component: ProjectsPage },
  { path: '/dashboard', name: 'dashboard', component: RegistrationDashboard },
  { path: '/mapa', name: 'mapa', component: MapStudio },
  { path: '/comparar', name: 'comparar', component: WktCompareStudio },
  { path: '/chuva', name: 'chuva', component: RainMapStudio },
  { path: '/rag', name: 'rag', component: RetrieveStudio },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})
