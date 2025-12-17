//
// import { createRouter, createWebHistory,} from 'vue-router';
// import type { RouteRecordRaw } from 'vue-router'; //类型导入
// import Overview from '@/views/OverView.vue'; //当前页面Overview组件
// import WorkflowEditor from '@/views/WorkflowEditor.vue'; // 新页面的组件
//
// const routes: RouteRecordRaw[] = [
//   {
//     path: '/',
//     name: 'Overview',
//     component: Overview,
//   },
//   {
//     path: '/workflow-editor',
//     name: 'WorkflowEditor',
//     component: WorkflowEditor,
//   },
// ];
//
// const router = createRouter({
//   history: createWebHistory(),
//   routes,
// });
//
// export default router;


import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from "@/layouts/MainLayout.vue";

const routes = [
  {
    path: '/',
    component: MainLayout,
    redirect: '/overview',
    children: [
      {
        path: 'overview',
        name: 'Overview',
        component: () => import('@/views/Overview.vue')
      },
      {
        path: '/workflow-editor',
        name: 'WorkflowEditor',
        component: () => import('@/views/WorkflowEditor.vue')
      }
    ]
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
