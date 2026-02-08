// src/mock/data.js
import { reactive } from "vue";

// 1. 资产数据（完全对应设计文档 3.1 章节）
export const assetData = reactive([
  {
    id: "ZC001",
    name: "高性能服务器",
    model: "Dell PowerEdge R750", // ✨ 新增：型号
    type: "服务器",
    price: 25800, // ✨ 新增：价格
    supplier: "戴尔官方旗舰店", // ✨ 新增：供应商
    date: "2025-01-10", // ✨ 新增：采购日期
    status: "在库",
  },
  {
    id: "ZC002",
    name: "VR头显 Quest3",
    model: "Meta Quest 3 128G",
    type: "VR设备",
    price: 3999,
    supplier: "亚马逊直营",
    date: "2025-02-15",
    status: "借出",
  },
  {
    id: "ZC003",
    name: "MacBook Pro",
    model: "M3 Max 16寸",
    type: "笔记本",
    price: 24999,
    supplier: "苹果官网",
    date: "2024-11-20",
    status: "维修中",
  },
]);

// 2. 借用记录
export const loanData = reactive([
  {
    id: 1,
    deviceName: "VR头显 Quest3",
    borrower: "张三",
    date: "2025-02-20",
    status: "未归还",
  },
]);
