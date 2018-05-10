import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GestionUnionPage } from './gestion-union';

@NgModule({
  declarations: [
    GestionUnionPage,
  ],
  imports: [
    IonicPageModule.forChild(GestionUnionPage),
  ],
  exports: [GestionUnionPage]
})
export class GestionUnionPageModule {}
