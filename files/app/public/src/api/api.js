import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 添加token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data
    
    // 根据实际的API返回格式调整
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败')
      
      // 401: 未登录
      if (res.code === 401) {
        // 跳转到登录页
        window.location.href = '/login'
      }
      
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    
    return res
  },
  error => {
    console.error('响应错误:', error)
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

// ==================== 借用规则相关API ====================

/**
 * 获取借用规则配置
 */
export const getBorrowRules = () => {
  return request.get('/borrow-rules')
}

/**
 * 保存借用规则配置
 */
export const saveBorrowRules = (data) => {
  return request.post('/borrow-rules', data)
}

// ==================== 借用申请相关API ====================

/**
 * 获取可用设备列表
 */
export const getAvailableDevices = (params) => {
  return request.get('/devices/available', { params })
}

/**
 * 检测借用时间冲突
 */
export const checkBorrowConflict = (data) => {
  return request.post('/borrow/check-conflict', data)
}

/**
 * 提交借用申请
 */
export const submitBorrowApplication = (data) => {
  return request.post('/borrow-applications', data)
}

/**
 * 获取我的申请列表
 */
export const getMyApplications = (params) => {
  return request.get('/borrow-applications/my', { params })
}

/**
 * 撤销借用申请
 */
export const cancelApplication = (applicationNo) => {
  return request.delete(`/borrow-applications/${applicationNo}`)
}

/**
 * 申请延期
 */
export const applyExtension = (data) => {
  return request.post('/borrow-applications/extension', data)
}

// ==================== 审批管理相关API ====================

/**
 * 获取待审批列表
 */
export const getApprovalList = (params) => {
  return request.get('/approvals', { params })
}

/**
 * 审批申请
 */
export const approveApplication = (data) => {
  return request.post('/approvals/approve', data)
}

// ==================== 借出归还操作相关API ====================

/**
 * 根据设备编号获取设备信息
 */
export const getDeviceByCode = (code) => {
  return request.get(`/devices/code/${code}`)
}

/**
 * 根据用户ID获取申请人信息
 */
export const getApplicantById = (id) => {
  return request.get(`/users/${id}`)
}

/**
 * 确认借出
 */
export const confirmBorrow = (data) => {
  return request.post('/borrow/confirm', data)
}

/**
 * 根据设备编号获取借用信息
 */
export const getBorrowInfoByDeviceCode = (code) => {
  return request.get(`/borrow/device/${code}`)
}

/**
 * 确认归还
 */
export const confirmReturn = (data) => {
  return request.post('/borrow/return', data)
}

/**
 * 获取借还记录
 */
export const getBorrowReturnRecords = (params) => {
  return request.get('/borrow-records', { params })
}

// ==================== 延期与逾期管理相关API ====================

/**
 * 获取延期申请列表
 */
export const getExtensionApplications = (params) => {
  return request.get('/extensions', { params })
}

/**
 * 审批延期申请
 */
export const approveExtension = (data) => {
  return request.post('/extensions/approve', data)
}

/**
 * 获取逾期设备列表
 */
export const getOverdueDevices = (params) => {
  return request.get('/borrow/overdue', { params })
}

/**
 * 发送逾期提醒
 */
export const sendOverdueRemind = (data) => {
  return request.post('/borrow/remind', data)
}

/**
 * 限制借用权限
 */
export const restrictBorrow = (userId) => {
  return request.post(`/users/${userId}/restrict`)
}

/**
 * 获取即将到期设备列表
 */
export const getExpiringDevices = (params) => {
  return request.get('/borrow/expiring', { params })
}

// ==================== 文件上传相关API ====================

/**
 * 上传文件
 */
export const uploadFile = (file, onProgress) => {
  const formData = new FormData()
  formData.append('file', file)
  
  return request.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(percentCompleted)
      }
    }
  })
}

export default request
