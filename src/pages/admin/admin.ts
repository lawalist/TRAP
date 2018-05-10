import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';

/**
 * Generated class for the AdminPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-admin',
  templateUrl: 'admin.html',
})
export class AdminPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtl: ModalController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AdminPage');
  }

  gestionPays(){
    let model = this.modalCtl.create('GestionPaysPage', {'liste': true});
    model.present();
  }

  gestionRegions(){
    let model = this.modalCtl.create('GestionRegionPage', {'liste': true});
    model.present();
  }

  gestionDepartements(){
    let model = this.modalCtl.create('GestionDepartementPage', {'liste': true});
    model.present();
  }

  gestionCommunes(){
    let model = this.modalCtl.create('GestionCommunePage', {'liste': true});
    model.present();
  }

  gestionVillages(){
    let model = this.modalCtl.create('GestionVillagePage', {'liste': true});
    model.present();
  }


}
