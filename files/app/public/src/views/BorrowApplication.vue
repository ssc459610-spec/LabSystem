<template>
  <div class="borrow-application">
    <el-card class="application-card">
      <template #header>
        <div class="card-header">
          <span>设备借用申请</span>
        </div>
      </template>

      <el-form :model="applicationForm" :rules="rules" ref="formRef" label-width="140px">
        <el-form-item label="设备类型" prop="deviceType">
          <el-select v-model="applicationForm.deviceType" placeholder="请选择设备类型" @change="handleDeviceTypeChange">
            <el-option label="教学设备" value="teaching" />
            <el-option label="科研设备" value="research" />
            <el-option label="竞赛设备" value="competition" />
          </el-select>
        </el-form-item>

        <el-form-item label="选择设备" prop="deviceId">
          <el-select 
            v-model="applicationForm.deviceId" 
            placeholder="请选择设备" 
            filterable
            @change="handleDeviceChange"
          >
            <el-option 
              v-for="device in availableDevices" 
              :key="device.id" 
              :label="`${device.name} (可用: ${device.availableCount}台)`" 
              :value="device.id"
              :disabled="device.availableCount === 0"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="借用数量" prop="quantity">
          <el-input-number 
            v-model="applicationForm.quantity" 
            :min="1" 
            :max="maxQuantity"
          />
          <span class="hint-text">（当前角色单次最多借用 {{ maxQuantity }} 台/套）</span>
        </el-form-item>

        <el-form-item label="借用用途" prop="purpose">
          <el-select v-model="applicationForm.purpose" placeholder="请选择借用用途">
            <el-option label="课程学习" value="course" />
            <el-option label="科研项目" value="research" />
            <el-option label="学科竞赛" value="competition" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>

        <el-form-item label="用途说明" prop="purposeDetail">
          <el-input 
            v-model="applicationForm.purposeDetail" 
            type="textarea" 
            :rows="3"
            placeholder="请详细说明借用用途"
          />
        </el-form-item>

        <!-- 科研设备需要项目编号 -->
        <el-form-item 
          v-if="applicationForm.deviceType === 'research' && userRole === 'teacher'" 
          label="科研项目编号" 
          prop="projectCode"
        >
          <el-input v-model="applicationForm.projectCode" placeholder="请输入科研项目编号" />
        </el-form-item>

        <!-- 竞赛设备需要报名凭证 -->
        <el-form-item 
          v-if="applicationForm.deviceType === 'competition'" 
          label="竞赛报名凭证" 
          prop="competitionProof"
        >
          <el-upload
            class="upload-demo"
            :action="uploadUrl"
            :on-success="handleUploadSuccess"
            :file-list="fileList"
          >
            <el-button type="primary">上传凭证</el-button>
            <template #tip>
              <div class="el-upload__tip">支持jpg/png/pdf文件，且不超过5MB</div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item label="借用时间" prop="dateRange">
          <el-date-picker
            v-model="applicationForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            :disabled-date="disabledDate"
            @change="handleDateChange"
          />
          <span class="hint-text">（最长借用 {{ maxDays }} 天）</span>
        </el-form-item>

        <!-- 冲突检测提示 -->
        <el-alert
          v-if="conflictInfo.hasConflict"
          title="时间冲突提示"
          type="warning"
          :closable="false"
          style="margin-bottom: 20px"
        >
          <template #default>
            <div v-for="(conflict, index) in conflictInfo.conflicts" :key="index">
              <p>{{ conflict.reason }}</p>
              <p class="conflict-time">冲突时间段: {{ conflict.timeRange }}</p>
            </div>
          </template>
        </el-alert>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :disabled="conflictInfo.hasConflict">提交申请</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 我的申请列表 -->
    <el-card class="application-list-card">
      <template #header>
        <div class="card-header">
          <span>我的申请记录</span>
          <el-select v-model="filterStatus" placeholder="筛选状态" style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="待审批" value="pending" />
            <el-option label="已批准" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </div>
      </template>

      <el-table :data="filteredApplications" border style="width: 100%">
        <el-table-column prop="applicationNo" label="申请编号" width="150" />
        <el-table-column prop="deviceName" label="设备名称" width="180" />
        <el-table-column prop="quantity" label="数量" width="80" />
        <el-table-column prop="purpose" label="用途" width="120">
          <template #default="{ row }">
            <el-tag :type="getPurposeType(row.purpose)">{{ getPurposeLabel(row.purpose) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="borrowTime" label="借用时间" width="180" />
        <el-table-column prop="returnTime" label="归还时间" width="180" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="approver" label="审批人" width="120" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="row.status === 'pending'" 
              type="danger" 
              size="small" 
              @click="handleCancelApplication(row)"
            >
              撤销申请
            </el-button>
            <el-button 
              v-if="row.status === 'approved' && row.canExtend" 
              type="primary" 
              size="small" 
              @click="handleExtension(row)"
            >
              申请延期
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const formRef = ref(null)
const userRole = ref('student') // 从用户信息中获取，这里模拟
const uploadUrl = ref('/api/upload') // 上传接口地址

// 表单数据
const applicationForm = reactive({
  deviceType: '',
  deviceId: '',
  quantity: 1,
  purpose: '',
  purposeDetail: '',
  projectCode: '',
  competitionProof: '',
  dateRange: []
})

// 可用设备列表
const availableDevices = ref([])

// 文件列表
const fileList = ref([])

// 冲突信息
const conflictInfo = reactive({
  hasConflict: false,
  conflicts: []
})

// 申请记录
const applications = ref([
  {
    applicationNo: 'BRW202402090001',
    deviceName: '示波器DSO-X 3024A',
    quantity: 1,
    purpose: 'course',
    borrowTime: '2024-02-10 09:00',
    returnTime: '2024-02-17 18:00',
    status: 'approved',
    approver: '张老师',
    canExtend: false
  },
  {
    applicationNo: 'BRW202402090002',
    deviceName: '3D打印机Ultimaker S5',
    quantity: 1,
    purpose: 'competition',
    borrowTime: '2024-02-15 09:00',
    returnTime: '2024-03-01 18:00',
    status: 'pending',
    approver: '-',
    canExtend: false
  }
])

const filterStatus = ref('')

// 表单验证规则
const rules = {
  deviceType: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
  deviceId: [{ required: true, message: '请选择设备', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入借用数量', trigger: 'blur' }],
  purpose: [{ required: true, message: '请选择借用用途', trigger: 'change' }],
  purposeDetail: [{ required: true, message: '请填写用途说明', trigger: 'blur' }],
  dateRange: [{ required: true, message: '请选择借用时间', trigger: 'change' }]
}

// 计算最大借用数量
const maxQuantity = computed(() => {
  return userRole.value === 'student' ? 3 : 10
})

// 计算最大借用天数
const maxDays = computed(() => {
  const roleMap = {
    student: {
      teaching: 7,
      research: 30,
      competition: 15
    },
    teacher: {
      teaching: 30,
      research: 90,
      competition: 30
    }
  }
  return roleMap[userRole.value]?.[applicationForm.deviceType] || 7
})

// 禁用日期
const disabledDate = (time) => {
  return time.getTime() < Date.now() - 8.64e7 // 禁用今天之前的日期
}

// 筛选后的申请列表
const filteredApplications = computed(() => {
  if (!filterStatus.value) return applications.value
  return applications.value.filter(app => app.status === filterStatus.value)
})

// 处理设备类型变化
const handleDeviceTypeChange = () => {
  applicationForm.deviceId = ''
  loadAvailableDevices()
}

// 加载可用设备
const loadAvailableDevices = () => {
  // 模拟从API获取设备列表
  availableDevices.value = [
    { id: '1', name: '示波器DSO-X 3024A', availableCount: 5 },
    { id: '2', name: '3D打印机Ultimaker S5', availableCount: 2 },
    { id: '3', name: '激光切割机GCC LaserPro', availableCount: 0 },
    { id: '4', name: 'Arduino开发套件', availableCount: 15 }
  ]
}

// 处理设备选择
const handleDeviceChange = () => {
  // 可以在这里加载设备的详细信息
}

// 处理时间选择
const handleDateChange = () => {
  if (applicationForm.dateRange && applicationForm.dateRange.length === 2) {
    checkConflict()
  }
}

// 检测冲突
const checkConflict = () => {
  // 模拟冲突检测
  const startTime = applicationForm.dateRange[0]
  const endTime = applicationForm.dateRange[1]
  
  // 计算借用天数
  const days = Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24))
  
  if (days > maxDays.value) {
    conflictInfo.hasConflict = true
    conflictInfo.conflicts = [{
      reason: `借用时长超过限制，当前选择${days}天，最多可借用${maxDays.value}天`,
      timeRange: `${formatDate(startTime)} - ${formatDate(endTime)}`
    }]
    return
  }
  
  // 模拟其他冲突检测
  conflictInfo.hasConflict = false
  conflictInfo.conflicts = []
  
  // 这里应该调用API进行实际的冲突检测
  // 检测：设备预约冲突、课程占用、维护时间、设备状态等
}

// 上传成功回调
const handleUploadSuccess = (response, file) => {
  applicationForm.competitionProof = response.url
  ElMessage.success('凭证上传成功')
}

// 提交申请
const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid && !conflictInfo.hasConflict) {
      // 构建申请数据
      const data = {
        ...applicationForm,
        borrowTime: applicationForm.dateRange[0],
        returnTime: applicationForm.dateRange[1],
        userRole: userRole.value
      }
      
      // 调用API提交申请
      console.log('提交申请:', data)
      ElMessage.success('申请提交成功，请等待审批')
      handleReset()
      
      // 刷新申请列表
      loadApplications()
    } else {
      ElMessage.error('请检查表单填写是否正确')
    }
  })
}

// 重置表单
const handleReset = () => {
  formRef.value.resetFields()
  fileList.value = []
  conflictInfo.hasConflict = false
  conflictInfo.conflicts = []
}

// 撤销申请
const handleCancelApplication = (row) => {
  ElMessageBox.confirm('确定要撤销该申请吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 调用API撤销申请
    console.log('撤销申请:', row.applicationNo)
    ElMessage.success('申请已撤销')
    loadApplications()
  })
}

// 申请延期
const handleExtension = (row) => {
  ElMessageBox.prompt('请输入延期天数（不超过原借用时长的50%）', '申请延期', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^[1-9]\d*$/,
    inputErrorMessage: '请输入有效的天数'
  }).then(({ value }) => {
    // 调用API申请延期
    console.log('申请延期:', row.applicationNo, value)
    ElMessage.success('延期申请已提交')
  })
}

// 加载申请记录
const loadApplications = () => {
  // 调用API加载申请记录
}

// 辅助函数
const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const getPurposeLabel = (purpose) => {
  const map = {
    course: '课程学习',
    research: '科研项目',
    competition: '学科竞赛',
    other: '其他'
  }
  return map[purpose] || purpose
}

const getPurposeType = (purpose) => {
  const map = {
    course: 'success',
    research: 'warning',
    competition: 'danger',
    other: 'info'
  }
  return map[purpose] || 'info'
}

const getStatusLabel = (status) => {
  const map = {
    pending: '待审批',
    approved: '已批准',
    rejected: '已拒绝',
    cancelled: '已撤销'
  }
  return map[status] || status
}

const getStatusType = (status) => {
  const map = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    cancelled: 'info'
  }
  return map[status] || 'info'
}

onMounted(() => {
  loadApplications()
})
</script>

<style scoped>
.borrow-application {
  padding: 20px;
}

.application-card,
.application-list-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hint-text {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}

.conflict-time {
  color: #E6A23C;
  font-size: 13px;
  margin-top: 5px;
}

.upload-demo {
  width: 100%;
}
</style>
