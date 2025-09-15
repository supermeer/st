# 协议页面使用说明

## 概述

`/pages/vip/agreement` 页面是一个通用的协议展示页面，支持展示不同类型的协议内容，具有固定导航栏和可滚动内容区域的特点。

## 功能特性

- ✅ 固定导航栏，支持返回按钮
- ✅ 富文本内容展示
- ✅ 支持多种协议类型
- ✅ 下拉刷新功能
- ✅ 加载状态显示
- ✅ 响应式布局
- ✅ 分享功能

## 支持的协议类型

| 类型         | 参数值    | 说明         |
| ------------ | --------- | ------------ |
| 服务协议     | `service` | 默认协议类型 |
| 隐私协议     | `privacy` | 隐私保护相关 |
| 用户协议     | `user`    | 用户使用条款 |
| VIP 协议     | `vip`     | VIP 会员相关 |
| 自动续费协议 | `renew`   | 自动续费条款 |

## 使用方法

### 1. 页面跳转

```javascript
// 方式一：使用工具函数
import { navigateToAgreement } from '../../utils/agreement'

// 跳转到服务协议
navigateToAgreement('service')

// 跳转到隐私协议
navigateToAgreement('privacy')

// 方式二：直接使用 wx.navigateTo
wx.navigateTo({
  url: '/pages/vip/agreement/index?type=service'
})
```

### 2. 使用预定义的跳转函数

```javascript
import {
  navigateToServiceAgreement,
  navigateToPrivacyAgreement,
  navigateToUserAgreement,
  navigateToVipAgreement,
  navigateToRenewAgreement
} from '../../utils/agreement'

// 跳转到不同类型的协议
navigateToServiceAgreement() // 服务协议
navigateToPrivacyAgreement() // 隐私协议
navigateToUserAgreement() // 用户协议
navigateToVipAgreement() // VIP协议
navigateToRenewAgreement() // 自动续费协议
```

### 3. 在登录页面中使用

```javascript
// pages/login/index.js
import {
  navigateToServiceAgreement,
  navigateToPrivacyPolicy
} from '../../utils/agreement'

Page({
  // ... 其他代码

  navigateToServiceAgreement() {
    navigateToServiceAgreement()
  },

  navigateToPrivacyPolicy() {
    navigateToPrivacyPolicy()
  }
})
```

## API 接口

### 获取协议内容

```javascript
import { getAgreementContent } from '../../services/agreement/agreement'

// 获取指定类型的协议内容
const response = await getAgreementContent('service')
console.log(response.content) // 富文本内容
```

### 接口参数

- `type` (string): 协议类型，支持的值：`service`, `privacy`, `user`, `vip`, `renew`

### 返回数据格式

```javascript
{
  content: "<div>富文本协议内容</div>",
  version: "1.0.0",
  updateTime: "2024-01-01 12:00:00"
}
```

## 页面配置

### 页面参数

- `type`: 协议类型，默认为 `service`

### 示例 URL

```
/pages/vip/agreement/index?type=privacy
/pages/vip/agreement/index?type=vip
/pages/vip/agreement/index?type=renew
```

## 样式定制

页面使用了以下样式类，可以根据需要进行定制：

- `.agreement-page`: 页面容器
- `.custom-nav`: 导航栏样式
- `.agreement-content`: 内容区域样式
- `.loading-container`: 加载状态容器

## 注意事项

1. 确保 `custom-nav` 组件已正确引入
2. 确保 `tdesign-miniprogram` 组件库已安装
3. 协议内容支持 HTML 标签，但需要注意安全性
4. 建议在生产环境中使用真实的 API 接口替换模拟数据

## 扩展功能

### 添加新的协议类型

1. 在 `utils/agreement.js` 中添加新的类型常量
2. 在 `pages/vip/agreement/index.js` 的 `setTitleByType` 方法中添加标题映射
3. 在 `getMockContent` 方法中添加对应的模拟内容
4. 创建对应的跳转函数

### 自定义样式

可以通过修改 `index.wxss` 文件来自定义页面样式，支持：

- 修改背景色
- 调整内容区域圆角
- 自定义滚动条样式
- 适配不同屏幕尺寸
