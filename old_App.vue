<template>
  <div class="common-layout">
    <el-container>
      <el-aside
        width="220px"
        style="background-color: #545c64; min-height: 100vh"
      >
        <div
          style="
            height: 64px;
            line-height: 64px;
            text-align: center;
            color: white;
            font-weight: bold;
            font-size: 18px;
            background-color: #434a50;
          "
        >
          🖥️ 实验室管理系统
        </div>

        <el-menu
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
          :default-active="activeMenu"
          router
        >
          <el-menu-item-group title="资产与库存">
            <el-menu-item index="/assets">
              <el-icon><Monitor /></el-icon>
              <span>资产全生命周期</span>
            </el-menu-item>

            <el-menu-item index="stock" @click="showMsg('耗材库存管理')">
              <el-icon><Box /></el-icon>
              <span>耗材与库存管理</span>
            </el-menu-item>
          </el-menu-item-group>

          <el-menu-item-group title="核心业务">
            <el-sub-menu index="loans-group">
              <template #title>
                <el-icon><List /></el-icon>
                <span>借用与归还</span>
              </template>

              <el-menu-item index="/borrow-application">借用申请</el-menu-item>
              <el-menu-item index="/borrow-return-operation"
                >归还操作</el-menu-item
              >
              <el-menu-item index="/approval-management">审批管理</el-menu-item>
            </el-sub-menu>

            <el-menu-item index="faults" @click="showMsg('故障报修管理')">
              <el-icon><Tools /></el-icon>
              <span>故障与运维</span>
            </el-menu-item>
          </el-menu-item-group>

          <el-menu-item-group title="决策与监控">
            <el-menu-item index="stats" @click="showMsg('统计分析驾驶舱')">
              <el-icon><PieChart /></el-icon>
              <span>数据统计分析</span>
            </el-menu-item>
            <el-menu-item index="remote" @click="showMsg('远程控制中心')">
              <el-icon><Connection /></el-icon>
              <span>远程控制中心</span>
            </el-menu-item>
          </el-menu-item-group>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header
          style="
            text-align: right;
            font-size: 12px;
            border-bottom: 1px solid #eee;
            line-height: 60px;
          "
        >
          <span>管理员：队长</span>
        </el-header>

        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router"; // 引入路由工具
import {
  Monitor,
  List,
  PieChart,
  Box,
  Tools,
  Connection,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

// 不再需要手动引入组件了，Router 会自动处理
// import AssetModule from "./components/AssetModule.vue";
// import LoanModule from "./components/LoanModule.vue";

const route = useRoute();
const router = useRouter();

// 让菜单高亮跟随当前网址变动
const activeMenu = computed(() => route.path);

const showMsg = (name) => {
  ElMessage.warning(`【${name}】模块在二期开发计划中`);
};
</script>

<style>
body {
  margin: 0;
  padding: 0;
}
/* 你的样式保持不变 */
</style>
