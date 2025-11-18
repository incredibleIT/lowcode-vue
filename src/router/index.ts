
import { createRouter, createWebHistory,} from 'vue-router';
import type { RouteRecordRaw } from 'vue-router'; //类型导入
import Overview from '@/views/Overview.vue'; //当前页面Overview组件
import WorkflowEditor from '@/views/WorkflowEditor.vue'; // 新页面的组件

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Overview',
    component: Overview,
  },
  {
    path: '/workflow-editor',
    name: 'WorkflowEditor',
    component: WorkflowEditor,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;