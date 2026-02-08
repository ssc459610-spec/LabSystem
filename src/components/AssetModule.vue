<template>
  <div>
    <h2>🖥️ 资产全生命周期管理</h2>

    <div style="margin-bottom: 20px; display: flex; gap: 10px">
      <el-button type="primary" @click="dialogVisible = true"
        >➕ 新增设备入库</el-button
      >
      <el-input
        v-model="searchVal"
        placeholder="🔍 搜索设备名称或编号..."
        style="width: 250px"
        clearable
      />
    </div>

    <el-table :data="filteredData" border stripe style="width: 100%">
      <el-table-column prop="id" label="资产编号" width="100" sortable />
      <el-table-column prop="name" label="设备名称" width="150" />
      <el-table-column prop="model" label="型号规格" width="180" />
      <el-table-column prop="type" label="类型" width="100" />
      <el-table-column prop="supplier" label="供应商" width="150" />
      <el-table-column prop="price" label="单价(元)" width="100" sortable />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag
            :type="
              scope.row.status === '在库'
                ? 'success'
                : scope.row.status === '借出'
                  ? 'warning'
                  : 'danger'
            "
          >
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="150">
        <template #default="scope">
          <el-button size="small" type="primary" plain>编辑</el-button>
          <el-button
            size="small"
            type="danger"
            @click="handleDelete(scope.$index)"
            >报废</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" title="📦 新设备入库登记" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="设备名称">
          <el-input v-model="form.name" placeholder="例如：深度学习工作站" />
        </el-form-item>
        <el-form-item label="型号规格">
          <el-input
            v-model="form.model"
            placeholder="例如：RTX4090 / 64G内存"
          />
        </el-form-item>
        <el-form-item label="设备类型">
          <el-select
            v-model="form.type"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option label="服务器" value="服务器" />
            <el-option label="PC机" value="PC机" />
            <el-option label="VR设备" value="VR设备" />
            <el-option label="笔记本" value="笔记本" />
          </el-select>
        </el-form-item>
        <el-form-item label="供应商">
          <el-input v-model="form.supplier" placeholder="采购来源" />
        </el-form-item>
        <el-form-item label="采购价格">
          <el-input-number
            v-model="form.price"
            :min="0"
            :step="100"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确认入库</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { assetData } from "../mock/data.js";
import { ElMessage } from "element-plus";

const searchVal = ref("");
const dialogVisible = ref(false);

// 表单数据对象
const form = reactive({
  name: "",
  model: "",
  type: "",
  supplier: "",
  price: 0,
});

// 搜索逻辑
const filteredData = computed(() => {
  return assetData.filter(
    (item) =>
      item.name.includes(searchVal.value) || item.id.includes(searchVal.value),
  );
});

// 保存逻辑
const handleSave = () => {
  if (!form.name || !form.type) return ElMessage.error("请补全关键信息");

  assetData.push({
    id: "ZC" + Date.now().toString().slice(-4),
    name: form.name,
    model: form.model || "标准版",
    type: form.type,
    supplier: form.supplier || "自采",
    price: form.price,
    date: new Date().toISOString().split("T")[0],
    status: "在库",
  });

  ElMessage.success("入库成功！");
  dialogVisible.value = false;
  // 清空表单
  form.name = "";
  form.model = "";
  form.price = 0;
};

const handleDelete = (index) => {
  if (confirm("确认报废该设备吗？")) assetData.splice(index, 1);
};
</script>
