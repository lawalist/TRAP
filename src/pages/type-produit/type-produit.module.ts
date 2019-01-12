import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TypeProduitPage } from './type-produit';

@NgModule({
  declarations: [
    TypeProduitPage,
  ],
  imports: [
    IonicPageModule.forChild(TypeProduitPage),
  ],
  exports: [
    TypeProduitPage
  ]
})
export class TypeProduitPageModule {}
