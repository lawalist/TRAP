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

@NgModule({
  declarations: [
    MyApp,
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicStorageModule.forRoot(),
    IonicModule.forRoot(MyApp)
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
    Sim,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
