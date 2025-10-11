// admin-soutenance-panel.component.ts
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-soutenance-panel',
  templateUrl: './admin-soutenance-panel.component.html',
  styleUrls: ['./admin-soutenance-panel.component.scss']
})
export class AdminSoutenancePanelComponent implements OnInit {
  soutenances: any[] = [];
  displayedColumns: string[] = ['id', 'doctorant', 'titre', 'statut', 'date', 'actions'];
  loading = true;

  ngOnInit(): void {
    this.loadSoutenances();
  }

  loadSoutenances(): void {
    // TODO: Implement service call
    this.loading = false;
  }

  viewDetails(id: number): void {
    console.log('View details:', id);
  }

  authorize(id: number): void {
    console.log('Authorize:', id);
  }
}
