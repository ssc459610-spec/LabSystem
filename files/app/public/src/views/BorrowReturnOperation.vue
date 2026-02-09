<template>
  <div class="borrow-return-operation">
    <!-- 借出操作 -->
    <el-card class="operation-card">
      <template #header>
        <div class="card-header">
          <span>设备借出操作</span>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <!-- 管理员操作 -->
        <el-tab-pane label="管理员借出" name="admin">
          <el-form :model="borrowForm" :rules="borrowRules" ref="borrowFormRef" label-width="140px">
            <el-form-item label="扫码/输入设备" prop="deviceCode">
              <el-input 
                v-model="borrowForm.deviceCode" 
                placeholder="扫描设备二维码或手动输入设备编号"
                @keyup.enter="handleLoadDevice"
              >
                <template #append>
                  <el-button icon="Search" @click="handleLoadDevice">查询</el-button>
                </template>
              </el-input>
            </el-form-item>

            <!-- 设备信息展示 -->
            <el-card v-if="deviceInfo" class="device-info-card" shadow="never">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="设备名称">{{ deviceInfo.name }}</el-descriptions-item>
                <el-descriptions-item label="设备编号">{{ deviceInfo.code }}</el-descriptions-item>
                <el-descriptions-item label="设备类型">{{ getDeviceTypeLabel(deviceInfo.type) }}</el-descriptions-item>
                <el-descriptions-item label="设备状态">
                  <el-tag :type="getDeviceStatusType(deviceInfo.status)">
                    {{ getDeviceStatusLabel(deviceInfo.status) }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="配件清单" :span="2">
                  <el-tag v-for="accessory in deviceInfo.accessories" :key="accessory" style="margin-right: 5px">
                    {{ accessory }}
                  </el-tag>
                </el-descriptions-item>
              </el-descriptions>
            </el-card>

            <el-form-item label="申请人信息" prop="applicantId">
              <el-input 
                v-model="borrowForm.applicantId" 
                placeholder="扫描申请人卡号或输入学号/工号"
                @keyup.enter="handleLoadApplicant"
              >
                <template #append>
                  <el-button icon="Search" @click="handleLoadApplicant">查询</el-button>
                </template>
              </el-input>
            </el-form-item>

            <!-- 申请人信息展示 -->
            <el-card v-if="applicantInfo" class="applicant-info-card" shadow="never">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="姓名">{{ applicantInfo.name }}</el-descriptions-item>
                <el-descriptions-item label="角色">
                  <el-tag :type="applicantInfo.role === 'teacher' ? 'success' : 'info'">
                    {{ applicantInfo.role === 'teacher' ? '教师' : '学生' }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="联系方式">{{ applicantInfo.contact }}</el-descriptions-item>
                <el-descriptions-item label="申请单号">{{ applicantInfo.applicationNo }}</el-descriptions-item>
              </el-descriptions>
            </el-card>

            <el-form-item label="设备外观检查" prop="appearanceCheck">
              <el-checkbox-group v-model="borrowForm.appearanceCheck">
                <el-checkbox label="外观无划痕破损">外观无划痕破损</el-checkbox>
                <el-checkbox label="配件完整齐全">配件完整齐全</el-checkbox>
                <el-checkbox label="功能正常">功能正常</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="设备拍照留存">
              <el-upload
                class="upload-demo"
                action="#"
                list-type="picture-card"
                :auto-upload="false"
                :on-change="handlePhotoChange"
                :limit="3"
              >
                <el-icon><Plus /></el-icon>
              </el-upload>
            </el-form-item>

            <el-form-item label="备注说明">
              <el-input v-model="borrowForm.remark" type="textarea" :rows="3" placeholder="可填写特殊说明" />
            </el-form-item>

            <el-form-item>
              <el-button 
                type="primary" 
                @click="handleConfirmBorrow" 
                :disabled="!canConfirmBorrow"
              >
                确认借出
              </el-button>
              <el-button @click="handleResetBorrow">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 自助终端操作 -->
        <el-tab-pane label="自助终端" name="self">
          <el-result
            icon="info"
            title="自助借出终端"
            sub-title="请使用校园卡刷卡登录，然后扫描设备二维码完成借出"
          >
            <template #extra>
              <el-button type="primary" size="large">模拟刷卡登录</el-button>
            </template>
          </el-result>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 归还操作 -->
    <el-card class="operation-card">
      <template #header>
        <div class="card-header">
          <span>设备归还操作</span>
        </div>
      </template>

      <el-form :model="returnForm" :rules="returnRules" ref="returnFormRef" label-width="140px">
        <el-form-item label="扫码/输入设备" prop="deviceCode">
          <el-input 
            v-model="returnForm.deviceCode" 
            placeholder="扫描设备二维码或手动输入设备编号"
            @keyup.enter="handleLoadReturnDevice"
          >
            <template #append>
              <el-button icon="Search" @click="handleLoadReturnDevice">查询</el-button>
            </template>
          </el-input>
        </el-form-item>

        <!-- 借用信息展示 -->
        <el-card v-if="borrowInfo" class="borrow-info-card" shadow="never">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="借出单号">{{ borrowInfo.borrowNo }}</el-descriptions-item>
            <el-descriptions-item label="借用人">{{ borrowInfo.borrower }}</el-descriptions-item>
            <el-descriptions-item label="设备名称">{{ borrowInfo.deviceName }}</el-descriptions-item>
            <el-descriptions-item label="借出时间">{{ borrowInfo.borrowTime }}</el-descriptions-item>
            <el-descriptions-item label="预计归还">{{ borrowInfo.expectedReturnTime }}</el-descriptions-item>
            <el-descriptions-item label="是否逾期">
              <el-tag :type="borrowInfo.isOverdue ? 'danger' : 'success'">
                {{ borrowInfo.isOverdue ? `逾期${borrowInfo.overdueDays}天` : '未逾期' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="借出配件" :span="2">
              <el-tag v-for="accessory in borrowInfo.accessories" :key="accessory" style="margin-right: 5px">
                {{ accessory }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-form-item label="外观检查" prop="appearanceStatus">
          <el-radio-group v-model="returnForm.appearanceStatus">
            <el-radio label="normal">外观完好</el-radio>
            <el-radio label="damaged">有损坏</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 损坏详情 -->
        <div v-if="returnForm.appearanceStatus === 'damaged'" class="damage-detail">
          <el-form-item label="损坏程度" prop="damageLevel">
            <el-select v-model="returnForm.damageLevel" placeholder="请选择损坏程度">
              <el-option label="轻微（不影响使用）" value="minor" />
              <el-option label="中等（影响部分功能）" value="moderate" />
              <el-option label="严重（无法使用）" value="severe" />
            </el-select>
          </el-form-item>

          <el-form-item label="损坏描述" prop="damageDescription">
            <el-input 
              v-model="returnForm.damageDescription" 
              type="textarea" 
              :rows="3"
              placeholder="请详细描述损坏情况"
            />
          </el-form-item>

          <el-form-item label="损坏拍照">
            <el-upload
              class="upload-demo"
              action="#"
              list-type="picture-card"
              :auto-upload="false"
              :on-change="handleDamagePhotoChange"
              :limit="5"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
          </el-form-item>

          <el-form-item label="预估赔偿金额">
            <el-input-number v-model="returnForm.compensationAmount" :min="0" :precision="2" />
            <span style="margin-left: 10px">元</span>
          </el-form-item>
        </div>

        <el-form-item label="配件完整性" prop="accessoriesCheck">
          <el-checkbox-group v-model="returnForm.accessoriesCheck">
            <el-checkbox 
              v-for="accessory in borrowInfo?.accessories || []" 
              :key="accessory" 
              :label="accessory"
            >
              {{ accessory }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="性能测试" prop="performanceTest">
          <el-radio-group v-model="returnForm.performanceTest">
            <el-radio label="passed">开机测试通过</el-radio>
            <el-radio label="failed">测试失败</el-radio>
            <el-radio label="skip">跳过测试</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="归还备注">
          <el-input v-model="returnForm.remark" type="textarea" :rows="3" placeholder="可填写特殊说明" />
        </el-form-item>

        <el-form-item>
          <el-button 
            type="primary" 
            @click="handleConfirmReturn" 
            :disabled="!canConfirmReturn"
          >
            确认归还
          </el-button>
          <el-button @click="handleResetReturn">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 借还记录 -->
    <el-card class="operation-card">
      <template #header>
        <div class="card-header">
          <span>今日借还记录</span>
          <el-radio-group v-model="recordType" size="small">
            <el-radio-button label="borrow">借出记录</el-radio-button>
            <el-radio-button label="return">归还记录</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <el-table :data="currentRecords" border style="width: 100%">
        <el-table-column prop="recordNo" label="记录编号" width="150" />
        <el-table-column prop="deviceName" label="设备名称" width="180" />
        <el-table-column prop="userName" label="借用人" width="100" />
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column prop="operateTime" label="操作时间" width="180" />
        <el-table-column v-if="recordType === 'return'" prop="status" label="归还状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.hasDamage ? 'danger' : 'success'">
              {{ row.hasDamage ? '有损坏' : '完好' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const activeTab = ref('admin')
const recordType = ref('borrow')

// 借出表单
const borrowFormRef = ref(null)
const borrowForm = reactive({
  deviceCode: '',
  applicantId: '',
  appearanceCheck: [],
  photos: [],
  remark: ''
})

const borrowRules = {
  deviceCode: [{ required: true, message: '请输入设备编号', trigger: 'blur' }],
  applicantId: [{ required: true, message: '请输入申请人信息', trigger: 'blur' }],
  appearanceCheck: [{ type: 'array', min: 3, message: '请完成所有检查项', trigger: 'change' }]
}

// 设备信息
const deviceInfo = ref(null)
// 申请人信息
const applicantInfo = ref(null)

// 归还表单
const returnFormRef = ref(null)
const returnForm = reactive({
  deviceCode: '',
  appearanceStatus: 'normal',
  damageLevel: '',
  damageDescription: '',
  damagePhotos: [],
  compensationAmount: 0,
  accessoriesCheck: [],
  performanceTest: 'passed',
  remark: ''
})

const returnRules = {
  deviceCode: [{ required: true, message: '请输入设备编号', trigger: 'blur' }],
  appearanceStatus: [{ required: true, message: '请选择外观状态', trigger: 'change' }],
  performanceTest: [{ required: true, message: '请选择性能测试结果', trigger: 'change' }]
}

// 借用信息
const borrowInfo = ref(null)

// 借还记录
const borrowRecords = ref([
  {
    recordNo: 'BOR202402090001',
    deviceName: '示波器DSO-X 3024A',
    userName: '李明',
    operator: '张老师',
    operateTime: '2024-02-09 09:30',
    remark: '借出正常'
  }
])

const returnRecords = ref([
  {
    recordNo: 'RET202402090001',
    deviceName: 'Arduino开发套件',
    userName: '王芳',
    operator: '张老师',
    operateTime: '2024-02-09 10:15',
    hasDamage: false,
    remark: '归还正常，设备完好'
  }
])

// 计算属性
const canConfirmBorrow = computed(() => {
  return deviceInfo.value && applicantInfo.value && borrowForm.appearanceCheck.length === 3
})

const canConfirmReturn = computed(() => {
  return borrowInfo.value && returnForm.appearanceStatus
})

const currentRecords = computed(() => {
  return recordType.value === 'borrow' ? borrowRecords.value : returnRecords.value
})

// 加载设备信息
const handleLoadDevice = () => {
  if (!borrowForm.deviceCode) {
    ElMessage.warning('请输入设备编号')
    return
  }

  // 模拟从API加载设备信息
  deviceInfo.value = {
    id: '1',
    name: '示波器DSO-X 3024A',
    code: borrowForm.deviceCode,
    type: 'teaching',
    status: 'available',
    accessories: ['电源线', '探头×2', '说明书', '校准证书']
  }
  ElMessage.success('设备信息加载成功')
}

// 加载申请人信息
const handleLoadApplicant = () => {
  if (!borrowForm.applicantId) {
    ElMessage.warning('请输入申请人信息')
    return
  }

  // 模拟从API加载申请人信息（需要关联审批通过的申请单）
  applicantInfo.value = {
    id: borrowForm.applicantId,
    name: '李明',
    role: 'student',
    contact: '13800138001',
    applicationNo: 'BRW202402090003'
  }
  ElMessage.success('申请人信息加载成功')
}

// 照片变化
const handlePhotoChange = (file, fileList) => {
  borrowForm.photos = fileList
}

const handleDamagePhotoChange = (file, fileList) => {
  returnForm.damagePhotos = fileList
}

// 确认借出
const handleConfirmBorrow = () => {
  borrowFormRef.value.validate((valid) => {
    if (valid) {
      const data = {
        deviceId: deviceInfo.value.id,
        applicantId: applicantInfo.value.id,
        applicationNo: applicantInfo.value.applicationNo,
        appearanceCheck: borrowForm.appearanceCheck,
        photos: borrowForm.photos,
        remark: borrowForm.remark,
        borrowTime: new Date().toLocaleString('zh-CN')
      }

      // 调用API确认借出
      console.log('确认借出:', data)
      ElMessage.success('借出确认成功，设备状态已更新为"已借用"')
      
      // 添加到借出记录
      borrowRecords.value.unshift({
        recordNo: `BOR${Date.now()}`,
        deviceName: deviceInfo.value.name,
        userName: applicantInfo.value.name,
        operator: '张老师',
        operateTime: new Date().toLocaleString('zh-CN'),
        remark: borrowForm.remark || '借出正常'
      })

      handleResetBorrow()
    }
  })
}

// 重置借出表单
const handleResetBorrow = () => {
  borrowFormRef.value.resetFields()
  deviceInfo.value = null
  applicantInfo.value = null
  borrowForm.photos = []
}

// 加载归还设备信息
const handleLoadReturnDevice = () => {
  if (!returnForm.deviceCode) {
    ElMessage.warning('请输入设备编号')
    return
  }

  // 模拟从API加载借用信息
  borrowInfo.value = {
    borrowNo: 'BOR202402090001',
    deviceId: '1',
    deviceName: '示波器DSO-X 3024A',
    borrower: '李明',
    borrowTime: '2024-02-09 09:30',
    expectedReturnTime: '2024-02-16 18:00',
    isOverdue: false,
    overdueDays: 0,
    accessories: ['电源线', '探头×2', '说明书', '校准证书']
  }
  
  // 初始化配件检查
  returnForm.accessoriesCheck = [...borrowInfo.value.accessories]
  
  ElMessage.success('借用信息加载成功')
}

// 确认归还
const handleConfirmReturn = () => {
  returnFormRef.value.validate((valid) => {
    if (valid) {
      const hasDamage = returnForm.appearanceStatus === 'damaged'
      
      const data = {
        borrowNo: borrowInfo.value.borrowNo,
        deviceId: borrowInfo.value.deviceId,
        appearanceStatus: returnForm.appearanceStatus,
        damageLevel: returnForm.damageLevel,
        damageDescription: returnForm.damageDescription,
        damagePhotos: returnForm.damagePhotos,
        compensationAmount: returnForm.compensationAmount,
        accessoriesCheck: returnForm.accessoriesCheck,
        performanceTest: returnForm.performanceTest,
        remark: returnForm.remark,
        returnTime: new Date().toLocaleString('zh-CN')
      }

      // 调用API确认归还
      console.log('确认归还:', data)
      
      if (hasDamage) {
        ElMessage.warning('设备有损坏，已记录损坏信息，请联系借用人处理赔偿事宜')
      } else {
        ElMessage.success('归还确认成功，设备状态已更新为"可借用"')
      }

      // 添加到归还记录
      returnRecords.value.unshift({
        recordNo: `RET${Date.now()}`,
        deviceName: borrowInfo.value.deviceName,
        userName: borrowInfo.value.borrower,
        operator: '张老师',
        operateTime: new Date().toLocaleString('zh-CN'),
        hasDamage: hasDamage,
        remark: returnForm.remark || (hasDamage ? '设备有损坏' : '归还正常，设备完好')
      })

      handleResetReturn()
    }
  })
}

// 重置归还表单
const handleResetReturn = () => {
  returnFormRef.value.resetFields()
  borrowInfo.value = null
  returnForm.damagePhotos = []
  returnForm.accessoriesCheck = []
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

const getDeviceStatusLabel = (status) => {
  const map = {
    available: '可借用',
    borrowed: '已借用',
    maintenance: '维护中',
    repair: '维修中'
  }
  return map[status] || status
}

const getDeviceStatusType = (status) => {
  const map = {
    available: 'success',
    borrowed: 'warning',
    maintenance: 'info',
    repair: 'danger'
  }
  return map[status] || 'info'
}
</script>

<style scoped>
.borrow-return-operation {
  padding: 20px;
}

.operation-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.device-info-card,
.applicant-info-card,
.borrow-info-card {
  margin-bottom: 20px;
  background-color: #f5f7fa;
}

.damage-detail {
  padding: 15px;
  background-color: #fef0f0;
  border-radius: 4px;
  margin-bottom: 20px;
}

.upload-demo {
  width: 100%;
}
</style>
