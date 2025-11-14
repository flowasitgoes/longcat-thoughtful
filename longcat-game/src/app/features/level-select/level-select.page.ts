import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LevelGeneratorService } from '../../core/level-generator';
import { DifficultyPredictorService } from '../../core/difficulty-predictor';
import { LevelStorageService } from '../../core/level-storage';
import { Level } from '../../shared/models';

@Component({
  selector: 'app-level-select',
  templateUrl: './level-select.page.html',
  styleUrls: ['./level-select.page.scss'],
  standalone: false,
})
export class LevelSelectPage implements OnInit {
  levels: Level[] = [];
  filteredLevels: Level[] = [];
  selectedDifficulty: string = 'all';
  isLoading = false;

  constructor(
    private router: Router,
    private levelGenerator: LevelGeneratorService,
    private difficultyPredictor: DifficultyPredictorService,
    private levelStorage: LevelStorageService
  ) {}

  ngOnInit() {
    this.loadLevels();
  }

  /**
   * 加载关卡
   */
  loadLevels() {
    this.isLoading = true;
    
    // 生成一些示例关卡
    setTimeout(() => {
      this.levels = [];
      for (let i = 0; i < 20; i++) {
        const width = 6 + Math.floor(Math.random() * 4); // 6-9
        const height = 6 + Math.floor(Math.random() * 4); // 6-9
        const level = this.levelGenerator.generateLevel(width, height);
        level.difficulty = this.difficultyPredictor.predictDifficulty(level);
        this.levels.push(level);
      }
      
      // 按难度排序
      this.levels.sort((a, b) => (a.difficulty || 0) - (b.difficulty || 0));
      this.filteredLevels = [...this.levels];
      
      // 缓存所有关卡
      this.levelStorage.cacheLevels(this.levels);
      
      this.isLoading = false;
    }, 100);
  }

  /**
   * 筛选关卡
   */
  filterLevels() {
    if (this.selectedDifficulty === 'all') {
      this.filteredLevels = [...this.levels];
    } else {
      const range = this.getDifficultyRange(this.selectedDifficulty);
      this.filteredLevels = this.levels.filter(level => {
        const diff = level.difficulty || 0;
        return diff >= range.min && diff < range.max;
      });
    }
  }

  /**
   * 获取难度范围
   */
  private getDifficultyRange(difficulty: string): { min: number; max: number } {
    switch (difficulty) {
      case 'easy':
        return { min: 0, max: 30 };
      case 'medium':
        return { min: 30, max: 60 };
      case 'hard':
        return { min: 60, max: 100 };
      case 'expert':
        return { min: 100, max: Infinity };
      default:
        return { min: 0, max: Infinity };
    }
  }

  /**
   * 选择关卡
   */
  selectLevel(level: Level) {
    // 存储选中的关卡
    this.levelStorage.setSelectedLevel(level);
    // 导航到游戏页面
    this.router.navigate(['/game', level.id]);
  }

  /**
   * 生成新关卡
   */
  generateNewLevel() {
    this.isLoading = true;
    setTimeout(() => {
      const width = 6 + Math.floor(Math.random() * 4);
      const height = 6 + Math.floor(Math.random() * 4);
      const level = this.levelGenerator.generateLevel(width, height);
      level.difficulty = this.difficultyPredictor.predictDifficulty(level);
      this.levels.push(level);
      this.levels.sort((a, b) => (a.difficulty || 0) - (b.difficulty || 0));
      
      // 缓存新关卡
      this.levelStorage.cacheLevel(level);
      
      this.filterLevels();
      this.isLoading = false;
    }, 100);
  }

  /**
   * 获取难度标签
   */
  getDifficultyLabel(difficulty?: number): string {
    if (!difficulty) {
      return 'Unknown';
    }
    if (difficulty < 30) {
      return 'Easy';
    } else if (difficulty < 60) {
      return 'Medium';
    } else if (difficulty < 100) {
      return 'Hard';
    } else {
      return 'Expert';
    }
  }

  /**
   * 获取难度颜色
   */
  getDifficultyColor(difficulty?: number): string {
    if (!difficulty) {
      return 'medium';
    }
    if (difficulty < 30) {
      return 'success';
    } else if (difficulty < 60) {
      return 'warning';
    } else if (difficulty < 100) {
      return 'danger';
    } else {
      return 'dark';
    }
  }
}
