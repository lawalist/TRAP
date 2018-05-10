import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GestionVillagePage } from './gestion-village';

@NgModule({
  declarations: [
    GestionVillagePage,
  ],
  imports: [
    IonicPageModule.forChild(GestionVillagePage),
  ],
  exports: [GestionVillagePage]
})
export class GestionVillagePageModule {}
