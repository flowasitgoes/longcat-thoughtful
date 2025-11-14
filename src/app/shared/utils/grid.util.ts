import { Point } from '../models/point.interface';

/**
 * 网格工具函数
 */
export class GridUtil {
  /**
   * 检查点是否在网格范围内
   */
  static isValidPoint(point: Point, width: number, height: number): boolean {
    return point.x >= 0 && point.x < width && point.y >= 0 && point.y < height;
  }

  /**
   * 获取相邻点
   */
  static getNeighbor(point: Point, direction: 'U' | 'D' | 'L' | 'R'): Point {
    switch (direction) {
      case 'U':
        return { x: point.x, y: point.y - 1 };
      case 'D':
        return { x: point.x, y: point.y + 1 };
      case 'L':
        return { x: point.x - 1, y: point.y };
      case 'R':
        return { x: point.x + 1, y: point.y };
    }
  }

  /**
   * 获取所有相邻点
   */
  static getNeighbors(point: Point): Point[] {
    return [
      this.getNeighbor(point, 'U'),
      this.getNeighbor(point, 'D'),
      this.getNeighbor(point, 'L'),
      this.getNeighbor(point, 'R')
    ];
  }

  /**
   * 检查两点是否相等
   */
  static equals(a: Point, b: Point): boolean {
    return a.x === b.x && a.y === b.y;
  }

  /**
   * 计算两点之间的曼哈顿距离
   */
  static manhattanDistance(a: Point, b: Point): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }
}

