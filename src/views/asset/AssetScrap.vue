<template>
  <div class="scrap-container">
    <el-card shadow="never" class="mb-20">
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
        "
      >
        <div>
          <h3 style="margin: 0; color: #f56c6c">
            <el-icon><Warning /></el-icon> 资产报废与处置中心
          </h3>
          <p style="color: #999; font-size: 13px; margin-top: 5px">
            管理达到使用年限、无法修复或维修成本过高的设备
          </p>
        </div>
        <div>
          <el-button type="danger" :icon="Delete" @click="dialogVisible = true"
            >发起报废申请</el-button
          >
        </div>
      </div>
    </el-card>

    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span style="font-weight: bold">历史报废台账</span>
          <el-input
            v-model="searchQuery"
            placeholder="搜索资产编号/设备名称"
            style="width: 250px"
            :prefix-icon="Search"
            clearable
          />
        </div>
      </template>

      <el-table :data="filteredScrapList" stripe style="width: 100%" border>
        <el-table-column prop="assetNo" label="资产编号" width="140" />
        <el-table-column prop="name" label="设备名称" width="160" />

        <el-table-column prop="reason" label="报废原因" width="180">
          <template #default="{ row }">
            <el-tag type="warning" effect="plain">{{ row.reason }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="method" label="处置方式" width="120">
          <template #default="{ row }">
            <el-tag type="info">{{ row.method }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="applyUser" label="申请人" width="100" />
        <el-table-column
          prop="scrapDate"
          label="处置时间"
          width="120"
          sortable
        />

        <el-table-column prop="auditor" label="终审人(超管)" width="120" />

        <el-table-column label="状态" width="100" fixed="right">
          <template #default>
            <el-tag type="danger" effect="dark">已处置</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="发起设备报废申请" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="关联资产" required>
          <el-select
            v-model="form.asset"
            placeholder="请选择需要报废的设备"
            style="width: 100%"
          >
            <el-option label="ASSET-2024004 - 3D打印机" value="1" />
            <el-option label="ASSET-2021089 - 旧版路由器" value="2" />
          </el-select>
        </el-form-item>

        <el-form-item label="报废原因" required>
          <el-select
            v-model="form.reason"
            placeholder="选择触发条件"
            style="width: 100%"
          >
            <el-option label="达到使用年限" value="age" />
            <el-option label="无法修复(彻底损坏)" value="broken" />
            <el-option label="维修成本超过净值30%" value="cost" />
          </el-select>
        </el-form-item>

        <el-form-item label="建议处置">
          <el-select
            v-model="form.method"
            placeholder="选择后续处理方式"
            style="width: 100%"
          >
            <el-option label="回收拆解" value="m1" />
            <el-option label="公益捐赠" value="m2" />
            <el-option label="环保销毁" value="m3" />
            <el-option label="二手处置" value="m4" />
          </el-select>
        </el-form-item>

        <el-form-item label="检测报告">
          <el-upload action="#" :limit="1">
            <el-button size="small" type="primary">点击上传附件</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="danger" @click="handleConfirm">提交审核</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { Delete, Warning, Search } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const dialogVisible = ref(false);
const searchQuery = ref("");

// 模拟报废台账数据
const scrapList = ref([
  {
    assetNo: "ASSET-2019012",
    name: "旧一代服务器",
    reason: "达到使用年限",
    method: "二手处置",
    applyUser: "李老师",
    scrapDate: "2023-11-20",
    auditor: "王院长",
  },
  {
    assetNo: "ASSET-2020055",
    name: "破损实验箱",
    reason: "无法修复(彻底损坏)",
    method: "环保销毁",
    applyUser: "张管理员",
    scrapDate: "2024-01-15",
    auditor: "王院长",
  },
  {
    assetNo: "ASSET-2022103",
    name: "进水交换机",
    reason: "维修成本超过净值30%",
    method: "回收拆解",
    applyUser: "维修工老赵",
    scrapDate: "2024-02-08",
    auditor: "王院长",
  },
]);

const filteredScrapList = computed(() => {
  return scrapList.value.filter(
    (item) =>
      item.name.includes(searchQuery.value) ||
      item.assetNo.includes(searchQuery.value),
  );
});

const form = ref({ asset: "", reason: "", method: "" });

const handleConfirm = () => {
  ElMessage.success("报废申请已提交，等待实验室主任及超管审核！");
  dialogVisible.value = false;
};
</script>

<style scoped>
.mb-20 {
  margin-bottom: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
