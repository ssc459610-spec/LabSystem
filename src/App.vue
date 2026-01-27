<template>
  <div class="common-layout">
    <el-container>
      <el-aside
        width="220px"
        style="background-color: #545c64; min-height: 100vh"
      >
        <div
          style="
            height: 60px;
            line-height: 60px;
            text-align: center;
            color: white;
            font-weight: bold;
            background-color: #434a50;
          "
        >
          实验室管理系统
        </div>

        <el-menu
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
          :default-active="currentView"
        >
          <el-menu-item-group title="核心业务">
            <el-menu-item index="assets" @click="currentView = 'assets'">
              <el-icon><Monitor /></el-icon>
              <span>资产全生命周期</span>
            </el-menu-item>
            <el-menu-item index="loans" @click="currentView = 'loans'">
              <el-icon><List /></el-icon>
              <span>借用与归还</span>
            </el-menu-item>
          </el-menu-item-group>

          <el-menu-item-group title="系统维护">
            <el-menu-item index="stats" disabled>
              <el-icon><PieChart /></el-icon>
              <span>数据统计 (开发中)</span>
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
          <span>管理员：User</span>
        </el-header>

        <el-main>
          <AssetModule v-if="currentView === 'assets'" />
          <LoanModule v-if="currentView === 'loans'" />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Monitor, List, PieChart } from "@element-plus/icons-vue";

// 关键点3：这里引入了你刚才新建的那两个文件！
// 如果你没建这两个文件，这里就会报错，所以一定要确保 src/components 下有这两个文件
import AssetModule from "./components/AssetModule.vue";
import LoanModule from "./components/LoanModule.vue";

// 这个变量决定显示哪个页面，默认显示 assets
const currentView = ref("assets");
</script>

<style>
body {
  margin: 0;
  padding: 0;
}
</style>
