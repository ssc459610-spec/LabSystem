<template>
  <div class="asset-container">
    <el-card class="box-card" shadow="never">
      <div class="operation-bar">
        <div class="left-panel">
          <el-button type="primary" :icon="Plus" @click="goToAddEntry"
            >新增入库</el-button
          >
          <el-button type="success" :icon="Upload" @click="handleImport"
            >批量导入</el-button
          >
          <el-button type="warning" :icon="Download" @click="handleExport"
            >导出台账</el-button
          >
        </div>

        <div class="right-panel">
          <el-select
            v-model="statusFilter"
            placeholder="按状态筛选"
            style="width: 140px; margin-right: 10px"
            clearable
          >
            <el-option label="可借用" value="可借用" />
            <el-option label="已借用" value="已借用" />
            <el-option label="维修中" value="维修中" />
            <el-option label="待报废" value="待报废" />
          </el-select>

          <el-input
            v-model="searchQuery"
            placeholder="搜索设备名称/资产编号"
            style="width: 250px"
            :prefix-icon="Search"
            clearable
          />
        </div>
      </div>
    </el-card>

    <el-card class="table-card" shadow="hover">
      <el-table
        :data="filteredData"
        style="width: 100%"
        stripe
        border
        height="calc(100vh - 240px)"
      >
        <el-table-column
          prop="assetNo"
          label="资产编号"
          width="140"
          fixed
          sortable
        />

        <el-table-column
          prop="name"
          label="设备名称"
          min-width="160"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span style="font-weight: bold; color: #409eff">{{
              row.name
            }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="type" label="类型" width="100" />
        <el-table-column
          prop="lab"
          label="所属实验室/分区"
          width="160"
          show-overflow-tooltip
        />
        <el-table-column prop="rack" label="机架/位置" width="100" />

        <el-table-column prop="price" label="采购价格" width="120" sortable>
          <template #default="{ row }"
            >¥ {{ row.price.toLocaleString() }}</template
          >
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag
              :type="getStatusType(row.status)"
              effect="dark"
              size="small"
              >{{ row.status }}</el-tag
            >
          </template>
        </el-table-column>

        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)"
              >详情档案</el-button
            >
            <el-button
              link
              type="primary"
              size="small"
              @click="handlePrint(row)"
              >打印标签</el-button
            >
            <el-button link type="warning" size="small" @click="handleEdit(row)"
              >编辑</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-area">
        <el-pagination
          background
          layout="prev, pager, next, total"
          :total="4"
        />
      </div>
    </el-card>

    <el-drawer v-model="drawerVisible" title="设备详细档案" size="40%">
      <div v-if="currentDevice">
        <el-descriptions title="基础信息" :column="2" border>
          <el-descriptions-item label="资产编号">{{
            currentDevice.assetNo
          }}</el-descriptions-item>
          <el-descriptions-item label="设备名称">{{
            currentDevice.name
          }}</el-descriptions-item>
          <el-descriptions-item label="所属分类">
            <el-tag size="small">{{ currentDevice.type }}</el-tag>
            <el-tag size="small" type="info" style="margin-left: 5px">{{
              currentDevice.usage
            }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="当前状态">
            <el-tag :type="getStatusType(currentDevice.status)" size="small">{{
              currentDevice.status
            }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="物理位置"
            >{{ currentDevice.lab }} -
            {{ currentDevice.rack }}</el-descriptions-item
          >
          <el-descriptions-item label="采购金额"
            >¥ {{ currentDevice.price.toLocaleString() }}</el-descriptions-item
          >
          <el-descriptions-item label="供应商">{{
            currentDevice.supplier
          }}</el-descriptions-item>
          <el-descriptions-item label="保修期限">{{
            currentDevice.warranty
          }}</el-descriptions-item>
        </el-descriptions>

        <div style="margin: 20px 0"></div>

        <el-descriptions title="硬件配置 / 扩展属性" :column="1" border>
          <template v-if="currentDevice.type === '服务器'">
            <el-descriptions-item label="CPU 型号"
              >双路 Intel Xeon Gold 6330 (56核)</el-descriptions-item
            >
            <el-descriptions-item label="内存容量"
              >256GB DDR4 ECC</el-descriptions-item
            >
            <el-descriptions-item label="GPU 配置"
              >NVIDIA RTX A6000 48GB x 2</el-descriptions-item
            >
            <el-descriptions-item label="操作系统"
              >Ubuntu 22.04 LTS (预装 CUDA 11.8)</el-descriptions-item
            >
          </template>

          <template v-else-if="currentDevice.type === 'VR设备'">
            <el-descriptions-item label="屏幕分辨率"
              >单眼 2064 x 2208 (4K+)</el-descriptions-item
            >
            <el-descriptions-item label="传感器"
              >6DoF Inside-out 追踪</el-descriptions-item
            >
            <el-descriptions-item label="配套附件"
              >Touch Plus 手柄 x 2, 充电坞</el-descriptions-item
            >
          </template>

          <template v-else>
            <el-descriptions-item label="详细规格"
              >标准配置，无特殊扩展属性</el-descriptions-item
            >
            <el-descriptions-item label="配套软件">无</el-descriptions-item>
          </template>
        </el-descriptions>
      </div>
    </el-drawer>

    <el-dialog v-model="qrVisible" title="设备资产标签" width="350px" center>
      <div v-if="currentDevice" style="text-align: center">
        <h3 style="margin-bottom: 5px">{{ currentDevice.name }}</h3>
        <p style="color: #666; font-size: 12px; margin-bottom: 20px">
          NO. {{ currentDevice.assetNo }}
        </p>

        <img
          :src="`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=Device:${currentDevice.assetNo}`"
          alt="QR Code"
          style="border: 1px solid #eee; padding: 10px; border-radius: 8px"
        />

        <p style="color: #999; font-size: 12px; margin-top: 20px">
          提示：手机扫码可直接报修或申请借用
        </p>
      </div>
      <template #footer>
        <el-button @click="qrVisible = false">关闭</el-button>
        <el-button type="primary" :icon="Printer" @click="doPrint"
          >连接打印机</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import {
  Search,
  Plus,
  Download,
  Upload,
  Printer,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const router = useRouter(); // 引入路由工具

// --- 基础数据 ---
const tableData = ref([
  {
    id: 1,
    assetNo: "ASSET-2024001",
    name: "示波器 DSO-X 3024A",
    type: "仪表仪器",
    usage: "科研专用",
    lab: "AI实验室(302)",
    rack: "A-01-03",
    price: 12500,
    purchaseDate: "2023-05-12",
    status: "可借用",
    supplier: "是德科技",
    warranty: "2026-05-12",
  },
  {
    id: 2,
    assetNo: "ASSET-2024002",
    name: "高性能服务器 R750",
    type: "服务器",
    usage: "通用共享",
    lab: "云计算服务器区",
    rack: "S-05-01",
    price: 45000,
    purchaseDate: "2023-08-20",
    status: "已借用",
    supplier: "戴尔中国",
    warranty: "2026-08-20",
  },
  {
    id: 3,
    assetNo: "ASSET-2024003",
    name: "VR头显 Quest 3",
    type: "VR设备",
    usage: "教学专用",
    lab: "VR教学区",
    rack: "V-02-12",
    price: 3500,
    purchaseDate: "2024-01-10",
    status: "维修中",
    supplier: "Meta代理",
    warranty: "2025-01-10",
  },
  {
    id: 4,
    assetNo: "ASSET-2024004",
    name: "3D打印机",
    type: "外设",
    usage: "竞赛专用",
    lab: "创新实验室",
    rack: "B-03-01",
    price: 8900,
    purchaseDate: "2022-11-05",
    status: "待报废",
    supplier: "创想三维",
    warranty: "2023-11-05",
  },
]);

const searchQuery = ref("");
const statusFilter = ref("");

// --- 状态与过滤逻辑 ---
const getStatusType = (status) => {
  const map = {
    可借用: "success",
    已借用: "primary",
    维修中: "warning",
    待报废: "danger",
    报废: "info",
  };
  return map[status] || "info";
};

const filteredData = computed(() => {
  return tableData.value.filter((item) => {
    const matchQuery =
      item.name.includes(searchQuery.value) ||
      item.assetNo.includes(searchQuery.value);
    const matchStatus = statusFilter.value
      ? item.status === statusFilter.value
      : true;
    return matchQuery && matchStatus;
  });
});

// --- 🔴 交互逻辑实现 ---

// 1. 顶部按钮逻辑
const goToAddEntry = () => {
  // 点击新增，直接路由跳转到“入库台账”页面！
  router.push("/asset-entry");
};

const handleImport = () => {
  ElMessage.warning("请先下载标准 Excel 导入模板！");
};

const handleExport = () => {
  ElMessage.success("正在导出《实验室资产明细台账.xlsx》...");
};

// 2. 抽屉逻辑 (详细档案)
const drawerVisible = ref(false);
const currentDevice = ref(null);

const handleView = (row) => {
  currentDevice.value = row;
  drawerVisible.value = true; // 弹开抽屉
};

// 3. 二维码弹窗逻辑
const qrVisible = ref(false);

const handlePrint = (row) => {
  currentDevice.value = row;
  qrVisible.value = true; // 弹开二维码
};

const doPrint = () => {
  ElMessage.success(
    `已发送至标签打印机，正在打印 [${currentDevice.value.assetNo}]`,
  );
  qrVisible.value = false;
};

const handleEdit = (row) => {
  ElMessage.info("编辑功能开发中...");
};
</script>

<style scoped>
.mb-20 {
  margin-bottom: 20px;
}
.operation-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.pagination-area {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
