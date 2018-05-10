import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GestionProduitPage } from './gestion-produit';

@NgModule({
  declarations: [
    GestionProduitPage,
  ],
  imports: [
    IonicPageModule.forChild(GestionProduitPage),
  ],
  exports: [GestionProduitPage]
})
export class GestionProduitPageModule {}
