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
          default-active="1"
        >
          <el-menu-item-group title="核心业务">
            <el-menu-item index="1">
              <el-icon><Monitor /></el-icon>
              <span>资产全生命周期</span>
            </el-menu-item>
            <el-menu-item index="2">
              <el-icon><List /></el-icon>
              <span>借用与归还</span>
            </el-menu-item>
          </el-menu-item-group>

          <el-menu-item-group title="系统维护">
            <el-menu-item index="3" disabled>
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
          <el-empty description="请点击左侧菜单选择功能" />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { Monitor, List, PieChart } from "@element-plus/icons-vue";
</script>

<style>
body {
  margin: 0;
  padding: 0;
}
</style>
