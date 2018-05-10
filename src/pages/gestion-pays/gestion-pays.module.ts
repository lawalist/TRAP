import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GestionPaysPage } from './gestion-pays';

@NgModule({
  declarations: [
    GestionPaysPage,
  ],
  imports: [
    IonicPageModule.forChild(GestionPaysPage),
  ],
  exports: [GestionPaysPage]
})
export class GestionPaysPageModule {}
