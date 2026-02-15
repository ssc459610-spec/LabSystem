import { createRouter, createWebHistory } from "vue-router";

// 导入组件 (保留你原来的导入)
import BorrowRuleConfig from "../views/BorrowRuleConfig.vue";
import BorrowApplication from "../views/BorrowApplication.vue";
// import ApprovalManagement from "../views/ApprovalManagement.vue"; // 暂时注释，防报错，确认有文件后再解开
// import BorrowReturnOperation from "../views/BorrowReturnOperation.vue";
// import ExtensionOverdueManagement from "../views/ExtensionOverdueManagement.vue";
import AssetModule from "../views/AssetModule.vue"; // 你的资产组件
import AssetEntry from "../views/AssetEntry.vue";
import AssetScrap from "../views/AssetScrap.vue";

// 为了防止队友文件还没建好报错，我们先定义一个临时组件
// 等队友文件到位了，把上面的 import 解开，把下面的 TempComponent 删掉即可
const TempComponent = AssetModule;
// const ApprovalManagement = TempComponent; // 如果文件有了，把这行删掉
// const BorrowReturnOperation = TempComponent;
// const ExtensionOverdueManagement = TempComponent;

const routes = [
  // ================= 3.1 资产与设备全生命周期 (对应新侧边栏) =================
  {
    path: "/asset-info",
    name: "AssetInfo",
    component: AssetModule,
    meta: {
      title: "设备基础信息库",
      requiresAuth: true,
      roles: ["student", "teacher", "admin"],
    },
  },
  {
    path: "/asset-entry",
    name: "AssetEntry",
    component: AssetEntry, // 暂时用资产表顶替
    meta: { title: "入库与台账管理", requiresAuth: true, roles: ["admin"] },
  },
  {
    path: "/asset-scrap",
    name: "AssetScrap",
    component: AssetScrap,
    meta: { title: "报废与处置管理", requiresAuth: true, roles: ["admin"] },
  },
  // 兼容旧路径 (防止有人访问旧书签)
  {
    path: "/assets",
    redirect: "/asset-info",
  },

  // ================= 3.2 借用与归还管理 (保留原权限) =================
  {
    path: "/",
    redirect: "/asset-info", // 首页改去资产库
  },
  {
    path: "/borrow-application",
    name: "BorrowApplication",
    component: BorrowApplication,
    meta: {
      title: "借用申请",
      requiresAuth: true,
      roles: ["student", "teacher", "admin"],
    },
  },
  {
    path: "/approval-management",
    name: "ApprovalManagement",
    // 动态引入，防报错
    component: () =>
      import("../views/ApprovalManagement.vue").catch(() => TempComponent),
    meta: {
      title: "审批管理",
      requiresAuth: true,
      roles: ["teacher", "admin", "super_admin"],
    },
  },
  {
    path: "/borrow-return-operation",
    name: "BorrowReturnOperation",
    component: () =>
      import("../views/BorrowReturnOperation.vue").catch(() => TempComponent),
    meta: {
      title: "借出归还操作",
      requiresAuth: true,
      roles: ["admin", "super_admin"],
    },
  },
  {
    path: "/extension-overdue-management",
    name: "ExtensionOverdueManagement",
    component: () =>
      import("../views/ExtensionOverdueManagement.vue").catch(
        () => TempComponent,
      ),
    meta: {
      title: "延期与逾期管理",
      requiresAuth: true,
      roles: ["admin", "super_admin"],
    },
  },
  {
    path: "/borrow-rule-config",
    name: "BorrowRuleConfig",
    component: BorrowRuleConfig,
    meta: {
      title: "借用规则配置",
      requiresAuth: true,
      roles: ["admin", "super_admin"],
    },
  },

  // ================= 其他占位路由 (防止侧边栏点击 404) =================
  {
    path: "/fault-report",
    component: TempComponent,
    meta: { title: "故障报修" },
  },
  {
    path: "/maintenance-log",
    component: TempComponent,
    meta: { title: "维护日志" },
  },
  {
    path: "/inspection",
    component: TempComponent,
    meta: { title: "定期巡检" },
  },
  {
    path: "/consumable-stock",
    component: TempComponent,
    meta: { title: "耗材库存" },
  },
  {
    path: "/consumable-procurement",
    component: TempComponent,
    meta: { title: "采购申请" },
  },
  {
    path: "/consumable-claim",
    component: TempComponent,
    meta: { title: "耗材领用" },
  },
  {
    path: "/stock-check",
    component: TempComponent,
    meta: { title: "库存盘点" },
  },
  {
    path: "/stats-dashboard",
    component: TempComponent,
    meta: { title: "统计大屏" },
  },
  { path: "/stats-usage", component: TempComponent },
  { path: "/stats-cost", component: TempComponent },
  { path: "/stats-fault", component: TempComponent },
  {
    path: "/user-permission",
    component: TempComponent,
    meta: { title: "用户权限" },
  },
  { path: "/audit-log", component: TempComponent },
  { path: "/notification-config", component: TempComponent },
  {
    path: "/device-monitor",
    component: TempComponent,
    meta: { title: "设备监控" },
  },
  { path: "/remote-console", component: TempComponent },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// ================= 路由守卫 (原封不动保留) =================
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 设备借用管理系统`;
  }

  // 权限验证
  // 注意：如果你要测试 "admin" 权限，请确保这里 userRole 是 admin
  // 如果你在 App.vue 里是 admin，这里也要是 admin，否则会被踢到 /unauthorized
  if (to.meta.requiresAuth) {
    // 模拟登录状态 (实际开发请改为从 store 获取)
    const isLoggedIn = true;

    if (!isLoggedIn) {
      next("/login"); // 这里的 /login 页面还没做，可能会白屏，注意
      return;
    }

    // 检查用户角色
    if (to.meta.roles) {
      // 🔴 关键点：这里模拟当前用户是 admin，这样你可以看到所有页面
      // 以后记得改成 const userStore = useUserStore(); const userRole = userStore.role;
      const userRole = "admin";

      if (!to.meta.roles.includes(userRole)) {
        // 如果没有 /unauthorized 页面，暂时跳回首页或 alert
        console.warn("无权访问:", to.path);
        // next("/unauthorized");
        next(false); // 暂时禁止跳转
        return;
      }
    }
  }

  next();
});

export default router;
