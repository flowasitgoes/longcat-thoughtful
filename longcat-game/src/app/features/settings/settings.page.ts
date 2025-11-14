import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: false,
})
export class SettingsPage implements OnInit {
  soundEnabled = true;
  vibrationEnabled = true;
  difficulty = 'medium';

  constructor() {}

  ngOnInit() {
    // 从存储加载设置
    this.loadSettings();
  }

  /**
   * 加载设置
   */
  loadSettings() {
    const sound = localStorage.getItem('soundEnabled');
    const vibration = localStorage.getItem('vibrationEnabled');
    const difficulty = localStorage.getItem('difficulty');

    if (sound !== null) {
      this.soundEnabled = sound === 'true';
    }
    if (vibration !== null) {
      this.vibrationEnabled = vibration === 'true';
    }
    if (difficulty) {
      this.difficulty = difficulty;
    }
  }

  /**
   * 保存设置
   */
  saveSettings() {
    localStorage.setItem('soundEnabled', this.soundEnabled.toString());
    localStorage.setItem('vibrationEnabled', this.vibrationEnabled.toString());
    localStorage.setItem('difficulty', this.difficulty);
  }

  /**
   * 切换音效
   */
  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    this.saveSettings();
  }

  /**
   * 切换震动
   */
  toggleVibration() {
    this.vibrationEnabled = !this.vibrationEnabled;
    this.saveSettings();
  }

  /**
   * 更改难度
   */
  onDifficultyChange() {
    this.saveSettings();
  }
}
