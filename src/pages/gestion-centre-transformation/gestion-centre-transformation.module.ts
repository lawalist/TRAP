import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GestionCentreTransformationPage } from './gestion-centre-transformation';

@NgModule({
  declarations: [
    GestionCentreTransformationPage,
  ],
  imports: [
    IonicPageModule.forChild(GestionCentreTransformationPage),
  ],
  exports: [GestionCentreTransformationPage]
})
export class GestionCentreTransformationPageModule {}
