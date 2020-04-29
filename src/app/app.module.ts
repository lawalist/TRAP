import { NgModule, ErrorHandler, enableProdMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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
import { RelationCentreComponent } from '../components/relation-centre/relation-centre';
import { RelationFederationComponent } from '../components/relation-federation/relation-federation';
import { RelationUnionComponent } from '../components/relation-union/relation-union';
import { RelationOpComponent } from '../components/relation-op/relation-op';
import { RelationCultureComponent } from '../components/relation-culture/relation-culture';
import { RelationTypeProduitComponent } from '../components/relation-type-produit/relation-type-produit';
import { RelationProduitComponent } from '../components/relation-produit/relation-produit';
import { RelationVenteComponent } from '../components/relation-vente/relation-vente';
import { RelationProduitGateComponent } from '../components/relation-produit-gate/relation-produit-gate';
import { RelationProductionComponent } from '../components/relation-production/relation-production';
import { IonicStepperModule } from 'ionic-stepper';
//Activé angular en mode production
enableProdMode();

@NgModule({
  declarations: [
    MyApp,
    RelationCentreComponent,
    RelationFederationComponent,
    RelationUnionComponent,
    RelationOpComponent,
    RelationCultureComponent,
    RelationTypeProduitComponent,
    RelationProduitComponent,
    RelationVenteComponent,
    RelationProduitGateComponent,
    RelationProductionComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    IonicStepperModule,
    IonicStorageModule.forRoot(),
    IonicModule.forRoot(MyApp),
    IonicImageViewerModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    RelationCentreComponent,
    RelationFederationComponent,
    RelationUnionComponent,
    RelationOpComponent,
    RelationCultureComponent,
    RelationTypeProduitComponent,
    RelationProduitComponent,
    RelationVenteComponent,
    RelationProduitGateComponent,
    RelationProductionComponent,
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
