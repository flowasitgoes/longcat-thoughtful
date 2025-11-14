import { Level } from './level.interface';
import { Point } from './point.interface';
import { Direction } from './direction.enum';

/**
 * 游戏状态接口
 */
export interface GameState {
  level: Level;
  catPosition: Point;
  catBody: Point[];
  visited: boolean[][];
  moves: Direction[];
  isComplete: boolean;
  isFailed: boolean;
}

