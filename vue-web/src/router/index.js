import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import MinersView from '../views/MinersView.vue';
import MinerDetailView from '../views/MinerDetailView.vue';
import BlocksView from '../views/BlocksView.vue';
import PaymentsView from '../views/PaymentsView.vue';
import ConnectView from '../views/ConnectView.vue';
import CalculatorView from '../views/CalculatorView.vue';
import FaqView from '../views/FaqView.vue';

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/miners', name: 'miners', component: MinersView },
  { path: '/miner/:address', name: 'miner-detail', component: MinerDetailView },
  { path: '/account/:address', redirect: to => `/miner/${to.params.address}` },
  { path: '/blocks', name: 'blocks', component: BlocksView },
  { path: '/payments', name: 'payments', component: PaymentsView },
  { path: '/connect', name: 'connect', component: ConnectView },
  { path: '/calculator', name: 'calculator', component: CalculatorView },
  { path: '/faq', name: 'faq', component: FaqView },
  { path: '/:pathMatch(.*)*', redirect: '/' }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

export default router;
