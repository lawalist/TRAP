import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GestionFederationPage } from './gestion-federation';

@NgModule({
  declarations: [
    GestionFederationPage,
  ],
  imports: [
    IonicPageModule.forChild(GestionFederationPage),
  ],
  exports: [GestionFederationPage]
})
export class GestionFederationPageModule {}
