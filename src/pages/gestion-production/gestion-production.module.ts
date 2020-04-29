import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GestionProductionPage } from './gestion-production';
import { IonicStepperModule } from 'ionic-stepper';

@NgModule({
  declarations: [
    GestionProductionPage,
  ],
  imports: [
    IonicStepperModule,
    IonicPageModule.forChild(GestionProductionPage),
  ],
})
export class GestionProductionPageModule {}
