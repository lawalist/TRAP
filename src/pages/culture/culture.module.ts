import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CulturePage } from './culture';

@NgModule({
  declarations: [
    CulturePage,
  ],
  imports: [
    IonicPageModule.forChild(CulturePage),
  ],
})
export class CulturePageModule {}
