// soutenance-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DemandeSoutenanceFormComponent } from './components/demande-soutenance-form/demande-soutenance-form.component';
import { SoutenanceDashboardComponent } from './components/soutenance-dashboard/soutenance-dashboard.component';
import { AdminSoutenancePanelComponent } from './components/admin-soutenance-panel/admin-soutenance-panel.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: SoutenanceDashboardComponent
  },
  {
    path: 'nouvelle-demande',
    component: DemandeSoutenanceFormComponent
  },
  {
    path: 'admin',
    component: AdminSoutenancePanelComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SoutenanceRoutingModule { }
