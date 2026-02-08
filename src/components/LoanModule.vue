<template>
  <div>
    <h2>📖 借用与归还登记</h2>
    <el-card style="margin-bottom: 20px">
      <span>申请借用：</span>
      <el-input
        v-model="borrowerName"
        placeholder="借用人姓名"
        style="width: 150px; margin: 0 10px"
      />
      <el-button type="primary" @click="handleBorrow">提交申请</el-button>
    </el-card>

    <el-table :data="loanData" border>
      <el-table-column prop="date" label="日期" width="150" />
      <el-table-column prop="borrower" label="借用人" />
      <el-table-column prop="deviceName" label="借用设备" />
      <el-table-column prop="status" label="状态" />
    </el-table>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { loanData } from "../mock/data.js";

const borrowerName = ref("");

const handleBorrow = () => {
  if (!borrowerName.value) return alert("请填写姓名");
  loanData.unshift({
    id: Date.now(),
    date: new Date().toLocaleDateString(),
    borrower: borrowerName.value,
    deviceName: "随机测试设备", // 简化演示
    status: "未归还",
  });
  borrowerName.value = "";
};
</script>
