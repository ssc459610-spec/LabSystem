<template>
  <div id="app">
    <el-container class="layout-container">
      <!-- 侧边栏 -->
      <el-aside width="250px" class="sidebar">
        <div class="logo">
          <h2>设备借用管理系统</h2>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical"
          router
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <el-menu-item index="/borrow-application">
            <el-icon><Document /></el-icon>
            <span>借用申请</span>
          </el-menu-item>
          
          <el-menu-item 
            v-if="hasPermission(['teacher', 'admin', 'super_admin'])" 
            index="/approval-management"
          >
            <el-icon><CircleCheck /></el-icon>
            <span>审批管理</span>
          </el-menu-item>
          
          <el-menu-item 
            v-if="hasPermission(['admin', 'super_admin'])" 
            index="/borrow-return-operation"
          >
            <el-icon><Operation /></el-icon>
            <span>借出归还操作</span>
          </el-menu-item>
          
          <el-menu-item 
            v-if="hasPermission(['admin', 'super_admin'])" 
            index="/extension-overdue-management"
          >
            <el-icon><Bell /></el-icon>
            <span>延期与逾期管理</span>
          </el-menu-item>
          
          <el-menu-item 
            v-if="hasPermission(['admin', 'super_admin'])" 
            index="/borrow-rule-config"
          >
            <el-icon><Setting /></el-icon>
            <span>借用规则配置</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-container>
        <!-- 顶部导航 -->
        <el-header class="header">
          <div class="header-left">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item>{{ currentPageTitle }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="header-right">
            <el-dropdown @command="handleCommand">
              <span class="user-dropdown">
                <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
                <span class="user-name">{{ userName }}</span>
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                  <el-dropdown-item command="password">修改密码</el-dropdown-item>
                  <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <!-- 主内容 -->
        <el-main class="main-content">
          <router-view />
        </el-main>

        <!-- 底部 -->
        <el-footer class="footer">
          <div class="footer-content">
            <span>© 2024 设备借用管理系统 - All Rights Reserved</span>
          </div>
        </el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from './store/store'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document,
  CircleCheck,
  Operation,
  Bell,
  Setting,
  ArrowDown
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 当前页面标题
const currentPageTitle = computed(() => route.meta.title || '首页')

// 用户名称（从store获取，这里先用模拟数据）
const userName = ref('张老师')
const userRole = ref('admin') // 从store获取用户角色

// 权限检查
const hasPermission = (roles) => {
  return roles.includes(userRole.value)
}

// 处理用户下拉菜单命令
const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      ElMessage.info('个人信息功能开发中')
      break
    case 'password':
      ElMessage.info('修改密码功能开发中')
      break
    case 'logout':
      handleLogout()
      break
  }
}

// 处理退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 清除用户信息
    userStore.logout()
    // 跳转到登录页
    router.push('/login')
    ElMessage.success('已退出登录')
  })
}

// 监听路由变化
watch(
  () => route.path,
  () => {
    // 可以在这里处理路由变化时的逻辑
  }
)
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  overflow-x: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2b3a4b;
}

.logo h2 {
  color: #fff;
  font-size: 18px;
  margin: 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  padding: 0 20px;
}

.header-left {
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 10px;
}

.user-name {
  margin: 0 8px;
  font-size: 14px;
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}

.footer {
  background-color: #fff;
  box-shadow: 0 -1px 4px rgba(0, 21, 41, 0.08);
  height: 50px !important;
  line-height: 50px;
  padding: 0 20px;
}

.footer-content {
  text-align: center;
  color: #999;
  font-size: 14px;
}

/* 菜单样式 */
.el-menu-vertical:not(.el-menu--collapse) {
  width: 250px;
  border-right: none;
}

.el-menu-item {
  height: 50px;
  line-height: 50px;
}

.el-menu-item:hover {
  background-color: #263445 !important;
}

.el-menu-item.is-active {
  background-color: #001528 !important;
}
</style>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

#app {
  height: 100vh;
  overflow: hidden;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
