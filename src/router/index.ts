import { createRouter, createWebHashHistory } from 'vue-router'
import HeroSection from '../components/HeroSection.vue'
import ProjectsPage from '../components/ProjectPage.vue'

const routes = [
     { path: '/', component: HeroSection },
     { path: '/projects', component: ProjectsPage }
]

export default createRouter({
     history: createWebHashHistory(),
     routes
})
