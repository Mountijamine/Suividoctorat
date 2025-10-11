// soutenance.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule } from '@angular/material/dialog';

// Routing
import { SoutenanceRoutingModule } from './soutenance-routing.module';

// Components
import { DemandeSoutenanceFormComponent } from './components/demande-soutenance-form/demande-soutenance-form.component';
import { SoutenanceDashboardComponent } from './components/soutenance-dashboard/soutenance-dashboard.component';
import { SoutenanceChecklistComponent } from './components/soutenance-checklist/soutenance-checklist.component';
import { AdminSoutenancePanelComponent } from './components/admin-soutenance-panel/admin-soutenance-panel.component';

@NgModule({
  declarations: [
    DemandeSoutenanceFormComponent,
    SoutenanceDashboardComponent,
    SoutenanceChecklistComponent,
    AdminSoutenancePanelComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    SoutenanceRoutingModule,
    // Material modules
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTableModule,
    MatSelectModule,
    MatStepperModule,
    MatExpansionModule,
    MatDialogModule
  ]
})
export class SoutenanceModule { }
