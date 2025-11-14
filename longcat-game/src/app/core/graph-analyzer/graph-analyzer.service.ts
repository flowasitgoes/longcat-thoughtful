import { Injectable } from '@angular/core';
import { Level, Point, Direction } from '../../shared/models';
import { GridUtil } from '../../shared/utils';

/**
 * 图节点状态类型
 */
export enum StateType {
  Start = 'start',
  Success = 'success',
  Fail = 'fail',
  Dead = 'dead',
  Indeterminate = 'indeterminate'
}

/**
 * 图节点
 */
export interface GraphNode {
  id: string;
  state: GameStateSnapshot;
  type: StateType;
  outEdges: GraphEdge[];
  inEdges: GraphEdge[];
}

/**
 * 图边
 */
export interface GraphEdge {
  from: string;
  to: string;
  direction: Direction;
}

/**
 * 游戏状态快照
 */
export interface GameStateSnapshot {
  catPosition: Point;
  catBody: Point[];
  visited: boolean[][];
}

/**
 * 图表示法
 */
export interface GraphRepresentation {
  nodes: Map<string, GraphNode>;
  startNodeId: string;
  successNodeIds: string[];
  failNodeIds: string[];
  deadNodeIds: string[];
  indeterminateNodeIds: string[];
}

/**
 * 图分析器服务
 * 负责生成图表示法、状态分类和分支计算
 */
@Injectable({
  providedIn: 'root'
})
export class GraphAnalyzerService {

  /**
   * 生成图表示法
   */
  generateGraph(level: Level): GraphRepresentation {
    const nodes = new Map<string, GraphNode>();
    const visited = new Set<string>();
    const queue: GameStateSnapshot[] = [];

    // 初始状态
    const initialState: GameStateSnapshot = {
      catPosition: { ...level.start },
      catBody: [],
      visited: this.createVisitedArray(level.width, level.height)
    };
    initialState.visited[level.start.y][level.start.x] = true;

    const startNodeId = this.getStateId(initialState);
    queue.push(initialState);
    visited.add(startNodeId);

    // BFS 遍历所有状态
    while (queue.length > 0) {
      const currentState = queue.shift()!;
      const currentNodeId = this.getStateId(currentState);

      // 创建节点
      if (!nodes.has(currentNodeId)) {
        const node: GraphNode = {
          id: currentNodeId,
          state: currentState,
          type: StateType.Indeterminate, // 稍后分类
          outEdges: [],
          inEdges: []
        };
        nodes.set(currentNodeId, node);
      }

      const currentNode = nodes.get(currentNodeId)!;

      // 检查状态类型
      const stateType = this.classifyState(currentState, level);
      currentNode.type = stateType;

      // 如果是成功或失败状态，不再继续
      if (stateType === StateType.Success || stateType === StateType.Fail) {
        continue;
      }

      // 如果是死状态，不再继续
      if (stateType === StateType.Dead) {
        continue;
      }

      // 获取所有可能的移动
      const possibleMoves = this.getPossibleMoves(currentState, level);

      for (const move of possibleMoves) {
        const newState = this.applyMove(currentState, move.direction, level);
        const newStateId = this.getStateId(newState);

        // 创建边
        const edge: GraphEdge = {
          from: currentNodeId,
          to: newStateId,
          direction: move.direction
        };
        currentNode.outEdges.push(edge);

        // 如果新状态未访问，加入队列
        if (!visited.has(newStateId)) {
          visited.add(newStateId);
          queue.push(newState);
        }

        // 创建或更新目标节点
        if (!nodes.has(newStateId)) {
          const newNode: GraphNode = {
            id: newStateId,
            state: newState,
            type: StateType.Indeterminate,
            outEdges: [],
            inEdges: []
          };
          nodes.set(newStateId, newNode);
        }

        const targetNode = nodes.get(newStateId)!;
        targetNode.inEdges.push(edge);
      }
    }

    // 分类所有节点
    const successNodeIds: string[] = [];
    const failNodeIds: string[] = [];
    const deadNodeIds: string[] = [];
    const indeterminateNodeIds: string[] = [];

    for (const [id, node] of nodes) {
      switch (node.type) {
        case StateType.Success:
          successNodeIds.push(id);
          break;
        case StateType.Fail:
          failNodeIds.push(id);
          break;
        case StateType.Dead:
          deadNodeIds.push(id);
          break;
        case StateType.Indeterminate:
          indeterminateNodeIds.push(id);
          break;
      }
    }

    return {
      nodes,
      startNodeId,
      successNodeIds,
      failNodeIds,
      deadNodeIds,
      indeterminateNodeIds
    };
  }

  /**
   * 计算不确定分支数
   */
  countIndeterminateBranches(graph: GraphRepresentation): number {
    let branches = 0;

    for (const nodeId of graph.indeterminateNodeIds) {
      const node = graph.nodes.get(nodeId);
      if (node && node.outEdges.length > 1) {
        branches += node.outEdges.length - 1;
      }
    }

    return branches;
  }

  /**
   * 计算解的数量
   */
  countSolutions(graph: GraphRepresentation): number {
    return graph.successNodeIds.length;
  }

  /**
   * 计算解分支数
   */
  countSolutionBranches(graph: GraphRepresentation): number {
    let branches = 0;

    // 找到所有在解路径上的节点
    const solutionNodes = this.findSolutionNodes(graph);

    for (const nodeId of solutionNodes) {
      const node = graph.nodes.get(nodeId);
      if (node && node.outEdges.length > 1) {
        branches += node.outEdges.length - 1;
      }
    }

    return branches;
  }

  /**
   * 分类状态
   */
  private classifyState(state: GameStateSnapshot, level: Level): StateType {
    // 检查是否完成
    if (this.isComplete(state, level)) {
      return StateType.Success;
    }

    // 检查是否失败（无合法移动）
    const hasValidMove = this.hasValidMove(state, level);
    if (!hasValidMove) {
      return StateType.Fail;
    }

    // 检查是否是死状态（分割成两个区域）
    if (this.isDeadState(state, level)) {
      return StateType.Dead;
    }

    return StateType.Indeterminate;
  }

  /**
   * 检查是否完成
   */
  private isComplete(state: GameStateSnapshot, level: Level): boolean {
    for (let y = 0; y < level.height; y++) {
      for (let x = 0; x < level.width; x++) {
        if (level.mask[y][x] && !state.visited[y][x]) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * 检查是否有合法移动
   */
  private hasValidMove(state: GameStateSnapshot, level: Level): boolean {
    const neighbors = GridUtil.getNeighbors(state.catPosition);
    return neighbors.some(neighbor => {
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
  }

  /**
   * 检查是否是死状态
   */
  private isDeadState(state: GameStateSnapshot, level: Level): boolean {
    // 检查是否分割成两个不连通的区域
    const unvisited = this.getUnvisitedCells(state, level);
    if (unvisited.length === 0) {
      return false;
    }

    // 使用 BFS 检查未访问区域是否连通
    const visited = new Set<string>();
    const queue: Point[] = [unvisited[0]];
    visited.add(`${unvisited[0].x},${unvisited[0].y}`);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const neighbors = GridUtil.getNeighbors(current);

      for (const neighbor of neighbors) {
        const key = `${neighbor.x},${neighbor.y}`;
        if (
          GridUtil.isValidPoint(neighbor, level.width, level.height) &&
          level.mask[neighbor.y][neighbor.x] &&
          !state.visited[neighbor.y][neighbor.x] &&
          !visited.has(key)
        ) {
          visited.add(key);
          queue.push(neighbor);
        }
      }
    }

    // 如果未访问区域不连通，则是死状态
    return visited.size < unvisited.length;
  }

  /**
   * 获取未访问的格子
   */
  private getUnvisitedCells(state: GameStateSnapshot, level: Level): Point[] {
    const cells: Point[] = [];
    for (let y = 0; y < level.height; y++) {
      for (let x = 0; x < level.width; x++) {
        if (level.mask[y][x] && !state.visited[y][x]) {
          cells.push({ x, y });
        }
      }
    }
    return cells;
  }

  /**
   * 获取可能的移动
   */
  private getPossibleMoves(state: GameStateSnapshot, level: Level): Array<{ direction: Direction; target: Point }> {
    const moves: Array<{ direction: Direction; target: Point }> = [];
    const directions: Direction[] = [
      Direction.Up,
      Direction.Down,
      Direction.Left,
      Direction.Right
    ];

    for (const direction of directions) {
      const target = GridUtil.getNeighbor(state.catPosition, direction);
      if (
        GridUtil.isValidPoint(target, level.width, level.height) &&
        level.mask[target.y][target.x] &&
        !state.catBody.some(body => GridUtil.equals(body, target))
      ) {
        moves.push({ direction, target });
      }
    }

    return moves;
  }

  /**
   * 应用移动
   */
  private applyMove(state: GameStateSnapshot, direction: Direction, level: Level): GameStateSnapshot {
    const newPosition = GridUtil.getNeighbor(state.catPosition, direction);
    const newBody = [...state.catBody, { ...state.catPosition }];
    const newVisited = state.visited.map(row => [...row]);
    newVisited[newPosition.y][newPosition.x] = true;

    return {
      catPosition: newPosition,
      catBody: newBody,
      visited: newVisited
    };
  }

  /**
   * 获取状态 ID
   */
  private getStateId(state: GameStateSnapshot): string {
    const bodyStr = state.catBody.map(b => `${b.x},${b.y}`).join('|');
    const visitedStr = state.visited.map(row => row.map(v => v ? '1' : '0').join('')).join('|');
    return `${state.catPosition.x},${state.catPosition.y}|${bodyStr}|${visitedStr}`;
  }

  /**
   * 找到所有在解路径上的节点
   */
  private findSolutionNodes(graph: GraphRepresentation): string[] {
    const solutionNodes = new Set<string>();

    // 从每个成功状态回溯到起始状态
    for (const successId of graph.successNodeIds) {
      this.backtrackToStart(graph, successId, solutionNodes);
    }

    return Array.from(solutionNodes);
  }

  /**
   * 回溯到起始状态
   */
  private backtrackToStart(
    graph: GraphRepresentation,
    nodeId: string,
    solutionNodes: Set<string>
  ): void {
    if (solutionNodes.has(nodeId)) {
      return;
    }

    solutionNodes.add(nodeId);
    const node = graph.nodes.get(nodeId);
    if (!node) {
      return;
    }

    // 回溯所有入边
    for (const edge of node.inEdges) {
      this.backtrackToStart(graph, edge.from, solutionNodes);
    }
  }

  /**
   * 创建访问数组
   */
  private createVisitedArray(width: number, height: number): boolean[][] {
    return Array(height).fill(null).map(() => Array(width).fill(false));
  }
}

