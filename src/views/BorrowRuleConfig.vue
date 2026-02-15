<template>
  <div class="borrow-rule-config">
    <el-card class="rule-card">
      <template #header>
        <div class="card-header">
          <span>借用规则配置</span>
          <el-button type="primary" @click="handleSaveRules">保存配置</el-button>
        </div>
      </template>

      <el-tabs v-model="activeTab" type="border-card">
        <!-- 借用时长限制 -->
        <el-tab-pane label="借用时长限制" name="duration">
          <el-table :data="durationRules" border style="width: 100%">
            <el-table-column prop="role" label="角色" width="120">
              <template #default="{ row }">
                <el-select v-model="row.role" placeholder="选择角色">
                  <el-option label="学生" value="student" />
                  <el-option label="教师" value="teacher" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="deviceType" label="设备类型" width="150">
              <template #default="{ row }">
                <el-select v-model="row.deviceType" placeholder="选择设备类型">
                  <el-option label="教学设备" value="teaching" />
                  <el-option label="科研设备" value="research" />
                  <el-option label="竞赛设备" value="competition" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="maxDays" label="最长借用天数" width="150">
              <template #default="{ row }">
                <el-input-number v-model="row.maxDays" :min="1" :max="365" />
              </template>
            </el-table-column>
            <el-table-column prop="extensionRate" label="延期比例(%)" width="150">
              <template #default="{ row }">
                <el-input-number v-model="row.extensionRate" :min="0" :max="100" :disabled="row.role !== 'teacher'" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="{ $index }">
                <el-button type="danger" size="small" @click="handleDeleteRule('duration', $index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button type="primary" style="margin-top: 16px" @click="handleAddRule('duration')">添加规则</el-button>
        </el-tab-pane>

        <!-- 借用数量限制 -->
        <el-tab-pane label="借用数量限制" name="quantity">
          <el-table :data="quantityRules" border style="width: 100%">
            <el-table-column prop="role" label="角色" width="200">
              <template #default="{ row }">
                <el-select v-model="row.role" placeholder="选择角色">
                  <el-option label="学生" value="student" />
                  <el-option label="教师" value="teacher" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="maxQuantity" label="单次最多借用数量(台/套)" width="250">
              <template #default="{ row }">
                <el-input-number v-model="row.maxQuantity" :min="1" :max="100" />
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注">
              <template #default="{ row }">
                <el-input v-model="row.remark" placeholder="可按实验室需求调整" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="{ $index }">
                <el-button type="danger" size="small" @click="handleDeleteRule('quantity', $index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button type="primary" style="margin-top: 16px" @click="handleAddRule('quantity')">添加规则</el-button>
        </el-tab-pane>

        <!-- 资质限制 -->
        <el-tab-pane label="资质限制" name="qualification">
          <el-table :data="qualificationRules" border style="width: 100%">
            <el-table-column prop="deviceType" label="设备类型" width="180">
              <template #default="{ row }">
                <el-select v-model="row.deviceType" placeholder="选择设备类型">
                  <el-option label="科研设备" value="research" />
                  <el-option label="竞赛设备" value="competition" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="requirement" label="资质要求">
              <template #default="{ row }">
                <el-input v-model="row.requirement" placeholder="例如：需关联科研项目编号" />
              </template>
            </el-table-column>
            <el-table-column prop="needApproval" label="需要审核" width="120">
              <template #default="{ row }">
                <el-switch v-model="row.needApproval" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="{ $index }">
                <el-button type="danger" size="small" @click="handleDeleteRule('qualification', $index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button type="primary" style="margin-top: 16px" @click="handleAddRule('qualification')">添加规则</el-button>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('duration')

// 借用时长规则
const durationRules = ref([
  { role: 'student', deviceType: 'teaching', maxDays: 7, extensionRate: 0 },
  { role: 'student', deviceType: 'research', maxDays: 30, extensionRate: 0 },
  { role: 'student', deviceType: 'competition', maxDays: 15, extensionRate: 0 },
  { role: 'teacher', deviceType: 'teaching', maxDays: 30, extensionRate: 50 },
  { role: 'teacher', deviceType: 'research', maxDays: 90, extensionRate: 50 }
])

// 借用数量规则
const quantityRules = ref([
  { role: 'student', maxQuantity: 3, remark: '学生单次最多借用3台/套设备' },
  { role: 'teacher', maxQuantity: 10, remark: '教师单次最多借用10台/套设备，可按实验室需求调整' }
])

// 资质限制规则
const qualificationRules = ref([
  { deviceType: 'research', requirement: '需关联科研项目编号，教师审核确认', needApproval: true },
  { deviceType: 'competition', requirement: '需提供竞赛报名凭证', needApproval: true }
])

const handleAddRule = (type) => {
  if (type === 'duration') {
    durationRules.value.push({
      role: 'student',
      deviceType: 'teaching',
      maxDays: 7,
      extensionRate: 0
    })
  } else if (type === 'quantity') {
    quantityRules.value.push({
      role: 'student',
      maxQuantity: 1,
      remark: ''
    })
  } else if (type === 'qualification') {
    qualificationRules.value.push({
      deviceType: 'research',
      requirement: '',
      needApproval: true
    })
  }
}

const handleDeleteRule = (type, index) => {
  if (type === 'duration') {
    durationRules.value.splice(index, 1)
  } else if (type === 'quantity') {
    quantityRules.value.splice(index, 1)
  } else if (type === 'qualification') {
    qualificationRules.value.splice(index, 1)
  }
}

const handleSaveRules = () => {
  // 这里实现保存规则的逻辑，通常是调用API
  const rules = {
    durationRules: durationRules.value,
    quantityRules: quantityRules.value,
    qualificationRules: qualificationRules.value
  }
  console.log('保存规则:', rules)
  ElMessage.success('规则配置保存成功')
}
</script>

<style scoped>
.borrow-rule-config {
  padding: 20px;
}

.rule-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
