import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GameState, Level, Point, Direction } from '../../shared/models';
import { GridUtil } from '../../shared/utils';

/**
 * 游戏引擎服务
 * 负责游戏状态管理、移动逻辑、碰撞检测和完成检测
 */
@Injectable({
  providedIn: 'root'
})
export class GameEngineService {
  private gameStateSubject = new BehaviorSubject<GameState | null>(null);
  public gameState$: Observable<GameState | null> = this.gameStateSubject.asObservable();

  private history: GameState[] = [];

  /**
   * 初始化游戏
   */
  initializeGame(level: Level): void {
    const initialState: GameState = {
      level,
      catPosition: { ...level.start },
      catBody: [],
      visited: this.createVisitedArray(level.width, level.height),
      moves: [],
      isComplete: false,
      isFailed: false
    };

    initialState.visited[level.start.y][level.start.x] = true;
    this.history = [JSON.parse(JSON.stringify(initialState))];
    this.gameStateSubject.next(initialState);
  }

  /**
   * 移动猫（走到底机制）
   * 会一直移动到撞墙、边界或身体为止
   */
  move(direction: Direction): boolean {
    const currentState = this.gameStateSubject.value;
    if (!currentState || currentState.isComplete || currentState.isFailed) {
      return false;
    }

    // 检查是否可以朝这个方向移动（至少移动一格）
    let testPosition = this.calculateNewPosition(currentState.catPosition, direction);
    if (!this.isValidMove(currentState, testPosition)) {
      return false; // 无法移动
    }

    // 走到底：一直移动到不能移动为止
    let newState = currentState;
    let moved = false;
    
    while (true) {
      const nextPosition = this.calculateNewPosition(newState.catPosition, direction);
      
      // 检查是否可以继续移动
      if (!this.isValidMove(newState, nextPosition)) {
        break; // 撞到障碍物，停止移动
      }
      
      // 创建新状态（移动一步）
      newState = this.createNewState(newState, nextPosition, direction);
      moved = true;
    }

    // 如果没有移动，返回false
    if (!moved) {
      return false;
    }
    
    // 检查完成或失败
    this.checkGameStatus(newState);
    
    // 保存到历史
    this.history.push(JSON.parse(JSON.stringify(newState)));
    
    // 更新状态
    this.gameStateSubject.next(newState);
    
    return true;
  }

  /**
   * 撤销上一步
   */
  undo(): boolean {
    if (this.history.length <= 1) {
      return false;
    }

    this.history.pop();
    const previousState = this.history[this.history.length - 1];
    this.gameStateSubject.next(JSON.parse(JSON.stringify(previousState)));
    return true;
  }

  /**
   * 重置游戏
   */
  reset(): void {
    if (this.history.length > 0) {
      const initialState = this.history[0];
      this.history = [JSON.parse(JSON.stringify(initialState))];
      this.gameStateSubject.next(JSON.parse(JSON.stringify(initialState)));
    }
  }

  /**
   * 获取当前游戏状态
   */
  getCurrentState(): GameState | null {
    return this.gameStateSubject.value;
  }

  /**
   * 计算新位置
   */
  private calculateNewPosition(current: Point, direction: Direction): Point {
    return GridUtil.getNeighbor(current, direction);
  }

  /**
   * 检查移动是否合法
   */
  private isValidMove(state: GameState, newPosition: Point): boolean {
    const { level } = state;

    // 检查是否在网格范围内
    if (!GridUtil.isValidPoint(newPosition, level.width, level.height)) {
      return false;
    }

    // 检查是否是墙
    if (!level.mask[newPosition.y][newPosition.x]) {
      return false;
    }

    // 检查是否撞到自己的身体
    if (state.catBody.some(body => GridUtil.equals(body, newPosition))) {
      return false;
    }

    // 检查是否撞到头部（不应该发生，但安全起见）
    if (GridUtil.equals(state.catPosition, newPosition)) {
      return false;
    }

    return true;
  }

  /**
   * 创建新状态
   */
  private createNewState(currentState: GameState, newPosition: Point, direction: Direction): GameState {
    const newBody = [...currentState.catBody, { ...currentState.catPosition }];
    const newVisited = currentState.visited.map(row => [...row]);
    newVisited[newPosition.y][newPosition.x] = true;
    const newMoves = [...currentState.moves, direction];

    return {
      ...currentState,
      catPosition: newPosition,
      catBody: newBody,
      visited: newVisited,
      moves: newMoves
    };
  }

  /**
   * 检查游戏状态（完成或失败）
   */
  private checkGameStatus(state: GameState): void {
    const { level, catPosition, visited } = state;

    // 检查是否所有可走格子都被访问
    let allVisited = true;
    for (let y = 0; y < level.height; y++) {
      for (let x = 0; x < level.width; x++) {
        if (level.mask[y][x] && !visited[y][x]) {
          allVisited = false;
          break;
        }
      }
      if (!allVisited) break;
    }

    if (allVisited) {
      state.isComplete = true;
      return;
    }

    // 检查是否失败（无合法移动）
    const neighbors = GridUtil.getNeighbors(state.catPosition);
    const hasValidMove = neighbors.some(neighbor => {
      if (!GridUtil.isValidPoint(neighbor, level.width, level.height)) {
        return false;
      }
      if (!level.mask[neighbor.y][neighbor.x]) {
        return false;
      }
      if (state.catBody.some(body => GridUtil.equals(body, neighbor))) {
        return false;
      }
      return true;
    });

    if (!hasValidMove) {
      state.isFailed = true;
    }
  }

  /**
   * 创建访问数组
   */
  private createVisitedArray(width: number, height: number): boolean[][] {
    return Array(height).fill(null).map(() => Array(width).fill(false));
  }
}

