import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MembrePage } from './membre';
import { IonicImageViewerModule } from 'ionic-img-viewer';
import { DatePickerModule } from 'ion-datepicker';

@NgModule({
  declarations: [
    MembrePage,
  ],
  imports: [
    IonicPageModule.forChild(MembrePage), IonicImageViewerModule, DatePickerModule
  ],
})
export class MembrePageModule {}
