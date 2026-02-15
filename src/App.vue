<template>
  <div class="common-layout">
    <el-container class="layout-container">
      <el-aside width="240px" class="my-sidebar">
        <div class="system-title">
          <el-icon style="margin-right: 8px"><Monitor /></el-icon>
          <span>实验室管理系统</span>
        </div>

        <el-menu
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
          :default-active="activeMenu"
          router
          unique-opened
          style="border-right: none"
        >
          <el-sub-menu index="3-1">
            <template #title>
              <el-icon><Monitor /></el-icon>
              <span>资产与设备管理</span>
            </template>
            <el-menu-item index="/asset-info">设备基础信息库</el-menu-item>
            <el-menu-item index="/asset-entry">入库与台账管理</el-menu-item>
            <el-menu-item index="/asset-scrap">报废与处置管理</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="3-2">
            <template #title>
              <el-icon><List /></el-icon>
              <span>借用与归还管理</span>
            </template>
            <el-menu-item index="/borrow-application">借用申请</el-menu-item>
            <el-menu-item
              v-if="hasPermission(['teacher', 'admin', 'super_admin'])"
              index="/approval-management"
              >审批管理</el-menu-item
            >
            <el-menu-item
              v-if="hasPermission(['admin', 'super_admin'])"
              index="/borrow-return-operation"
              >借出与归还操作</el-menu-item
            >
            <el-menu-item
              v-if="hasPermission(['admin', 'super_admin'])"
              index="/extension-overdue-management"
              >延期与逾期管理</el-menu-item
            >
            <el-menu-item
              v-if="hasPermission(['admin', 'super_admin'])"
              index="/borrow-rule-config"
              >借用规则配置</el-menu-item
            >
          </el-sub-menu>

          <el-sub-menu index="3-3">
            <template #title>
              <el-icon><Tools /></el-icon>
              <span>维护与故障管理</span>
            </template>
            <el-menu-item index="/fault-report">故障报修与接单</el-menu-item>
            <el-menu-item index="/maintenance-log">维护日志与追踪</el-menu-item>
            <el-menu-item index="/inspection">定期巡检与整改</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="3-4">
            <template #title>
              <el-icon><Box /></el-icon>
              <span>库存与耗材管理</span>
            </template>
            <el-menu-item index="/consumable-stock">耗材库存监控</el-menu-item>
            <el-menu-item index="/consumable-procurement"
              >采购申请与入库</el-menu-item
            >
            <el-menu-item index="/consumable-claim"
              >领用与以旧换新</el-menu-item
            >
            <el-menu-item index="/stock-check">库存盘点管理</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="3-5">
            <template #title>
              <el-icon><PieChart /></el-icon>
              <span>统计分析与决策</span>
            </template>
            <el-menu-item index="/stats-dashboard">可视化驾驶舱</el-menu-item>
            <el-menu-item index="/stats-usage">资源使用率分析</el-menu-item>
            <el-menu-item index="/stats-cost">成本效益分析</el-menu-item>
            <el-menu-item index="/stats-fault">故障与易损分析</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="3-6">
            <template #title>
              <el-icon><Lock /></el-icon>
              <span>系统安全与维护</span>
            </template>
            <el-menu-item index="/user-permission">用户与权限管理</el-menu-item>
            <el-menu-item index="/audit-log">操作审计日志</el-menu-item>
            <el-menu-item index="/notification-config"
              >消息通知配置</el-menu-item
            >
          </el-sub-menu>

          <el-sub-menu index="3-7">
            <template #title>
              <el-icon><Connection /></el-icon>
              <span>远程控制模块</span>
            </template>
            <el-menu-item index="/device-monitor"
              >设备运行状态监控</el-menu-item
            >
            <el-menu-item index="/remote-console">远程操作控制台</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>

      <el-container class="is-vertical">
        <el-header class="my-header">
          <div class="header-left"></div>
          <div class="header-right">
            <el-dropdown @command="handleCommand">
              <span class="user-info">
                <el-avatar
                  :size="28"
                  src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
                  style="margin-right: 8px"
                />
                <span style="color: #333; font-size: 14px"
                  >{{ userName }} ({{ userRole }})</span
                >
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile"
                    >个人信息</el-dropdown-item
                  >
                  <el-dropdown-item command="password"
                    >修改密码</el-dropdown-item
                  >
                  <el-dropdown-item divided command="logout"
                    >退出登录</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <el-main class="my-main">
          <router-view></router-view>
        </el-main>

        <el-footer
          height="30px"
          style="
            text-align: center;
            color: #999;
            font-size: 12px;
            line-height: 30px;
            background-color: #f0f2f5;
          "
        >
          © 2026 实验室管理系统
        </el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "./store/store";
import { ElMessage, ElMessageBox } from "element-plus";
// 引入所有图标
import {
  Monitor,
  Box,
  Document,
  CircleCheck,
  Operation,
  Bell,
  Setting,
  ArrowDown,
  PieChart,
  Connection,
  Tools,
  List,
  Lock,
} from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const activeMenu = computed(() => route.path);
const userName = ref("队长");
const userRole = ref("admin");

const hasPermission = (roles) => {
  if (!userRole.value) return false;
  return roles.includes(userRole.value);
};

const handleCommand = (command) => {
  if (command === "logout") {
    ElMessageBox.confirm("确定要退出登录吗？", "提示", {
      type: "warning",
    }).then(() => {
      userStore.logout();
      router.push("/login");
      ElMessage.success("已退出登录");
    });
  } else {
    ElMessage.info("功能开发中");
  }
};
</script>

<style>
/* 全局样式 */
body {
  margin: 0;
  padding: 0;
  height: 100vh;
  overflow: hidden;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
}
.common-layout,
.layout-container {
  height: 100vh;
  width: 100%;
}

/* 侧边栏 */
.my-sidebar {
  background-color: #545c64;
  height: 100vh;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}
.system-title {
  height: 64px;
  line-height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 16px;
  background-color: #434a50;
  flex-shrink: 0;
}

/* 头部 */
.my-header {
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  flex-shrink: 0;
}
.user-info {
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 5px;
  border-radius: 4px;
}
.user-info:hover {
  background-color: #f5f5f5;
}

/* 主内容 */
.is-vertical {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}
.my-main {
  flex: 1;
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
  box-sizing: border-box;
}
</style>
