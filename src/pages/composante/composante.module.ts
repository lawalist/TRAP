import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ComposantePage } from './composante';

@NgModule({
  declarations: [
    ComposantePage,
  ],
  imports: [
    IonicPageModule.forChild(ComposantePage),
  ],
})
export class ComposantePageModule {}
