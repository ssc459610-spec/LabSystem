<template>
  <div class="approval-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>借用申请审批</span>
          <div class="header-actions">
            <el-select v-model="filterType" placeholder="筛选类型" style="width: 150px; margin-right: 10px">
              <el-option label="全部申请" value="" />
              <el-option label="待我审批" value="pending" />
              <el-option label="已审批" value="processed" />
            </el-select>
            <el-select v-model="filterDeviceType" placeholder="设备类型" style="width: 150px">
              <el-option label="全部类型" value="" />
              <el-option label="教学设备" value="teaching" />
              <el-option label="科研设备" value="research" />
              <el-option label="竞赛设备" value="competition" />
            </el-select>
          </div>
        </div>
      </template>

      <el-table :data="filteredApprovals" border style="width: 100%">
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="expand-content">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="申请编号">{{ row.applicationNo }}</el-descriptions-item>
                <el-descriptions-item label="申请人">{{ row.applicant }}</el-descriptions-item>
                <el-descriptions-item label="申请人角色">
                  <el-tag :type="row.applicantRole === 'teacher' ? 'success' : 'info'">
                    {{ row.applicantRole === 'teacher' ? '教师' : '学生' }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="联系方式">{{ row.contact }}</el-descriptions-item>
                <el-descriptions-item label="设备名称">{{ row.deviceName }}</el-descriptions-item>
                <el-descriptions-item label="设备类型">{{ getDeviceTypeLabel(row.deviceType) }}</el-descriptions-item>
                <el-descriptions-item label="借用数量">{{ row.quantity }} 台/套</el-descriptions-item>
                <el-descriptions-item label="借用用途">{{ getPurposeLabel(row.purpose) }}</el-descriptions-item>
                <el-descriptions-item label="用途说明" :span="2">{{ row.purposeDetail }}</el-descriptions-item>
                <el-descriptions-item label="借用时间" :span="2">
                  {{ row.borrowTime }} 至 {{ row.returnTime }}
                  （共 {{ row.borrowDays }} 天）
                </el-descriptions-item>
                <el-descriptions-item v-if="row.projectCode" label="科研项目编号">{{ row.projectCode }}</el-descriptions-item>
                <el-descriptions-item v-if="row.competitionProof" label="竞赛凭证">
                  <el-link type="primary" :href="row.competitionProof" target="_blank">查看凭证</el-link>
                </el-descriptions-item>
                <el-descriptions-item label="申请时间" :span="2">{{ row.applyTime }}</el-descriptions-item>
                
                <!-- 审批流程 -->
                <el-descriptions-item label="审批流程" :span="2">
                  <el-steps :active="row.approvalStep" align-center>
                    <el-step 
                      v-for="step in row.approvalFlow" 
                      :key="step.step"
                      :title="step.title"
                      :description="step.description"
                      :status="step.status"
                    />
                  </el-steps>
                </el-descriptions-item>

                <!-- 已审批的意见 -->
                <el-descriptions-item v-if="row.approvalOpinions && row.approvalOpinions.length > 0" label="审批意见" :span="2">
                  <div v-for="opinion in row.approvalOpinions" :key="opinion.step" class="approval-opinion">
                    <el-tag :type="opinion.result === 'approved' ? 'success' : 'danger'">
                      {{ opinion.approver }} - {{ opinion.result === 'approved' ? '通过' : '拒绝' }}
                    </el-tag>
                    <span class="opinion-time">{{ opinion.time }}</span>
                    <p v-if="opinion.comment">{{ opinion.comment }}</p>
                  </div>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="applicationNo" label="申请编号" width="150" />
        <el-table-column prop="applicant" label="申请人" width="100" />
        <el-table-column prop="deviceName" label="设备名称" width="180" />
        <el-table-column prop="quantity" label="数量" width="80" />
        <el-table-column prop="borrowTime" label="借用时间" width="180" />
        <el-table-column prop="applyTime" label="申请时间" width="180" />
        <el-table-column prop="currentApprover" label="当前审批人" width="120" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getApprovalStatusType(row.status)">
              {{ getApprovalStatusLabel(row.status) }}
            </el-tag>

          </template>

          </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="row.needMyApproval" 
              type="success" 
              size="small" 
              @click="handleApprove(row, 'approved')"
            >
              通过
            </el-button>
            <el-button 
              v-if="row.needMyApproval" 
              type="danger" 
              size="small" 
              @click="handleApprove(row, 'rejected')"
            >
              拒绝
            </el-button>
            <el-button 
              v-if="!row.needMyApproval && row.status === 'pending'" 
              type="info" 
              size="small" 
              disabled
            >
              等待前序审批
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; justify-content: center"
      />
    </el-card>

    <!-- 审批对话框 -->
    <el-dialog v-model="approvalDialogVisible" :title="approvalTitle" width="500px">
      <el-form :model="approvalForm" label-width="100px">
        <el-form-item label="审批结果">
          <el-tag :type="approvalForm.result === 'approved' ? 'success' : 'danger'">
            {{ approvalForm.result === 'approved' ? '通过' : '拒绝' }}
          </el-tag>
        </el-form-item>
        <el-form-item label="审批意见">
          <el-input
            v-model="approvalForm.comment"
            type="textarea"
            :rows="4"
            placeholder="请填写审批意见（选填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="approvalDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmApproval">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const currentUser = ref({ name: '张老师', role: 'admin' }) // 当前登录用户

// 筛选条件
const filterType = ref('')
const filterDeviceType = ref('')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 审批列表数据（模拟）
const approvals = ref([
  {
    applicationNo: 'BRW202402090003',
    applicant: '李明',
    applicantRole: 'student',
    contact: '13800138001',
    deviceName: '示波器DSO-X 3024A',
    deviceType: 'teaching',
    quantity: 1,
    purpose: 'course',
    purposeDetail: '电路分析课程实验需要使用',
    borrowTime: '2024-02-12 09:00',
    returnTime: '2024-02-19 18:00',
    borrowDays: 7,
    applyTime: '2024-02-09 10:30',
    status: 'pending',
    currentApprover: '张老师',
    needMyApproval: true,
    approvalStep: 0,
    approvalFlow: [
      { step: 0, title: '实验室管理员审批', description: '张老师', status: 'process' }
    ],
    approvalOpinions: []
  },
  {
    applicationNo: 'BRW202402090004',
    applicant: '王芳',
    applicantRole: 'student',
    contact: '13800138002',
    deviceName: '3D打印机Ultimaker S5',
    deviceType: 'competition',
    quantity: 1,
    purpose: 'competition',
    purposeDetail: '参加全国大学生机械创新设计大赛，需要制作模型',
    competitionProof: 'https://example.com/proof.pdf',
    borrowTime: '2024-02-15 09:00',
    returnTime: '2024-03-01 18:00',
    borrowDays: 15,
    applyTime: '2024-02-09 11:00',
    status: 'pending',
    currentApprover: '李教授',
    needMyApproval: false,
    approvalStep: 0,
    approvalFlow: [
      { step: 0, title: '指导教师审批', description: '李教授', status: 'process' },
      { step: 1, title: '实验室管理员审批', description: '张老师', status: 'wait' }
    ],
    approvalOpinions: []
  },
  {
    applicationNo: 'BRW202402090005',
    applicant: '赵刚',
    applicantRole: 'teacher',
    contact: '13800138003',
    deviceName: '激光干涉仪',
    deviceType: 'research',
    quantity: 1,
    purpose: 'research',
    purposeDetail: '精密测量科研项目需要',
    projectCode: 'PROJ2024001',
    borrowTime: '2024-02-20 09:00',
    returnTime: '2024-05-20 18:00',
    borrowDays: 90,
    applyTime: '2024-02-09 14:00',
    status: 'approved',
    currentApprover: '-',
    needMyApproval: false,
    approvalStep: 1,
    approvalFlow: [
      { step: 0, title: '实验室管理员审批', description: '张老师', status: 'finish' }
    ],
    approvalOpinions: [
      {
        step: 0,
        approver: '张老师',
        result: 'approved',
        comment: '科研项目编号核实无误，同意借用',
        time: '2024-02-09 15:30'
      }
    ]
  }
])

// 审批对话框
const approvalDialogVisible = ref(false)
const approvalTitle = ref('')
const approvalForm = reactive({
  applicationNo: '',
  result: '',
  comment: ''
})
const currentApprovalRow = ref(null)

// 筛选后的数据
const filteredApprovals = computed(() => {
  let result = approvals.value

  if (filterType.value === 'pending') {
    result = result.filter(item => item.needMyApproval)
  } else if (filterType.value === 'processed') {
    result = result.filter(item => !item.needMyApproval && item.status !== 'pending')
  }

  if (filterDeviceType.value) {
    result = result.filter(item => item.deviceType === filterDeviceType.value)
  }

  total.value = result.length
  return result
})

// 处理审批
const handleApprove = (row, result) => {
  currentApprovalRow.value = row
  approvalForm.applicationNo = row.applicationNo
  approvalForm.result = result
  approvalForm.comment = ''
  approvalTitle.value = result === 'approved' ? '通过申请' : '拒绝申请'
  approvalDialogVisible.value = true
}

// 确认审批
const confirmApproval = () => {
  const data = {
    applicationNo: approvalForm.applicationNo,
    result: approvalForm.result,
    comment: approvalForm.comment,
    approver: currentUser.value.name,
    approveTime: new Date().toLocaleString('zh-CN')
  }

  // 调用API提交审批
  console.log('提交审批:', data)

  // 更新本地数据（实际应该重新加载）
  const index = approvals.value.findIndex(item => item.applicationNo === approvalForm.applicationNo)
  if (index !== -1) {
    if (approvalForm.result === 'approved') {
      // 判断是否还有下一级审批
      const nextStep = approvals.value[index].approvalStep + 1
      if (nextStep >= approvals.value[index].approvalFlow.length) {
        // 审批完成
        approvals.value[index].status = 'approved'
        approvals.value[index].needMyApproval = false
      } else {
        // 流转到下一级
        approvals.value[index].approvalStep = nextStep
        approvals.value[index].needMyApproval = false
        approvals.value[index].currentApprover = approvals.value[index].approvalFlow[nextStep].description
      }
    } else {
      // 拒绝
      approvals.value[index].status = 'rejected'
      approvals.value[index].needMyApproval = false
    }

    // 添加审批意见
    approvals.value[index].approvalOpinions.push({
      step: approvals.value[index].approvalStep,
      approver: currentUser.value.name,
      result: approvalForm.result,
      comment: approvalForm.comment,
      time: new Date().toLocaleString('zh-CN')
    })
  }

  ElMessage.success('审批成功')
  approvalDialogVisible.value = false
}

// 辅助函数
const getDeviceTypeLabel = (type) => {
  const map = {
    teaching: '教学设备',
    research: '科研设备',
    competition: '竞赛设备'
  }
  return map[type] || type
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

const getApprovalStatusLabel = (status) => {
  const map = {
    pending: '待审批',
    approved: '已批准',
    rejected: '已拒绝'
  }
  return map[status] || status
}

const getApprovalStatusType = (status) => {
  const map = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return map[status] || 'info'
}
</script>

<style scoped>
.approval-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.expand-content {
  padding: 20px;
}

.approval-opinion {
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.opinion-time {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}

.approval-opinion p {
  margin-top: 8px;
  color: #606266;
}
</style>
