import { Point } from './point.interface';
import { Path } from './path.interface';

/**
 * 关卡接口
 */
export interface Level {
  id: string;
  width: number;
  height: number;
  mask: boolean[][];  // true = walkable, false = wall
  start: Point;
  difficulty?: number;
  solution?: Path;
}

