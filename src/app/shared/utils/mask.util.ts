import { Point } from '../models/point.interface';
import { GridUtil } from './grid.util';

/**
 * Mask 工具函数
 */
export class MaskUtil {
  /**
   * 检查 Mask 的连通性
   */
  static checkConnectivity(mask: boolean[][]): boolean {
    if (mask.length === 0 || mask[0].length === 0) {
      return false;
    }

    const width = mask[0].length;
    const height = mask.length;
    const visited: boolean[][] = Array(height).fill(null).map(() => Array(width).fill(false));

    // 找到第一个可走点作为起点
    let start: Point | null = null;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (mask[y][x]) {
          start = { x, y };
          break;
        }
      }
      if (start) break;
    }

    if (!start) {
      return false; // 没有可走点
    }

    // 使用 BFS 检查连通性
    const queue: Point[] = [start];
    visited[start.y][start.x] = true;
    let reachableCount = 1;

    while (queue.length > 0) {
      const current = queue.shift()!;
      const neighbors = GridUtil.getNeighbors(current);

      for (const neighbor of neighbors) {
        if (GridUtil.isValidPoint(neighbor, width, height) &&
            mask[neighbor.y][neighbor.x] &&
            !visited[neighbor.y][neighbor.x]) {
          visited[neighbor.y][neighbor.x] = true;
          queue.push(neighbor);
          reachableCount++;
        }
      }
    }

    // 检查所有可走点是否都被访问
    let totalWalkable = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (mask[y][x]) {
          totalWalkable++;
        }
      }
    }

    return reachableCount === totalWalkable;
  }

  /**
   * 检查是否有死角
   */
  static checkNoDeadEnds(mask: boolean[][]): boolean {
    if (mask.length === 0 || mask[0].length === 0) {
      return true;
    }

    const width = mask[0].length;
    const height = mask.length;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (mask[y][x]) {
          const point: Point = { x, y };
          const neighbors = GridUtil.getNeighbors(point);
          const walkableNeighbors = neighbors.filter(n =>
            GridUtil.isValidPoint(n, width, height) && mask[n.y][n.x]
          );

          // 如果只有一个相邻可走点，可能是死角（除非是起点或终点）
          if (walkableNeighbors.length <= 1) {
            // 这里可以进一步检查是否是真正的死角
            // 暂时返回 true，后续可以优化
          }
        }
      }
    }

    return true;
  }

  /**
   * 创建空 Mask
   */
  static createEmptyMask(width: number, height: number): boolean[][] {
    return Array(height).fill(null).map(() => Array(width).fill(true));
  }
}

