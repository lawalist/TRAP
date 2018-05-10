import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GestionRegionPage } from './gestion-region';

@NgModule({
  declarations: [
    GestionRegionPage,
  ],
  imports: [
    IonicPageModule.forChild(GestionRegionPage),
  ],
  exports: [GestionRegionPage]
})
export class GestionRegionPageModule {}
