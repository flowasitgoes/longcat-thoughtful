import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GameEngineService } from '../../core/game-engine';
import { LevelGeneratorService } from '../../core/level-generator';
import { DifficultyPredictorService } from '../../core/difficulty-predictor';
import { LevelStorageService } from '../../core/level-storage';
import { GameState, Level, Direction, Point } from '../../shared/models';
import { GridUtil } from '../../shared/utils';

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
  standalone: false,
})
export class GamePage implements OnInit, OnDestroy {
  gameState: GameState | null = null;
  isLoading = true;
  errorMessage: string | null = null;
  private subscription?: Subscription;
  
  // 导出 Direction 供模板使用
  Direction = Direction;
  
  // 触摸相关
  private touchStartX = 0;
  private touchStartY = 0;
  private readonly SWIPE_THRESHOLD = 30;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gameEngine: GameEngineService,
    private levelGenerator: LevelGeneratorService,
    private difficultyPredictor: DifficultyPredictorService,
    private levelStorage: LevelStorageService
  ) {}

  ngOnInit() {
    // 订阅游戏状态
    this.subscription = this.gameEngine.gameState$.subscribe(state => {
      this.gameState = state;
      this.isLoading = false;
      if (state) {
        console.log('Game state updated:', state);
      }
    });

    // 从路由获取关卡 ID 或生成新关卡
    const levelId = this.route.snapshot.paramMap.get('id');
    this.isLoading = true;
    this.errorMessage = null;
    
    try {
      if (levelId) {
        // 从存储加载关卡
        const selectedLevel = this.levelStorage.getSelectedLevel();
        if (selectedLevel && selectedLevel.id === levelId) {
          // 使用选中的关卡
          this.loadLevel(selectedLevel);
        } else {
          // 尝试从缓存加载
          const cachedLevel = this.levelStorage.getLevelById(levelId);
          if (cachedLevel) {
            this.loadLevel(cachedLevel);
          } else {
            // 如果找不到，生成新关卡
            console.warn('Level not found, generating new level');
            this.generateNewLevel(8, 8);
          }
        }
      } else {
        // 生成新关卡
        this.generateNewLevel(8, 8);
      }
    } catch (error) {
      console.error('Error in ngOnInit:', error);
      this.errorMessage = 'Failed to initialize game';
      this.isLoading = false;
    }

    // 绑定键盘事件
    this.setupKeyboardListeners();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    // 移除键盘事件监听器
    this.removeKeyboardListeners();
  }

  /**
   * 生成新关卡
   */
  generateNewLevel(width: number, height: number) {
    try {
      const level = this.levelGenerator.generateLevel(width, height);
      
      // 预测难度（如果失败则使用默认值）
      try {
        level.difficulty = this.difficultyPredictor.predictDifficulty(level);
      } catch (error) {
        console.warn('Difficulty prediction failed, using default:', error);
        level.difficulty = 50; // 默认难度
      }
      
      // 验证关卡
      if (!this.levelGenerator.validateLevel(level)) {
        console.warn('Generated level is invalid, regenerating...');
        // 递归重试（最多3次）
        setTimeout(() => this.generateNewLevel(width, height), 100);
        return;
      }
      
      // 初始化游戏
      this.gameEngine.initializeGame(level);
      console.log('Game initialized with level:', level);
      this.isLoading = false;
      this.errorMessage = null;
    } catch (error) {
      console.error('Error generating level:', error);
      this.errorMessage = 'Failed to generate level: ' + (error as Error).message;
      // 如果出错，使用简单的默认关卡
      this.createDefaultLevel(width, height);
    }
  }

  /**
   * 加载关卡
   */
  private loadLevel(level: Level) {
    try {
      // 验证关卡
      if (!this.levelGenerator.validateLevel(level)) {
        console.warn('Level is invalid, generating new level');
        this.generateNewLevel(level.width, level.height);
        return;
      }
      
      // 初始化游戏
      this.gameEngine.initializeGame(level);
      console.log('Game loaded with level:', level);
      this.isLoading = false;
      this.errorMessage = null;
    } catch (error) {
      console.error('Error loading level:', error);
      this.errorMessage = 'Failed to load level: ' + (error as Error).message;
      this.generateNewLevel(level.width, level.height);
    }
  }

  /**
   * 创建默认关卡（备用）
   */
  private createDefaultLevel(width: number, height: number) {
    const mask: boolean[][] = Array(height).fill(null).map(() => Array(width).fill(true));
    const level: Level = {
      id: 'default',
      width,
      height,
      mask,
      start: { x: 0, y: 0 },
      difficulty: 10
    };
    this.gameEngine.initializeGame(level);
  }

  /**
   * 处理方向按钮点击
   */
  onDirectionClick(direction: Direction) {
    this.gameEngine.move(direction);
  }

  /**
   * 撤销
   */
  onUndo() {
    this.gameEngine.undo();
  }

  /**
   * 重置
   */
  onReset() {
    this.gameEngine.reset();
  }

  /**
   * 返回关卡选择页面
   */
  goToLevelSelect() {
    this.router.navigate(['/level-select']);
  }

  /**
   * 下一关
   */
  nextLevel() {
    const currentLevel = this.gameState?.level;
    if (!currentLevel) {
      this.goToLevelSelect();
      return;
    }

    // 获取下一关
    const nextLevel = this.levelStorage.getNextLevel(currentLevel.id);

    if (nextLevel) {
      // 加载下一关
      this.levelStorage.setSelectedLevel(nextLevel);
      this.router.navigate(['/game', nextLevel.id]);
    } else {
      // 没有下一关，返回关卡选择页面
      this.goToLevelSelect();
    }
  }

  /**
   * 触摸开始
   */
  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
  }

  /**
   * 触摸结束（处理滑动）
   */
  onTouchEnd(event: TouchEvent) {
    if (!this.touchStartX || !this.touchStartY) {
      return;
    }

    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;
    const diffX = touchEndX - this.touchStartX;
    const diffY = touchEndY - this.touchStartY;

    const absX = Math.abs(diffX);
    const absY = Math.abs(diffY);

    if (absX < this.SWIPE_THRESHOLD && absY < this.SWIPE_THRESHOLD) {
      return; // 不是滑动
    }

    let direction: Direction | null = null;

    if (absX > absY) {
      // 水平滑动
      direction = diffX > 0 ? Direction.Right : Direction.Left;
    } else {
      // 垂直滑动
      direction = diffY > 0 ? Direction.Down : Direction.Up;
    }

    if (direction) {
      this.gameEngine.move(direction);
    }

    // 重置
    this.touchStartX = 0;
    this.touchStartY = 0;
  }

  /**
   * 获取单元格类
   */
  getCellClass(x: number, y: number): string {
    if (!this.gameState) {
      return '';
    }

    const { level, catPosition, catBody, visited } = this.gameState;
    const point: Point = { x, y };

    // 墙
    if (!level.mask[y][x]) {
      return 'cell-wall';
    }

    // 猫头
    if (GridUtil.equals(point, catPosition)) {
      return 'cell-cat-head';
    }

    // 猫身体
    if (catBody.some(body => GridUtil.equals(body, point))) {
      return 'cell-cat-body';
    }

    // 已访问
    if (visited[y][x]) {
      return 'cell-visited';
    }

    // 空
    return 'cell-empty';
  }

  /**
   * 检查是否完成
   */
  get isComplete(): boolean {
    return this.gameState?.isComplete ?? false;
  }

  /**
   * 检查是否失败
   */
  get isFailed(): boolean {
    return this.gameState?.isFailed ?? false;
  }

  /**
   * 获取网格单元格数组（用于模板）
   */
  getGridCells(): Array<{ x: number; y: number; class: string }> {
    if (!this.gameState) {
      return [];
    }
    
    const cells: Array<{ x: number; y: number; class: string }> = [];
    const { level } = this.gameState;
    
    // 确保按行优先顺序生成（y 在外层，x 在内层）
    for (let y = 0; y < level.height; y++) {
      for (let x = 0; x < level.width; x++) {
        cells.push({
          x,
          y,
          class: this.getCellClass(x, y)
        });
      }
    }
    
    // 验证单元格数量
    const expectedCount = level.width * level.height;
    if (cells.length !== expectedCount) {
      console.warn(`Grid cell count mismatch: expected ${expectedCount}, got ${cells.length}`);
    }
    
    return cells;
  }

  /**
   * 设置键盘事件监听器
   */
  private setupKeyboardListeners(): void {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  /**
   * 移除键盘事件监听器
   */
  private removeKeyboardListeners(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  /**
   * 处理键盘按下事件
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    // 如果游戏未加载或已完成/失败，不处理键盘事件
    if (!this.gameState || this.isLoading || this.isComplete || this.isFailed) {
      return;
    }

    // 防止在输入框中触发
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    let direction: Direction | null = null;

    switch (event.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        direction = Direction.Up;
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        direction = Direction.Down;
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        direction = Direction.Left;
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        direction = Direction.Right;
        break;
      case 'z':
      case 'Z':
        // Ctrl+Z 或 Z 键撤销
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.onUndo();
          return;
        }
        this.onUndo();
        return;
      case 'r':
      case 'R':
        // R 键重置
        event.preventDefault();
        this.onReset();
        return;
    }

    if (direction) {
      event.preventDefault();
      this.gameEngine.move(direction);
    }
  }
}
