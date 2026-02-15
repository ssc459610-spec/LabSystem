import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as api from '../api/api'

// 用户信息store
export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)
  const token = ref(localStorage.getItem('token') || '')

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const userRole = computed(() => userInfo.value?.role || '')
  const userName = computed(() => userInfo.value?.name || '')

  // 登录
  const login = async (credentials) => {
    try {
      // 调用登录API（实际需要实现）
      const response = await api.login(credentials)
      token.value = response.data.token
      userInfo.value = response.data.userInfo
      localStorage.setItem('token', token.value)
      return true
    } catch (error) {
      console.error('登录失败:', error)
      return false
    }
  }

  // 登出
  const logout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }

  // 获取用户信息
  const getUserInfo = async () => {
    try {
      // 调用获取用户信息API（实际需要实现）
      const response = await api.getUserInfo()
      userInfo.value = response.data
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }

  return {
    userInfo,
    token,
    isLoggedIn,
    userRole,
    userName,
    login,
    logout,
    getUserInfo
  }
})

// 设备借用store
export const useBorrowStore = defineStore('borrow', () => {
  const borrowRules = ref({
    durationRules: [],
    quantityRules: [],
    qualificationRules: []
  })
  
  const applications = ref([])
  const approvals = ref([])

  // 获取借用规则
  const loadBorrowRules = async () => {
    try {
      const response = await api.getBorrowRules()
      borrowRules.value = response.data
    } catch (error) {
      console.error('加载借用规则失败:', error)
    }
  }

  // 保存借用规则
  const saveBorrowRules = async (rules) => {
    try {
      await api.saveBorrowRules(rules)
      borrowRules.value = rules
      return true
    } catch (error) {
      console.error('保存借用规则失败:', error)
      return false
    }
  }

  // 获取我的申请列表
  const loadMyApplications = async (params) => {
    try {
      const response = await api.getMyApplications(params)
      applications.value = response.data.list
      return response.data
    } catch (error) {
      console.error('加载申请列表失败:', error)
      return { list: [], total: 0 }
    }
  }

  // 提交申请
  const submitApplication = async (data) => {
    try {
      const response = await api.submitBorrowApplication(data)
      // 重新加载申请列表
      await loadMyApplications()
      return true
    } catch (error) {
      console.error('提交申请失败:', error)
      return false
    }
  }

  // 获取审批列表
  const loadApprovals = async (params) => {
    try {
      const response = await api.getApprovalList(params)
      approvals.value = response.data.list
      return response.data
    } catch (error) {
      console.error('加载审批列表失败:', error)
      return { list: [], total: 0 }
    }
  }

  // 审批申请
  const approveApplication = async (data) => {
    try {
      await api.approveApplication(data)
      // 重新加载审批列表
      await loadApprovals()
      return true
    } catch (error) {
      console.error('审批失败:', error)
      return false
    }
  }

  // 根据角色和设备类型获取最大借用天数
  const getMaxDays = (role, deviceType) => {
    const rule = borrowRules.value.durationRules.find(
      r => r.role === role && r.deviceType === deviceType
    )
    return rule?.maxDays || 7
  }

  // 根据角色获取最大借用数量
  const getMaxQuantity = (role) => {
    const rule = borrowRules.value.quantityRules.find(r => r.role === role)
    return rule?.maxQuantity || 1
  }

  return {
    borrowRules,
    applications,
    approvals,
    loadBorrowRules,
    saveBorrowRules,
    loadMyApplications,
    submitApplication,
    loadApprovals,
    approveApplication,
    getMaxDays,
    getMaxQuantity
  }
})

// 设备管理store
export const useDeviceStore = defineStore('device', () => {
  const devices = ref([])
  const borrowRecords = ref([])
  const returnRecords = ref([])

  // 获取可用设备列表
  const loadAvailableDevices = async (params) => {
    try {
      const response = await api.getAvailableDevices(params)
      devices.value = response.data
      return response.data
    } catch (error) {
      console.error('加载设备列表失败:', error)
      return []
    }
  }

  // 根据设备编号获取设备信息
  const getDeviceByCode = async (code) => {
    try {
      const response = await api.getDeviceByCode(code)
      return response.data
    } catch (error) {
      console.error('获取设备信息失败:', error)
      return null
    }
  }

  // 确认借出
  const confirmBorrow = async (data) => {
    try {
      await api.confirmBorrow(data)
      // 重新加载借出记录
      await loadBorrowRecords()
      return true
    } catch (error) {
      console.error('确认借出失败:', error)
      return false
    }
  }

  // 确认归还
  const confirmReturn = async (data) => {
    try {
      await api.confirmReturn(data)
      // 重新加载归还记录
      await loadReturnRecords()
      return true
    } catch (error) {
      console.error('确认归还失败:', error)
      return false
    }
  }

  // 加载借出记录
  const loadBorrowRecords = async (params = {}) => {
    try {
      const response = await api.getBorrowReturnRecords({ ...params, type: 'borrow' })
      borrowRecords.value = response.data.list
      return response.data
    } catch (error) {
      console.error('加载借出记录失败:', error)
      return { list: [], total: 0 }
    }
  }

  // 加载归还记录
  const loadReturnRecords = async (params = {}) => {
    try {
      const response = await api.getBorrowReturnRecords({ ...params, type: 'return' })
      returnRecords.value = response.data.list
      return response.data
    } catch (error) {
      console.error('加载归还记录失败:', error)
      return { list: [], total: 0 }
    }
  }

  return {
    devices,
    borrowRecords,
    returnRecords,
    loadAvailableDevices,
    getDeviceByCode,
    confirmBorrow,
    confirmReturn,
    loadBorrowRecords,
    loadReturnRecords
  }
})

// 逾期管理store
export const useOverdueStore = defineStore('overdue', () => {
  const extensionApplications = ref([])
  const overdueDevices = ref([])
  const expiringDevices = ref([])

  // 加载延期申请列表
  const loadExtensionApplications = async (params) => {
    try {
      const response = await api.getExtensionApplications(params)
      extensionApplications.value = response.data.list
      return response.data
    } catch (error) {
      console.error('加载延期申请失败:', error)
      return { list: [], total: 0 }
    }
  }

  // 审批延期申请
  const approveExtension = async (data) => {
    try {
      await api.approveExtension(data)
      // 重新加载延期申请列表
      await loadExtensionApplications()
      return true
    } catch (error) {
      console.error('审批延期失败:', error)
      return false
    }
  }

  // 加载逾期设备列表
  const loadOverdueDevices = async (params) => {
    try {
      const response = await api.getOverdueDevices(params)
      overdueDevices.value = response.data.list
      return response.data
    } catch (error) {
      console.error('加载逾期设备失败:', error)
      return { list: [], total: 0 }
    }
  }

  // 发送逾期提醒
  const sendOverdueRemind = async (data) => {
    try {
      await api.sendOverdueRemind(data)
      // 重新加载逾期设备列表
      await loadOverdueDevices()
      return true
    } catch (error) {
      console.error('发送提醒失败:', error)
      return false
    }
  }

  // 加载即将到期设备列表
  const loadExpiringDevices = async (params) => {
    try {
      const response = await api.getExpiringDevices(params)
      expiringDevices.value = response.data.list
      return response.data
    } catch (error) {
      console.error('加载即将到期设备失败:', error)
      return { list: [], total: 0 }
    }
  }

  return {
    extensionApplications,
    overdueDevices,
    expiringDevices,
    loadExtensionApplications,
    approveExtension,
    loadOverdueDevices,
    sendOverdueRemind,
    loadExpiringDevices
  }
})
