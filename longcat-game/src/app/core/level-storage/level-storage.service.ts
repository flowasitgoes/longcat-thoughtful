import { Injectable } from '@angular/core';
import { Level } from '../../shared/models';

/**
 * 关卡存储服务
 * 用于在页面间传递选中的关卡
 */
@Injectable({
  providedIn: 'root'
})
export class LevelStorageService {
  private selectedLevel: Level | null = null;
  private levelsCache: Map<string, Level> = new Map();
  private levelsList: Level[] = []; // 保持关卡顺序

  /**
   * 设置选中的关卡
   */
  setSelectedLevel(level: Level): void {
    this.selectedLevel = level;
    this.levelsCache.set(level.id, level);
  }

  /**
   * 获取选中的关卡
   */
  getSelectedLevel(): Level | null {
    return this.selectedLevel;
  }

  /**
   * 根据 ID 获取关卡
   */
  getLevelById(id: string): Level | null {
    return this.levelsCache.get(id) || null;
  }

  /**
   * 清除选中的关卡
   */
  clearSelectedLevel(): void {
    this.selectedLevel = null;
  }

  /**
   * 缓存关卡
   */
  cacheLevel(level: Level): void {
    this.levelsCache.set(level.id, level);
    // 如果不在列表中，添加到列表末尾
    if (!this.levelsList.find(l => l.id === level.id)) {
      this.levelsList.push(level);
    }
  }

  /**
   * 缓存多个关卡
   */
  cacheLevels(levels: Level[]): void {
    levels.forEach(level => this.cacheLevel(level));
    // 更新列表顺序
    this.levelsList = [...levels];
  }

  /**
   * 获取下一关
   */
  getNextLevel(currentLevelId: string): Level | null {
    const currentIndex = this.levelsList.findIndex(l => l.id === currentLevelId);
    if (currentIndex >= 0 && currentIndex < this.levelsList.length - 1) {
      return this.levelsList[currentIndex + 1];
    }
    return null;
  }

  /**
   * 获取所有关卡列表
   */
  getAllLevels(): Level[] {
    return [...this.levelsList];
  }
}

