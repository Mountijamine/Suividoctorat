// soutenance-checklist.component.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-soutenance-checklist',
  templateUrl: './soutenance-checklist.component.html',
  styleUrls: ['./soutenance-checklist.component.scss']
})
export class SoutenanceChecklistComponent {
  @Input() prerequis: any;
  @Input() documents: any[] = [];

  readonly MIN_ARTICLES = 2;
  readonly MIN_CONFERENCES = 2;
  readonly MIN_HEURES_FORMATION = 200;

  isPrerequisComplete(): boolean {
    if (!this.prerequis) return false;
    return (
      this.prerequis.nombreArticlesQ1Q2 >= this.MIN_ARTICLES &&
      this.prerequis.nombreConferences >= this.MIN_CONFERENCES &&
      this.prerequis.heuresFormation >= this.MIN_HEURES_FORMATION
    );
  }

  getCompletionPercentage(): number {
    if (!this.prerequis) return 0;
    let total = 0;
    let completed = 0;

    // Check articles
    if (this.prerequis.nombreArticlesQ1Q2 >= this.MIN_ARTICLES) completed++;
    total++;

    // Check conferences
    if (this.prerequis.nombreConferences >= this.MIN_CONFERENCES) completed++;
    total++;

    // Check formation
    if (this.prerequis.heuresFormation >= this.MIN_HEURES_FORMATION) completed++;
    total++;

    return Math.round((completed / total) * 100);
  }
}
