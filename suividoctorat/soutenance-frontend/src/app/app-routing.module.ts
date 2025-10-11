import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/soutenance',
    pathMatch: 'full'
  },
  {
    path: 'soutenance',
    loadChildren: () => import('./soutenance/soutenance.module').then(m => m.SoutenanceModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
