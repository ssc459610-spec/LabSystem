<template>
  <div class="extension-overdue-management">
    <!-- 延期申请 -->
    <el-card class="management-card">
      <template #header>
        <div class="card-header">
          <span>延期申请管理</span>
        </div>
      </template>

      <el-table :data="extensionApplications" border style="width: 100%">
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="expand-content">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="借出单号">{{ row.borrowNo }}</el-descriptions-item>
                <el-descriptions-item label="申请人">{{ row.applicant }}</el-descriptions-item>
                <el-descriptions-item label="设备名称">{{ row.deviceName }}</el-descriptions-item>
                <el-descriptions-item label="原借用时间">
                  {{ row.originalBorrowTime }} 至 {{ row.originalReturnTime }}
                </el-descriptions-item>
                <el-descriptions-item label="原借用天数">{{ row.originalDays }} 天</el-descriptions-item>
                <el-descriptions-item label="延期天数">{{ row.extensionDays }} 天</el-descriptions-item>
                <el-descriptions-item label="延期后归还时间">{{ row.newReturnTime }}</el-descriptions-item>
                <el-descriptions-item label="延期比例">{{ row.extensionRate }}%</el-descriptions-item>
                <el-descriptions-item label="延期原因" :span="2">{{ row.reason }}</el-descriptions-item>
                <el-descriptions-item label="申请时间" :span="2">{{ row.applyTime }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="borrowNo" label="借出单号" width="150" />
        <el-table-column prop="applicant" label="申请人" width="100" />
        <el-table-column prop="deviceName" label="设备名称" width="180" />
        <el-table-column prop="extensionDays" label="延期天数" width="100">
          <template #default="{ row }">
            {{ row.extensionDays }} 天
          </template>
        </el-table-column>
        <el-table-column prop="originalReturnTime" label="原归还时间" width="180" />
        <el-table-column prop="newReturnTime" label="延期后归还时间" width="180" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getExtensionStatusType(row.status)">
              {{ getExtensionStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="row.status === 'pending'" 
              type="success" 
              size="small" 
              @click="handleApproveExtension(row, 'approved')"
            >
              批准
            </el-button>
            <el-button 
              v-if="row.status === 'pending'" 
              type="danger" 
              size="small" 
              @click="handleApproveExtension(row, 'rejected')"
            >
              拒绝
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 逾期管理 -->
    <el-card class="management-card">
      <template #header>
        <div class="card-header">
          <span>逾期设备管理</span>
          <el-button type="primary" @click="handleBatchRemind">批量提醒</el-button>
        </div>
      </template>

      <el-table :data="overdueDevices" border style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="expand-content">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="借出单号">{{ row.borrowNo }}</el-descriptions-item>
                <el-descriptions-item label="借用人">{{ row.borrower }}</el-descriptions-item>
                <el-descriptions-item label="联系方式">{{ row.contact }}</el-descriptions-item>
                <el-descriptions-item label="角色">
                  <el-tag :type="row.role === 'teacher' ? 'success' : 'info'">
                    {{ row.role === 'teacher' ? '教师' : '学生' }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="设备名称">{{ row.deviceName }}</el-descriptions-item>
                <el-descriptions-item label="设备编号">{{ row.deviceCode }}</el-descriptions-item>
                <el-descriptions-item label="借出时间">{{ row.borrowTime }}</el-descriptions-item>
                <el-descriptions-item label="应还时间">{{ row.expectedReturnTime }}</el-descriptions-item>
                <el-descriptions-item label="提醒记录" :span="2">
                  <el-timeline>
                    <el-timeline-item
                      v-for="(remind, index) in row.remindHistory"
                      :key="index"
                      :timestamp="remind.time"
                      placement="top"
                    >
                      <el-tag :type="remind.type === 'auto' ? 'warning' : 'info'" size="small">
                        {{ remind.type === 'auto' ? '自动提醒' : '手动提醒' }}
                      </el-tag>
                      <span style="margin-left: 10px">{{ remind.content }}</span>
                    </el-timeline-item>
                  </el-timeline>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="borrowNo" label="借出单号" width="150" />
        <el-table-column prop="borrower" label="借用人" width="100" />
        <el-table-column prop="deviceName" label="设备名称" width="180" />
        <el-table-column prop="expectedReturnTime" label="应还时间" width="180" />
        <el-table-column prop="overdueDays" label="逾期天数" width="100">
          <template #default="{ row }">
            <el-tag :type="getOverdueType(row.overdueDays)" effect="dark">
              {{ row.overdueDays }} 天
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remindCount" label="提醒次数" width="100">
          <template #default="{ row }">
            {{ row.remindCount }} 次
          </template>
        </el-table-column>
        <el-table-column prop="lastRemindTime" label="最后提醒时间" width="180" />
        <el-table-column prop="restricted" label="限制借用" width="100">
          <template #default="{ row }">
            <el-tag :type="row.restricted ? 'danger' : 'success'">
              {{ row.restricted ? '已限制' : '未限制' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button 
              type="warning" 
              size="small" 
              @click="handleRemind(row)"
              :disabled="isRecentlyReminded(row)"
            >
              {{ isRecentlyReminded(row) ? '已提醒' : '提醒' }}
            </el-button>
            <el-button 
              v-if="!row.restricted && row.overdueDays >= 3" 
              type="danger" 
              size="small" 
              @click="handleRestrictBorrow(row)"
            >
              限制借用
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 即将到期提醒 -->
    <el-card class="management-card">
      <template #header>
        <div class="card-header">
          <span>即将到期提醒（24小时内）</span>
          <el-button type="primary" @click="handleBatchExpireRemind">批量提醒</el-button>
        </div>
      </template>

      <el-table :data="expiringDevices" border style="width: 100%" @selection-change="handleExpiringSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="borrowNo" label="借出单号" width="150" />
        <el-table-column prop="borrower" label="借用人" width="100" />
        <el-table-column prop="contact" label="联系方式" width="120" />
        <el-table-column prop="deviceName" label="设备名称" width="180" />
        <el-table-column prop="expectedReturnTime" label="预计归还时间" width="180" />
        <el-table-column prop="remainingHours" label="剩余时间" width="120">
          <template #default="{ row }">
            <el-tag type="warning">{{ row.remainingHours }} 小时</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="canExtend" label="可延期" width="100">
          <template #default="{ row }">
            <el-tag :type="row.canExtend ? 'success' : 'info'">
              {{ row.canExtend ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              size="small" 
              @click="handleExpireRemind(row)"
            >
              到期提醒
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 提醒对话框 -->
    <el-dialog v-model="remindDialogVisible" title="发送提醒" width="500px">
      <el-form :model="remindForm" label-width="100px">
        <el-form-item label="提醒方式">
          <el-checkbox-group v-model="remindForm.methods">
            <el-checkbox label="站内消息">站内消息</el-checkbox>
            <el-checkbox label="短信">短信</el-checkbox>
            <el-checkbox label="邮件">邮件</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="提醒内容">
          <el-input
            v-model="remindForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入提醒内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="remindDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmRemind">确认发送</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 延期申请列表
const extensionApplications = ref([
  {
    extensionNo: 'EXT202402090001',
    borrowNo: 'BOR202402080001',
    applicant: '赵刚',
    deviceName: '激光干涉仪',
    originalBorrowTime: '2024-02-08 09:00',
    originalReturnTime: '2024-02-15 18:00',
    originalDays: 7,
    extensionDays: 3,
    newReturnTime: '2024-02-18 18:00',
    extensionRate: 42.86,
    reason: '实验数据采集需要更多时间',
    applyTime: '2024-02-09 10:00',
    status: 'pending'
  }
])

// 逾期设备列表
const overdueDevices = ref([
  {
    borrowNo: 'BOR202402070001',
    borrower: '李明',
    contact: '13800138001',
    role: 'student',
    deviceName: '示波器DSO-X 3024A',
    deviceCode: 'DEV001234',
    borrowTime: '2024-02-07 09:00',
    expectedReturnTime: '2024-02-08 18:00',
    overdueDays: 1,
    remindCount: 1,
    lastRemindTime: '2024-02-09 09:00',
    restricted: false,
    remindHistory: [
      {
        time: '2024-02-09 09:00',
        type: 'auto',
        content: '系统自动发送逾期提醒'
      }
    ]
  },
  {
    borrowNo: 'BOR202402050001',
    borrower: '王芳',
    contact: '13800138002',
    role: 'student',
    deviceName: '3D打印机Ultimaker S5',
    deviceCode: 'DEV001235',
    borrowTime: '2024-02-05 09:00',
    expectedReturnTime: '2024-02-06 18:00',
    overdueDays: 3,
    remindCount: 3,
    lastRemindTime: '2024-02-09 09:00',
    restricted: true,
    remindHistory: [
      {
        time: '2024-02-07 09:00',
        type: 'auto',
        content: '系统自动发送首次逾期提醒'
      },
      {
        time: '2024-02-08 09:00',
        type: 'auto',
        content: '系统自动发送第2次逾期提醒'
      },
      {
        time: '2024-02-09 09:00',
        type: 'auto',
        content: '系统自动发送第3次逾期提醒并限制借用权限'
      }
    ]
  }
])

// 即将到期设备列表
const expiringDevices = ref([
  {
    borrowNo: 'BOR202402090002',
    borrower: '张三',
    contact: '13800138003',
    deviceName: 'Arduino开发套件',
    expectedReturnTime: '2024-02-10 09:00',
    remainingHours: 6,
    canExtend: true
  },
  {
    borrowNo: 'BOR202402090003',
    borrower: '刘伟',
    contact: '13800138004',
    deviceName: '树莓派4B',
    expectedReturnTime: '2024-02-10 14:00',
    remainingHours: 11,
    canExtend: false
  }
])

// 选中的逾期设备
const selectedOverdue = ref([])
// 选中的即将到期设备
const selectedExpiring = ref([])

// 提醒对话框
const remindDialogVisible = ref(false)
const remindForm = reactive({
  methods: ['站内消息'],
  content: ''
})
const currentRemindDevice = ref(null)

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedOverdue.value = selection
}

const handleExpiringSelectionChange = (selection) => {
  selectedExpiring.value = selection
}

// 批准延期
const handleApproveExtension = (row, result) => {
  ElMessageBox.confirm(
    `确定要${result === 'approved' ? '批准' : '拒绝'}该延期申请吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: result === 'approved' ? 'success' : 'warning'
    }
  ).then(() => {
    // 调用API处理延期申请
    console.log('处理延期申请:', { extensionNo: row.extensionNo, result })
    
    row.status = result
    
    ElMessage.success(`延期申请已${result === 'approved' ? '批准' : '拒绝'}`)
  })
}

// 判断是否最近提醒过（1小时内）
const isRecentlyReminded = (row) => {
  if (!row.lastRemindTime) return false
  const lastTime = new Date(row.lastRemindTime).getTime()
  const now = new Date().getTime()
  const diffHours = (now - lastTime) / (1000 * 60 * 60)
  return diffHours < 1
}

// 单个提醒
const handleRemind = (row) => {
  currentRemindDevice.value = row
  remindForm.methods = ['站内消息']
  remindForm.content = `您借用的设备"${row.deviceName}"已逾期${row.overdueDays}天，请尽快归还。如有特殊情况，请联系管理员。`
  remindDialogVisible.value = true
}

// 批量提醒
const handleBatchRemind = () => {
  if (selectedOverdue.value.length === 0) {
    ElMessage.warning('请选择要提醒的记录')
    return
  }
  
  ElMessageBox.confirm(
    `确定要向 ${selectedOverdue.value.length} 位借用人发送逾期提醒吗？`,
    '批量提醒',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 调用API批量发送提醒
    console.log('批量提醒:', selectedOverdue.value)
    ElMessage.success('提醒已发送')
    
    // 更新提醒记录
    selectedOverdue.value.forEach(item => {
      item.remindCount++
      item.lastRemindTime = new Date().toLocaleString('zh-CN')
      item.remindHistory.push({
        time: item.lastRemindTime,
        type: 'manual',
        content: '管理员手动发送逾期提醒'
      })
    })
  })
}

// 到期提醒
const handleExpireRemind = (row) => {
  currentRemindDevice.value = row
  remindForm.methods = ['站内消息']
  remindForm.content = `您借用的设备"${row.deviceName}"将在${row.remainingHours}小时后到期，请按时归还。${row.canExtend ? '如需延期，请在到期前24小时内申请。' : ''}`
  remindDialogVisible.value = true
}

// 批量到期提醒
const handleBatchExpireRemind = () => {
  if (selectedExpiring.value.length === 0) {
    ElMessage.warning('请选择要提醒的记录')
    return
  }
  
  ElMessageBox.confirm(
    `确定要向 ${selectedExpiring.value.length} 位借用人发送到期提醒吗？`,
    '批量提醒',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 调用API批量发送提醒
    console.log('批量到期提醒:', selectedExpiring.value)
    ElMessage.success('提醒已发送')
  })
}

// 确认发送提醒
const confirmRemind = () => {
  if (remindForm.methods.length === 0) {
    ElMessage.warning('请至少选择一种提醒方式')
    return
  }
  
  if (!remindForm.content.trim()) {
    ElMessage.warning('请输入提醒内容')
    return
  }
  
  const data = {
    borrowNo: currentRemindDevice.value.borrowNo,
    methods: remindForm.methods,
    content: remindForm.content
  }
  
  // 调用API发送提醒
  console.log('发送提醒:', data)
  
  // 更新提醒记录
  if (currentRemindDevice.value.remindHistory) {
    currentRemindDevice.value.remindCount++
    currentRemindDevice.value.lastRemindTime = new Date().toLocaleString('zh-CN')
    currentRemindDevice.value.remindHistory.push({
      time: currentRemindDevice.value.lastRemindTime,
      type: 'manual',
      content: '管理员手动发送提醒：' + remindForm.content
    })
  }
  
  ElMessage.success('提醒已发送')
  remindDialogVisible.value = false
}

// 限制借用
const handleRestrictBorrow = (row) => {
  ElMessageBox.confirm(
    `确定要限制用户"${row.borrower}"的借用权限吗？限制后该用户将无法提交新的借用申请。`,
    '限制借用',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }
  ).then(() => {
    // 调用API限制借用权限
    console.log('限制借用:', row.borrower)
    row.restricted = true
    ElMessage.success('已限制该用户的借用权限')
  })
}

// 辅助函数
const getExtensionStatusLabel = (status) => {
  const map = {
    pending: '待审批',
    approved: '已批准',
    rejected: '已拒绝'
  }
  return map[status] || status
}

const getExtensionStatusType = (status) => {
  const map = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return map[status] || 'info'
}

const getOverdueType = (days) => {
  if (days >= 7) return 'danger'
  if (days >= 3) return 'warning'
  return 'info'
}
</script>

<style scoped>
.extension-overdue-management {
  padding: 20px;
}

.management-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.expand-content {
  padding: 20px;
}
</style>
