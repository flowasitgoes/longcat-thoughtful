import { Injectable } from '@angular/core';
import { Level } from '../../shared/models';
import { GraphAnalyzerService } from '../graph-analyzer';

/**
 * 难度预测器服务
 * 使用 Ridge Regression 模型预测关卡难度
 */
@Injectable({
  providedIn: 'root'
})
export class DifficultyPredictorService {

  // 模型系数（基于论文中的 Ridge Regression 结果）
  // 这些值需要根据实际训练数据调整
  private readonly COEFFICIENTS = {
    indeterminateBranches: 0.5,  // 最重要
    solutions: -0.3,              // 负相关
    solutionBranches: 0.2          // 正相关
  };

  private readonly INTERCEPT = 10.0; // 截距

  constructor(private graphAnalyzer: GraphAnalyzerService) {}

  /**
   * 预测关卡难度
   */
  predictDifficulty(level: Level): number {
    try {
      // 对于大关卡，图分析可能太慢，使用简化方法
      const totalCells = level.width * level.height;
      const walkableCells = level.mask.reduce((acc, row) => 
        acc + row.filter((cell: boolean) => cell).length, 0
      );
      
      // 如果关卡太大，使用简化的难度计算
      if (totalCells > 100) {
        const complexity = walkableCells / totalCells;
        return Math.round((1 - complexity) * 100);
      }

      // 生成图表示法
      const graph = this.graphAnalyzer.generateGraph(level);

      // 计算关键变量
      const indeterminateBranches = this.graphAnalyzer.countIndeterminateBranches(graph);
      const solutions = this.graphAnalyzer.countSolutions(graph);
      const solutionBranches = this.graphAnalyzer.countSolutionBranches(graph);

      // 使用线性模型预测
      const difficulty = this.INTERCEPT +
        (indeterminateBranches * this.COEFFICIENTS.indeterminateBranches) +
        (solutions * this.COEFFICIENTS.solutions) +
        (solutionBranches * this.COEFFICIENTS.solutionBranches);

      // 确保难度为非负数
      return Math.max(0, Math.round(difficulty * 10) / 10);
    } catch (error) {
      console.error('Error predicting difficulty:', error);
      // 返回基于大小的简单难度
      const walkableCells = level.mask.reduce((acc, row) => 
        acc + row.filter((cell: boolean) => cell).length, 0
      );
      return Math.min(100, walkableCells);
    }
  }

  /**
   * 批量预测难度
   */
  predictDifficulties(levels: Level[]): Map<string, number> {
    const results = new Map<string, number>();
    for (const level of levels) {
      results.set(level.id, this.predictDifficulty(level));
    }
    return results;
  }

  /**
   * 更新模型系数（用于训练后的模型更新）
   */
  updateCoefficients(coefficients: {
    indeterminateBranches: number;
    solutions: number;
    solutionBranches: number;
    intercept: number;
  }): void {
    this.COEFFICIENTS.indeterminateBranches = coefficients.indeterminateBranches;
    this.COEFFICIENTS.solutions = coefficients.solutions;
    this.COEFFICIENTS.solutionBranches = coefficients.solutionBranches;
    (this as any).INTERCEPT = coefficients.intercept;
  }

  /**
   * 获取当前模型系数
   */
  getCoefficients(): {
    indeterminateBranches: number;
    solutions: number;
    solutionBranches: number;
    intercept: number;
  } {
    return {
      ...this.COEFFICIENTS,
      intercept: this.INTERCEPT
    };
  }
}

