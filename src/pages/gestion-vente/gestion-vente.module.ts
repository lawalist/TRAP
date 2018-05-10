import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GestionVentePage } from './gestion-vente';

@NgModule({
  declarations: [
    GestionVentePage,
  ],
  imports: [
    IonicPageModule.forChild(GestionVentePage),
  ],
  exports: [GestionVentePage]
})
export class GestionVentePageModule {}
