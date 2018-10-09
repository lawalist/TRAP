import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VarietePage } from './variete';

@NgModule({
  declarations: [
    VarietePage,
  ],
  imports: [
    IonicPageModule.forChild(VarietePage),
  ],
})
export class VarietePageModule {}
