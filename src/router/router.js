import { createRouter, createWebHistory } from "vue-router";

// ================= 1. 修改了这里的导入路径 (加上了文件夹名字) =================
import BorrowRuleConfig from "../views/borrow/BorrowRuleConfig.vue";
import BorrowApplication from "../views/borrow/BorrowApplication.vue";
import AssetModule from "../views/asset/AssetModule.vue"; // 你的资产组件
import AssetEntry from "../views/asset/AssetEntry.vue";
import AssetScrap from "../views/asset/AssetScrap.vue";

// 为了防止队友文件还没建好报错，我们先定义一个临时组件
const TempComponent = AssetModule;

const routes = [
  // ================= 3.1 资产与设备全生命周期 =================
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
    component: AssetEntry,
    meta: { title: "入库与台账管理", requiresAuth: true, roles: ["admin"] },
  },
  {
    path: "/asset-scrap",
    name: "AssetScrap",
    component: AssetScrap,
    meta: { title: "报废与处置管理", requiresAuth: true, roles: ["admin"] },
  },
  // 兼容旧路径
  {
    path: "/assets",
    redirect: "/asset-info",
  },

  // ================= 3.2 借用与归还管理 =================
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
    // ================= 2. 修改了这里的动态引入路径 =================
    component: () =>
      import("../views/approval/ApprovalManagement.vue").catch(
        () => TempComponent,
      ),
    meta: {
      title: "审批管理",
      requiresAuth: true,
      roles: ["teacher", "admin", "super_admin"],
    },
  },
  {
    path: "/borrow-return-operation",
    name: "BorrowReturnOperation",
    // ================= 3. 修改了这里的动态引入路径 =================
    component: () =>
      import("../views/borrow/BorrowReturnOperation.vue").catch(
        () => TempComponent,
      ),
    meta: {
      title: "借出归还操作",
      requiresAuth: true,
      roles: ["admin", "super_admin"],
    },
  },
  {
    path: "/extension-overdue-management",
    name: "ExtensionOverdueManagement",
    // ================= 4. 修改了这里的动态引入路径 =================
    component: () =>
      import("../views/approval/ExtensionOverdueManagement.vue").catch(
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
  if (to.meta.title) {
    document.title = `${to.meta.title} - 设备借用管理系统`;
  }
  if (to.meta.requiresAuth) {
    const isLoggedIn = true;
    if (!isLoggedIn) {
      next("/login");
      return;
    }
    if (to.meta.roles) {
      const userRole = "admin";
      if (!to.meta.roles.includes(userRole)) {
        console.warn("无权访问:", to.path);
        next(false);
        return;
      }
    }
  }
  next();
});

export default router;
