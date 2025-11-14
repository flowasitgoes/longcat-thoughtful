import { Injectable } from '@angular/core';
import { Level, Point, Direction, Path } from '../../shared/models';
import { GridUtil } from '../../shared/utils';
import { MaskUtil } from '../../shared/utils';

/**
 * 关卡生成器服务
 * 实现 Solution-Down 生成方法
 */
@Injectable({
  providedIn: 'root'
})
export class LevelGeneratorService {

  /**
   * 生成关卡（Solution-Down 方法）
   */
  generateLevel(width: number, height: number): Level {
    // 1. 创建空关卡
    const mask = MaskUtil.createEmptyMask(width, height);
    
    // 2. 随机选择起点
    const start: Point = {
      x: Math.floor(Math.random() * width),
      y: Math.floor(Math.random() * height)
    };

    // 3. 生成路径
    const { path, finalMask } = this.generatePath(mask, start, width, height);

    // 4. 创建关卡
    const level: Level = {
      id: this.generateId(),
      width,
      height,
      mask: finalMask,
      start,
      solution: path
    };

    return level;
  }

  /**
   * 生成路径（Solution-Down 核心逻辑）
   */
  private generatePath(
    initialMask: boolean[][],
    start: Point,
    width: number,
    height: number
  ): { path: Path; finalMask: boolean[][] } {
    const mask = initialMask.map(row => [...row]);
    const path: Path = {
      points: [start],
      directions: []
    };

    let currentPosition: Point = { ...start };
    let previousDirection: Direction | null = null;
    const catBody: Point[] = [];
    const visited = new Set<string>();
    visited.add(`${currentPosition.x},${currentPosition.y}`);

    // 生成路径直到所有可走格子都被访问
    while (true) {
      // 获取可用的移动方向
      const availableDirections = this.getAvailableDirections(
        currentPosition,
        mask,
        width,
        height,
        catBody,
        visited
      );

      if (availableDirections.length === 0) {
        break; // 没有更多可走的方向
      }

      // 随机选择一个方向
      const direction = availableDirections[
        Math.floor(Math.random() * availableDirections.length)
      ] as Direction;

      // 计算新位置
      const newPosition = GridUtil.getNeighbor(currentPosition, direction);

      // 如果产生转弯，在转弯处放置墙
      if (previousDirection && previousDirection !== direction) {
        const turnPosition = this.getTurnWallPosition(
          currentPosition,
          previousDirection,
          direction
        );
        
        if (GridUtil.isValidPoint(turnPosition, width, height)) {
          // 检查该位置是否已有猫身体
          const hasCatBody = catBody.some(body => 
            GridUtil.equals(body, turnPosition)
          );
          
          if (!hasCatBody) {
            mask[turnPosition.y][turnPosition.x] = false;
          }
        }
      }

      // 更新状态
      catBody.push({ ...currentPosition });
      currentPosition = newPosition;
      visited.add(`${currentPosition.x},${currentPosition.y}`);
      path.points.push({ ...currentPosition });
      path.directions.push(direction);
      previousDirection = direction;
    }

    // 填充剩余空位为墙
    // 所有在路径中的点应该是可走的，其他都是墙
    const finalMask = mask.map((row, y) =>
      row.map((cell, x) => {
        const point: Point = { x, y };
        const isInPath = path.points.some(p => GridUtil.equals(p, point));
        // 如果不在路径中，设置为墙；在路径中保持可走
        return isInPath;
      })
    );

    return { path, finalMask };
  }

  /**
   * 获取可用的移动方向
   */
  private getAvailableDirections(
    position: Point,
    mask: boolean[][],
    width: number,
    height: number,
    catBody: Point[],
    visited: Set<string>
  ): Direction[] {
    const directions: Direction[] = [];
    const allDirections: Direction[] = [
      Direction.Up,
      Direction.Down,
      Direction.Left,
      Direction.Right
    ];

    for (const direction of allDirections) {
      const neighbor = GridUtil.getNeighbor(position, direction);
      const key = `${neighbor.x},${neighbor.y}`;

      if (
        GridUtil.isValidPoint(neighbor, width, height) &&
        mask[neighbor.y][neighbor.x] &&
        !visited.has(key) &&
        !catBody.some(body => GridUtil.equals(body, neighbor))
      ) {
        directions.push(direction);
      }
    }

    return directions;
  }

  /**
   * 获取转弯处的墙位置
   */
  private getTurnWallPosition(
    currentPosition: Point,
    previousDirection: Direction,
    newDirection: Direction
  ): Point {
    // 转弯处的墙应该在"如果继续原方向"会到达的位置
    return GridUtil.getNeighbor(currentPosition, previousDirection);
  }

  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    return `level_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 验证关卡是否可解
   */
  validateLevel(level: Level): boolean {
    // 检查连通性
    if (!MaskUtil.checkConnectivity(level.mask)) {
      return false;
    }

    // 检查起点是否可走
    if (!level.mask[level.start.y][level.start.x]) {
      return false;
    }

    return true;
  }
}

