import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TypeProduitPage } from './type-produit';
import { IonicStepperModule } from 'ionic-stepper';

@NgModule({
  declarations: [
    TypeProduitPage,
  ],
  imports: [
    IonicStepperModule,
    IonicPageModule.forChild(TypeProduitPage),
  ],
  exports: [
    TypeProduitPage
  ]
})
export class TypeProduitPageModule {}
