import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GestionVarietePage } from './gestion-variete';

@NgModule({
  declarations: [
    GestionVarietePage,
  ],
  imports: [
    IonicPageModule.forChild(GestionVarietePage),
  ],
  exports: [GestionVarietePage]
})
export class GestionVarietePageModule {}
