# Uploader 组件

封装选择文件、获取预签名、读取文件、PUT 上传、上传结果回调的流程。

示例：

```wxml
<uploader
  id="uploader"
  media-type="{{['image']}}"
  files="{{imageList}}"
  max="{{maxImageCount}}"
  gridConfig="{{gridConfig}}"
  sizeLimit="{{sizeLimit}}"
  bind:change="onFilesChange"
  bind:remove="handleRemove"
  bind:success="onUploadSuccess"
  bind:fail="onUploadFail"
>
  <view slot="add-content">添加</view>
</uploader>
```
