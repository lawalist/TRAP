import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProduitGatePage } from './produit-gate';

@NgModule({
  declarations: [
    ProduitGatePage,
  ],
  imports: [
    IonicPageModule.forChild(ProduitGatePage),
  ],
})
export class ProduitGatePageModule {}
