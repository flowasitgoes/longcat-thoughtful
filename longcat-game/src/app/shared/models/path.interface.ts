import { Point } from './point.interface';
import { Direction } from './direction.enum';

/**
 * 路径接口
 */
export interface Path {
  points: Point[];
  directions: Direction[];
}

