<template>
  <div class="entry-container">
    <el-row :gutter="20" class="mb-20">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>本月入库总额</template>
          <div class="stat-value">¥ 125,000</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <template #header>本月新增设备</template>
          <div class="stat-value">12 台</div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" class="action-card">
          <div
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
            "
          >
            <div>
              <h3>📝 新设备入库</h3>
              <p style="color: #999; font-size: 13px">
                采购验收完成后，请在此处录入设备信息
              </p>
            </div>
            <el-button
              type="primary"
              size="large"
              @click="dialogVisible = true"
            >
              <el-icon class="el-icon--left"><Plus /></el-icon>发起入库
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>入库流水账 (台账)</span>
          <el-button link type="primary">导出Excel</el-button>
        </div>
      </template>

      <el-table :data="entryList" stripe style="width: 100%">
        <el-table-column prop="batchNo" label="入库单号" width="160" />
        <el-table-column
          prop="entryDate"
          label="入库日期"
          width="120"
          sortable
        />
        <el-table-column prop="assetName" label="设备名称" width="180" />
        <el-table-column prop="model" label="型号规格" width="150" />
        <el-table-column prop="supplier" label="供应商" width="150" />
        <el-table-column prop="price" label="单价" width="120">
          <template #default="{ row }">¥ {{ row.price }}</template>
        </el-table-column>
        <el-table-column prop="handler" label="验收人" width="100">
          <template #default>
            <el-tag size="small" effect="plain">队长</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default>
            <el-tag type="success">已入库</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="新设备入库登记" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="设备名称" required>
          <el-input v-model="form.name" placeholder="例如：高性能服务器 R750" />
        </el-form-item>

        <el-row>
          <el-col :span="12">
            <el-form-item label="设备类型">
              <el-select v-model="form.type" placeholder="请选择">
                <el-option label="服务器" value="server" />
                <el-option label="PC" value="pc" />
                <el-option label="VR设备" value="vr" />
                <el-option label="外设" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="采购日期">
              <el-date-picker
                v-model="form.date"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="供应商">
          <el-input v-model="form.supplier" placeholder="填写供应商名称" />
        </el-form-item>

        <el-form-item label="存放位置">
          <el-input
            v-model="form.location"
            placeholder="例如：AI实验室(302) - 机架A01"
          />
        </el-form-item>

        <el-form-item label="入库备注">
          <el-input v-model="form.remark" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm">确认入库</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Plus } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const dialogVisible = ref(false);

// 模拟台账数据
const entryList = ref([
  {
    batchNo: "IN-20240201-01",
    entryDate: "2024-02-01",
    assetName: "深度学习工作站",
    model: "RTX 4090版",
    supplier: "英伟达代理",
    price: 45000,
  },
  {
    batchNo: "IN-20240203-02",
    entryDate: "2024-02-03",
    assetName: "VR头显 Quest 3",
    model: "128G",
    supplier: "Meta",
    price: 3500,
  },
  {
    batchNo: "IN-20240205-03",
    entryDate: "2024-02-05",
    assetName: "3D打印机",
    model: "K1 Max",
    supplier: "创想三维",
    price: 4200,
  },
]);

const form = ref({
  name: "",
  type: "",
  date: "",
  supplier: "",
  location: "",
  remark: "",
});

const handleConfirm = () => {
  ElMessage.success("入库成功！已自动生成资产编号并同步至基础库。");
  dialogVisible.value = false;
  // 这里以后接后端API
};
</script>

<style scoped>
.mb-20 {
  margin-bottom: 20px;
}
.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-top: 10px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.action-card {
  background-color: #f0f9eb;
  border: 1px solid #e1f3d8;
}
</style>
