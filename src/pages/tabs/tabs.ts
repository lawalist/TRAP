import { Component } from '@angular/core';
import { NavController, IonicPage } from 'ionic-angular';
import { global } from '../../global-variables/variable';
import { PouchdbProvider } from '../../providers/pouchdb-provider';

@IonicPage()
@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = 'GestionCentreTransformationPage';
  tab2Root = 'GestionProductionPage';
  tab3Root = 'GestionVentePage';

  constructor(public database: PouchdbProvider) {

  }

  public ionViewDidEnter() {
    //this.translate.use(global.langue)
    //console.log('syncing database')
    //this.database.sync();
    this.initData();
    //this.getConfig();
    /*this.database.getChangeListener().subscribe(data => {
      this.zone.run(() => {
        //this.items.push(data.doc);
      });
    });*/
  }


  initData(){
    //ajouter pays
    this.database.getDocById('pays').then((c) => {
      if(!c){
        this.database.createSimpleDocReturn(global.pays)
        }
    }).catch((err) => this.database.createSimpleDocReturn(global.pays));
    
    //ajouter region
    this.database.getDocById('region').then((c) => {
      if(!c){
        this.database.createSimpleDocReturn(global.region)
        }
    }).catch((err) => this.database.createSimpleDocReturn(global.region));
    
    //ajouter departement
    this.database.getDocById('departement').then((c) => {
      if(!c){
        this.database.createSimpleDocReturn(global.departement)
        }
    }).catch((err) => this.database.createSimpleDocReturn(global.departement));
    
    //ajouter commune
    this.database.getDocById('commune').then((c) => {
      if(!c){
        this.database.createSimpleDocReturn(global.commune)
        }
    }).catch((err) => this.database.createSimpleDocReturn(global.commune));
    
    //ajouter village
    this.database.getDocById('village').then((c) => {
      if(!c){
        this.database.createSimpleDocReturn(global.village)
        }
    }).catch((err) => this.database.createSimpleDocReturn(global.village));
  }


}
