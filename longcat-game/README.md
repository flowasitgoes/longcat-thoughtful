# Longcat Game

一个基于 Ionic + Angular 的跨平台 Longcat 益智游戏。

## 项目概述

Longcat Game 是一个益智游戏，玩家需要控制一只猫填满关卡中的所有空格。游戏使用 Solution-Down 方法生成关卡，保证 100% 可解性。

## 技术栈

- **前端框架**: Ionic 8 + Angular 20
- **语言**: TypeScript
- **跨平台**: Capacitor 7
- **样式**: SCSS

## 功能特性

### 已实现

- ✅ Solution-Down 关卡生成器（100% 可解性）
- ✅ 游戏引擎（移动、碰撞检测、完成检测）
- ✅ 图表示法和难度预测器
- ✅ 游戏页面（网格渲染、触摸控制）
- ✅ 关卡选择页面（难度筛选）
- ✅ 设置页面
- ✅ 撤销功能
- ✅ 响应式设计（支持桌面和移动端）

### 待实现

- [ ] 关卡持久化存储
- [ ] 用户进度保存
- [ ] SD-PCGRL（强化学习生成器）
- [ ] 关卡编辑器
- [ ] 音效和动画优化

## 项目结构

```
src/app/
├── core/                    # 核心服务
│   ├── game-engine/         # 游戏引擎
│   ├── level-generator/     # 关卡生成器
│   ├── difficulty-predictor/ # 难度预测器
│   └── graph-analyzer/      # 图分析器
├── features/                # 功能模块
│   ├── game/                # 游戏页面
│   ├── level-select/        # 关卡选择
│   └── settings/            # 设置
└── shared/                  # 共享组件
    ├── components/          # 通用组件
    ├── models/              # 数据模型
    └── utils/               # 工具函数
```

## 开发

### 安装依赖

```bash
npm install
```

### 运行开发服务器

```bash
ionic serve
```

### 构建生产版本

```bash
npm run build
```

### 添加平台

```bash
# iOS
npx cap add ios

# Android
npx cap add android
```

### 同步到原生项目

```bash
npx cap sync
```

## 核心算法

### Solution-Down 生成器

1. 创建空关卡
2. 随机选择起点
3. 生成路径（随机移动，在转弯处放置墙）
4. 填充剩余空间为墙
5. 返回完整关卡

### 难度预测

使用图表示法分析关卡，计算以下变量：
- **Indeterminate Branches**: 不确定分支数（最重要）
- **Solutions**: 解的数量（负相关）
- **Solution Branches**: 解分支数（正相关）

使用线性回归模型预测难度。

## 部署

### Web

```bash
npm run build
# 部署 www 文件夹到静态托管服务
```

### iOS

```bash
npx cap sync ios
# 在 Xcode 中打开 ios 文件夹
```

### Android

```bash
npx cap sync android
# 在 Android Studio 中打开 android 文件夹
```

## 参考资料

- [Ionic 文档](https://ionicframework.com/docs)
- [Angular 文档](https://angular.io/docs)
- [Capacitor 文档](https://capacitorjs.com/docs)
- 论文: Procedural Content Generation for Longcat Puzzle Game

## 许可证

MIT

