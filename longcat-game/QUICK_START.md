# 快速启动指南

## 开发环境要求

- Node.js 20+
- npm 10+
- Ionic CLI（已全局安装）

## 启动开发服务器

```bash
cd longcat-game
npm install
ionic serve
```

应用将在 `http://localhost:8100` 运行。

## 测试功能

### 1. 主菜单
- 访问 `http://localhost:8100`
- 点击 "Play" 进入关卡选择

### 2. 关卡选择
- 查看生成的关卡列表
- 使用难度筛选器
- 点击关卡开始游戏

### 3. 游戏
- **桌面端**: 使用方向按钮或键盘方向键
- **移动端**: 使用触摸滑动或屏幕上的方向按钮
- 点击撤销按钮可以撤销上一步
- 点击重置按钮可以重新开始

### 4. 设置
- 调整音效和震动设置
- 选择默认难度

## 构建生产版本

```bash
npm run build
```

构建输出在 `www` 文件夹。

## 添加原生平台

### iOS
```bash
npx cap add ios
npx cap sync ios
npx cap open ios
```

### Android
```bash
npx cap add android
npx cap sync android
npx cap open android
```

## 故障排除

### 编译错误
如果遇到编译错误，尝试：
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 路由问题
确保所有路由路径正确，检查 `app-routing.module.ts`。

### 服务注入问题
确保所有服务都标记为 `providedIn: 'root'`。

