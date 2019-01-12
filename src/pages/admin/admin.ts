import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController, ViewController, ToastController, NavParams, ModalController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { global } from '../../global-variables/variable';
import { PouchdbProvider } from '../../providers/pouchdb-provider';

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

  global:any = global;
  user: any = global.info_user;
  estManger: boolean = false;
  estAdmin: boolean = false;

  constructor(public navCtrl: NavController, public viewCtl: ViewController, public toastCtl: ToastController, public database: PouchdbProvider, public alertCtl: AlertController, public storage: Storage, public navParams: NavParams, public modalCtl: ModalController) {
  }



  ionViewDidLoad() {
    console.log('ionViewDidLoad AdminPage');
  }


  infoDB(){
    this.storage.get('TRAP_info_db').then((info_db) => {
    if(!info_db){
      //this.storage.set('ip_serveur', '127.0.0.1');
      info_db = global.info_db
    }//else{
      let alert = this.alertCtl.create({
      title: 'Informations de connexion au serveur',
      //cssClass: 'error',
      inputs: [
        {
          type: 'text',
          placeholder: 'Adrèsse hôte',
          name: 'ip',
          value: info_db.ip
        },
        {
          type: 'text',
          placeholder: 'Nom base de données',
          name: 'nom_db',
          value: info_db.nom_db
        },
       /* {
          type: 'select',
          placeholder: 'Mode connexion',
          name: 'mode_connexion',
          value: info_db.nom_db
        },
        {
          type: 'checkbox',
          label: 'Mode connexion',
          value: 'definitive',
          checked: false,
          name: 'mode_connexion',
        },*/
      ],
      buttons: [
        {
          //cssClass: 'error-border',
          text: 'Annuler',
          role: 'Cancel',
          handler: () => console.log('Changement ip serveur annuler')
        },
        {
          text: 'Valider',
          handler: (data) => {
            let i_db = {
              ip: data.ip.toString(),
              nom_db: data.nom_db.toString(),
              mode_connexion: 'ofline_online',
            }
            this.storage.set('TRAP_info_db', i_db);
            global.info_db = i_db;
            //global.ip_serveur = data.ip_serveur;
            this.database.syncIinfoDB(data.ip.toString(), data.nom_db.toString());
            
            let toast = this.toastCtl.create({
              message: 'Info DB mises à jour avec succes...',
              duration: 2000,
              position: 'top',
              showCloseButton: true,
              closeButtonText: 'ok',
              dismissOnPageChange: true
            });
            toast.present();
            
          }
        }
      ]
    }); 

    alert.present();
//       }
    });
}





reset(){
    let alert = this.alertCtl.create({
      title: 'Réinitialiser la base de données',
      message: 'Etes vous sûr de vouloir réinitialiser la base de données ?',
      buttons:[
        {
          text: 'Annuler',
          handler: () => console.log('suppression annulée')

        },
        {
          text: 'Confirmer',
          handler: () => {
            this.database.reset();
            /*let toast = this.toastCtl.create({
              message:'Base de données bien réinitialiser',
              position: 'top',
              duration: 1000
            });

            toast.present();
            this.navCtrl.setRoot('HomePage');*/
          }
        }
      ]
    });

    alert.present();

}

dismiss(){
  this.viewCtl.dismiss(/*this.cultures*/);
  //this.a_matricule = false;
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
