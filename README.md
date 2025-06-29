# 订单管理移动应用

这是一个基于 Expo + React Native 开发的订单管理移动应用，用于查看订单详情和子订单信息。

## 功能特性

- 📱 订单详情查看
- 📋 子订单列表管理
- 🔗 从URL参数获取订单ID
- 💼 企业级UI设计
- ⚡ 实时数据获取
- 🔄 错误处理和重试机制

## 技术栈

- **框架**: Expo SDK 53.0.0
- **语言**: TypeScript
- **UI**: React Native
- **路由**: Expo Router
- **图标**: Lucide React Native

## 项目结构

```
project/
├── app/                    # 应用页面
│   ├── _layout.tsx        # 根布局
│   ├── index.tsx          # 订单详情页面
│   └── +not-found.tsx     # 404页面
├── api/                   # API请求函数
│   └── index.ts           # 订单和子订单API
├── types/                 # TypeScript类型定义
│   └── index.ts           # 数据类型
├── hooks/                 # 自定义Hooks
├── assets/                # 静态资源
└── field_mapping.json     # 字段映射配置
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 使用应用

应用启动后，有两种方式使用：

#### 方式1: 使用测试订单ID
- 应用会显示"请输入订单ID"的提示
- 点击"使用测试订单ID (IN25001101)"按钮
- 应用将自动加载测试数据

#### 方式2: 通过URL参数（Web版本）
```
http://localhost:8081?order_id=IN25001101
```

## API配置

应用使用以下API接口：

### 订单详情API
- **URL**: `https://api.intcomedical.com:8011/prod-api/external/order/orderDataCompletion?id_list={订单ID}`
- **方法**: GET
- **用途**: 获取订单基本信息和详细字段

### 子订单API  
- **URL**: `https://api.intcomedical.com:8011/prod-api/external/order/getOrderDataDetail?id={订单ID}`
- **方法**: GET
- **用途**: 获取子订单列表和产品详情

## 数据映射

应用使用 `field_mapping.json` 配置文件来映射API字段到中文显示标签：

```json
{
  "order": {
    "fields": {
      "projectId": { "label": "项目ID", "isLink": true },
      "custShortName": { "label": "客户简称", "isLink": true },
      // ... 更多字段
    }
  },
  "subOrder": {
    "fields": {
      "totalBoxCount": { "label": "总箱数" },
      "boxPrice": { "label": "箱柜单价" },
      // ... 更多字段
    }
  }
}
```

## 主要功能

### 订单信息页面
- 显示订单基本信息（订单号、状态、金额）
- 展示详细字段（项目ID、客户信息、时间节点等）
- 支持链接字段的特殊显示

### 子订单列表页面
- 显示产品详情和规格信息
- 不同尺寸的箱数统计
- 单价、总价、完货时间等信息

### 操作功能
- NC、竞意、TMS 三个业务操作按钮
- 标签页切换（订单信息 ↔ 子订单列表）
- 错误处理和重试机制

## 开发说明

### 添加新字段
1. 在 `field_mapping.json` 中添加字段配置
2. 在 `types/index.ts` 中更新类型定义
3. 在 `api/index.ts` 中添加字段映射逻辑

### 自定义样式
所有样式定义在各组件的 `StyleSheet.create()` 中，采用现代化的移动端设计规范。

### 错误处理
应用包含完整的错误处理机制：
- 网络请求失败
- 数据解析错误
- 订单ID缺失
- 加载状态管理

## 构建部署

### Web版本
```bash
npm run build:web
```

### 移动应用
使用 Expo 的构建服务或本地构建工具。

## 许可证

此项目仅供内部使用。 