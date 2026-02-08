<template>
  <div>
    <h2>🖥️ 资产全生命周期管理</h2>

    <div style="margin-bottom: 20px; display: flex; gap: 10px">
      <el-button type="primary" @click="openAddDialog"
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
      <el-table-column prop="id" label="资产编号" width="100" />
      <el-table-column prop="name" label="设备名称" width="150" />

      <el-table-column prop="model" label="型号规格" width="150" />
      <el-table-column prop="supplier" label="供应商" width="150" />
      <el-table-column prop="price" label="价格(元)" width="100" />
      <el-table-column prop="date" label="采购日期" width="120" />
      <el-table-column prop="type" label="类型" width="100" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === '在库' ? 'success' : 'warning'">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" min-width="150">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)"
            >编辑</el-button
          >
          <el-button
            size="small"
            type="danger"
            @click="handleDelete(scope.$index)"
            >报废</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="isEditMode ? '✏️ 编辑设备信息' : '📦 新设备入库登记'"
      width="500px"
    >
      <el-form :model="form" label-width="100px">
        <el-form-item label="设备名称">
          <el-input v-model="form.name" placeholder="例如：深度学习工作站" />
        </el-form-item>

        <el-form-item label="型号规格">
          <el-input
            v-model="form.model"
            placeholder="例如：Dell R750 / 64G内存"
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
          <el-input
            v-model="form.supplier"
            placeholder="例如：戴尔官方旗舰店"
          />
        </el-form-item>

        <div style="display: flex; gap: 10px">
          <el-form-item label="单价(元)" style="flex: 1">
            <el-input-number
              v-model="form.price"
              :min="0"
              :step="100"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="采购日期" style="flex: 1">
            <el-date-picker
              v-model="form.date"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">
          {{ isEditMode ? "保存修改" : "确认入库" }}
        </el-button>
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
const isEditMode = ref(false);
const editId = ref(null);

// 1. 表单数据对象：补全了所有字段
const form = reactive({
  name: "",
  model: "", // ✨ 新增
  type: "",
  supplier: "", // ✨ 新增
  price: 0, // ✨ 新增
  date: "", // ✨ 新增
});

const filteredData = computed(() => {
  return assetData.filter(
    (item) =>
      item.name.includes(searchVal.value) || item.id.includes(searchVal.value),
  );
});

const openAddDialog = () => {
  isEditMode.value = false;
  // 清空表单
  form.name = "";
  form.model = "";
  form.type = "";
  form.supplier = "";
  form.price = 0;
  form.date = new Date().toISOString().split("T")[0]; // 默认今天
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  isEditMode.value = true;
  editId.value = row.id;
  // 数据回显：把行数据填入表单
  form.name = row.name;
  form.model = row.model;
  form.type = row.type;
  form.supplier = row.supplier;
  form.price = row.price;
  form.date = row.date;
  dialogVisible.value = true;
};

// 2. 保存逻辑：处理所有字段
const handleSave = () => {
  if (!form.name || !form.type) return ElMessage.error("请补全关键信息");

  if (isEditMode.value) {
    // 编辑保存
    const target = assetData.find((item) => item.id === editId.value);
    if (target) {
      target.name = form.name;
      target.model = form.model;
      target.type = form.type;
      target.supplier = form.supplier;
      target.price = form.price;
      target.date = form.date;
      ElMessage.success("修改成功");
    }
  } else {
    // 新增保存
    assetData.push({
      id: "ZC" + Date.now().toString().slice(-4),
      name: form.name,
      model: form.model || "标准版",
      type: form.type,
      supplier: form.supplier || "自采",
      price: form.price,
      date: form.date,
      status: "在库",
    });
    ElMessage.success("入库成功");
  }
  dialogVisible.value = false;
};

const handleDelete = (index) => {
  if (confirm("确认报废该设备吗？")) assetData.splice(index, 1);
};
</script>
