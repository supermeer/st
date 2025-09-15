# Yours X 小程序

## 使用全局导航栏高度

在小程序中，不同机型的导航栏高度和安全区域存在差异。我们提供了全局的导航栏高度获取方法，便于在各个页面中统一使用。

### 在页面中使用导航栏高度

```javascript
// 页面 JS
import systemInfo from '../../utils/system'

Page({
  data: {
    contentHeight: 0
  },

  onLoad() {
    // 获取内容区域高度
    this.updateContentHeight()

    // 监听屏幕尺寸变化
    systemInfo.observeViewportChange(this, () => {
      this.updateContentHeight()
    })
  },

  onShow() {
    this.updateContentHeight()
  },

  // 更新内容区域高度
  updateContentHeight() {
    const contentHeight = systemInfo.getContentHeight()
    this.setData({ contentHeight })
  }
})
```

```html
<!-- 页面 WXML -->
<view class="container">
  <custom-nav title="页面标题" showBack="{{true}}"></custom-nav>
  <view class="content" style="height: {{contentHeight}}px;">
    <!-- 内容区域 -->
  </view>
</view>
```

```css
/* 页面 WXSS */
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.content {
  flex: 1;
  overflow-y: auto;
  box-sizing: border-box;
}
```

### 可用的系统信息方法

- `systemInfo.getNavInfo()` - 获取导航栏相关高度信息
- `systemInfo.getContentHeight()` - 获取内容区域高度
- `systemInfo.getSafeArea()` - 获取安全区域信息
- `systemInfo.getBottomSafeHeight()` - 获取底部安全区域高度
- `systemInfo.isIOS()` - 检查是否为 iOS 设备
- `systemInfo.isAndroid()` - 检查是否为 Android 设备
- `systemInfo.observeViewportChange(pageInstance, callback)` - 监听页面尺寸变化

### 自定义导航组件

我们提供了自定义导航组件，该组件已适配不同机型的导航栏高度：

```html
<custom-nav
  title="页面标题"
  showBack="{{true}}"
  showHome="{{false}}"
  transparent="{{false}}"
  bgColor="#ffffff"
  titleColor="#333333"
>
</custom-nav>
```
