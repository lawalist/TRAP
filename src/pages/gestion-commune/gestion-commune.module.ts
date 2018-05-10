import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GestionCommunePage } from './gestion-commune';

@NgModule({
  declarations: [
    GestionCommunePage,
  ],
  imports: [
    IonicPageModule.forChild(GestionCommunePage),
  ],
  exports: [GestionCommunePage]
})
export class GestionCommunePageModule {}
