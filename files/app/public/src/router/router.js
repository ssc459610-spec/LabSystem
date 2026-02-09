import { createRouter, createWebHistory } from 'vue-router'

// 导入组件
import BorrowRuleConfig from '../views/BorrowRuleConfig.vue'
import BorrowApplication from '../views/BorrowApplication.vue'
import ApprovalManagement from '../views/ApprovalManagement.vue'
import BorrowReturnOperation from '../views/BorrowReturnOperation.vue'
import ExtensionOverdueManagement from '../views/ExtensionOverdueManagement.vue'

const routes = [
  {
    path: '/',
    redirect: '/borrow-application'
  },
  {
    path: '/borrow-rule-config',
    name: 'BorrowRuleConfig',
    component: BorrowRuleConfig,
    meta: {
      title: '借用规则配置',
      requiresAuth: true,
      roles: ['admin', 'super_admin']
    }
  },
  {
    path: '/borrow-application',
    name: 'BorrowApplication',
    component: BorrowApplication,
    meta: {
      title: '借用申请',
      requiresAuth: true,
      roles: ['student', 'teacher', 'admin']
    }
  },
  {
    path: '/approval-management',
    name: 'ApprovalManagement',
    component: ApprovalManagement,
    meta: {
      title: '审批管理',
      requiresAuth: true,
      roles: ['teacher', 'admin', 'super_admin']
    }
  },
  {
    path: '/borrow-return-operation',
    name: 'BorrowReturnOperation',
    component: BorrowReturnOperation,
    meta: {
      title: '借出归还操作',
      requiresAuth: true,
      roles: ['admin', 'super_admin']
    }
  },
  {
    path: '/extension-overdue-management',
    name: 'ExtensionOverdueManagement',
    component: ExtensionOverdueManagement,
    meta: {
      title: '延期与逾期管理',
      requiresAuth: true,
      roles: ['admin', 'super_admin']
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 设备借用管理系统`
  }

  // 权限验证（这里需要根据实际情况实现）
  if (to.meta.requiresAuth) {
    // 检查用户是否登录
    const isLoggedIn = true // 实际应该从store或localStorage中获取
    
    if (!isLoggedIn) {
      next('/login')
      return
    }

    // 检查用户角色
    if (to.meta.roles) {
      const userRole = 'admin' // 实际应该从store或localStorage中获取
      if (!to.meta.roles.includes(userRole)) {
        next('/unauthorized')
        return
      }
    }
  }

  next()
})

export default router
