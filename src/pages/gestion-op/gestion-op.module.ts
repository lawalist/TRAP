import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GestionOpPage } from './gestion-op';

@NgModule({
  declarations: [
    GestionOpPage,
  ],
  imports: [
    IonicPageModule.forChild(GestionOpPage),
  ],
  exports: [GestionOpPage]
})
export class GestionOpPageModule {}
