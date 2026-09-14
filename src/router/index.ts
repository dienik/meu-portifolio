import { createRouter, createWebHashHistory } from 'vue-router'
import HeroSection from '../components/HeroSection.vue'
import ProjectsPage from '../components/ProjectPage.vue'
import RegistrationDashboard from '../components/dashboard/RegistrationDashboard.vue'
import MapStudio from '../components/map/MapStudio.vue'
import RainMapStudio from '../components/map/RainMapStudio.vue'

const routes = [
  { path: '/', name: 'home', component: HeroSection },
  { path: '/projects', name: 'design-system', component: ProjectsPage },
  { path: '/dashboard', name: 'dashboard', component: RegistrationDashboard },
  { path: '/mapa', name: 'mapa', component: MapStudio },
  { path: '/chuva', name: 'chuva', component: RainMapStudio },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})
