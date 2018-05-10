import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GestionProductionPage } from './gestion-production';

@NgModule({
  declarations: [
    GestionProductionPage,
  ],
  imports: [
    IonicPageModule.forChild(GestionProductionPage),
  ],
})
export class GestionProductionPageModule {}
