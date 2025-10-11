// soutenance-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SoutenanceService } from '../../services/soutenance.service';
import { Soutenance, StatutSoutenance } from '../../models/soutenance.model';

@Component({
  selector: 'app-soutenance-dashboard',
  templateUrl: './soutenance-dashboard.component.html',
  styleUrls: ['./soutenance-dashboard.component.scss']
})
export class SoutenanceDashboardComponent implements OnInit {
  soutenances: Soutenance[] = [];
  loading = true;
  displayedColumns: string[] = ['id', 'titreThese', 'dateSouhaitee', 'statut', 'actions'];
  currentUserId = 1001; // Should come from auth service

  constructor(
    private soutenanceService: SoutenanceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSoutenances();
  }

  loadSoutenances(): void {
    this.loading = true;
    this.soutenanceService.getSoutenancesByDoctorant(this.currentUserId).subscribe({
      next: (data) => {
        this.soutenances = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading soutenances:', error);
        this.loading = false;
      }
    });
  }

  getStatutLabel(statut: StatutSoutenance): string {
    return this.soutenanceService.getStatutLabel(statut);
  }

  getStatutColor(statut: StatutSoutenance): string {
    return this.soutenanceService.getStatutColor(statut);
  }

  viewDetails(id: number): void {
    this.router.navigate(['/soutenance/details', id]);
  }

  createNewDemande(): void {
    this.router.navigate(['/soutenance/nouvelle-demande']);
  }
}
