import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

//Providers
import { IonicStorageModule } from '@ionic/storage';
import { PouchdbProvider } from '../providers/pouchdb-provider';
import { Device } from '@ionic-native/device'
import { File } from '@ionic-native/file'
import { Printer } from '@ionic-native/printer'
import { Sim } from '@ionic-native/sim'

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { Http } from '@angular/http';
import { HttpModule } from '@angular/http';
import { DatePicker } from '@ionic-native/date-picker';
import { Camera } from '@ionic-native/camera';
import { ImagePicker } from '@ionic-native/image-picker';
import { IonicImageViewerModule } from 'ionic-img-viewer';

@NgModule({
  declarations: [
    MyApp,
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicStorageModule.forRoot(),
    IonicModule.forRoot(MyApp),
    IonicImageViewerModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    PouchdbProvider,
    Device,
    File,
    Printer,
    Sim, Camera, DatePicker, ImagePicker,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
