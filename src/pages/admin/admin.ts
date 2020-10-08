import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController, AlertController, ViewController, ToastController, NavParams, ModalController } from 'ionic-angular';
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
  estManager: boolean = false;
  estAdmin: boolean = false;

  constructor(public navCtrl: NavController, public loadtingCtl: LoadingController, public viewCtl: ViewController, public toastCtl: ToastController, public database: PouchdbProvider, public alertCtl: AlertController, public storage: Storage, public navParams: NavParams, public modalCtl: ModalController) {
  }



  ionViewDidLoad() {
    console.log('ionViewDidLoad AdminPage');
  }


  sync(){
    this.database.syncAvecToast();
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
        }
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


  compacteRemoteDB(){
    this.database.compacteRemoteDB();
  }

  compacteLoacalDB(){
    this.database.compacteLocalDB();
  }

  

  viderCorbeille(){
    let loding = this.loadtingCtl.create({
      content: 'Suppresion en cours...'
    });

    loding.present();
    this.database.getAllDoc().then((docs) => {
      if(docs){
        docs.forEach((doc) => {
          if(doc.data && doc.data.deleted == true ){
            this.database.deleteReturn(doc);
          }
        });

        loding.dismiss();
      }else{
        loding.dismiss();
      }
    });
  }


  ajouterDesignDoc(){
    let filter_doc: any = {
      //Prend en parametre un tableau contenant la liste des code des union
          _id: '_design/filtrerDocByCodeCentreByCodeCentre',
          filters: {
            myfilter: function (doc, req) {
            var localite_doc = ['pays', 'region', 'commune', 'departement', 'village'/*, 'variete', 'culture'*/];
              var doc_pour_centre = [/*'federation', 'union', 'op', */'membre', 'centre', 'production', 'produit', 'vente', 'produit-gate', 'stock', 'donnees-enquete'];
              //seul l'admin à accès à la totalité des inforamtions de la base de donnée
              if(doc._id == '_design/filtrerDocByCodeCentre' || (req.query.roles && req.query.roles.length && (req.query.roles.indexOf('admin') != -1) || (req.query.roles.indexOf('_admin') != -1))){
                return 1
              }else {
              //si pas moderateur
              //if(req.query.roles.indexOf('moderateur') === -1){

                
                //localité et photos
                if(doc.type){
                  //acceder aux localités
                  if(localite_doc.indexOf(doc.type) !== -1){
                    return 1;
                  }
                  //acceder aux photo des membres des centres autorisés
                  else if(doc.type == 'photo'){
                    if(req.query.codes_centres && req.query.codes_centres.length > 0 && doc.code_centre){
                      return req.query.codes_centres.indexOf(doc.code_centre) !== -1;
                    }
                  }/*else{
                    //return 'doc type probleme => '+doc._id
                    throw({forbidden: 'doc sans data probleme => '+doc._id})
                  }*/
                }//fin doc.type
                
                else if(doc.data && doc.data.type){
                  //culture, variete et type-produit sont publiques, formulaire
                  if(doc.data.type == 'culture' || doc.data.type == 'variete' || doc.data.type == 'type-produit' || doc.data.type == 'formulaire-enquete'){
                    return 1;
                  }else 
                  //filtrer les fédérations par code_federation
                  if(doc.data.type == 'federation' && req.query.codes_federations && req.query.codes_federations.length > 0){
                    return req.query.codes_federations.indexOf(doc.data.code_federation) !== -1;
                  }else 
                  //filtrer les unions par code_union
                  if(doc.data.type == 'union' && req.query.codes_unions && req.query.codes_unions.length > 0){
                    return req.query.codes_unions.indexOf(doc.data.code_union) !== -1;
                  }else 
                  //filtrer les ops par code_op
                  if(doc.data.type == 'op' && req.query.codes_ops && req.query.codes_ops.length > 0){
                    return req.query.codes_ops.indexOf(doc.data.code_op) !== -1;
                  }else
                  //fitrer les autres document par code_centre
                  if(doc_pour_centre.indexOf(doc.data.type) !== -1){
                    //si filtre défini
                    if(req.query.codes_centres && req.query.codes_centres.length > 0){
                      //cas du protocole
                      return req.query.codes_centres.indexOf(doc.data.code_centre) !== -1;
                    }
                  }
                 else{
                  //throw({forbidden: 'erreur incomprise => '+doc._id})
                }
              }//fin  doc.data.type
            }//fin user filter
            }.toString()
          }
        }

        global.remoteSaved.get('_design/filtrerDocByCodeCentre').then((doc) => {
          console.log(doc)
          if(doc && doc._id){
            //doc existe
            //console.log('existe')
            //this.database.remote(doc)
            filter_doc._rev = doc._rev;
            global.remoteSaved.put(filter_doc).then((res) => alert('Filter mise à jour avec succes')).catch((err) => {
              alert('erreur mise à jour du filter du filter '+err)
              console.log(err)
            });
          }else{
            //créer le filtre de base
            //this.ajouterDesignDoc();
            console.log('non existe')
            global.remoteSaved.put(filter_doc).then((res) => alert('Filter ajouté avec succes')).catch((err) => {
              alert('erreur ajout du filter '+err)
              console.log(err)
            });
          }
          
        }).catch((err) => {
          console.log(err)
          //this.ajouterDesignDoc();
          global.remoteSaved.put(filter_doc).then((res) => alert('Filter ajouté avec succes')).catch((err) => {
            alert('erreur ajout du filter '+err)
            console.log(err)
          });
        });
    

        //global.remoteSaved.put(filter_doc).catch((err) => alert('erreur vers server '+err));
        //this.database.put(doc, doc._id).catch((err) => alert('erreur vers local '+err));
  }

  ajouterLoalDesignDoc(){
    let filter_doc: any = {
      //Prend en parametre un tableau contenant la liste des code des union
          _id: '_design/filtrerDocByCodeCentre',
          filters: {
            myfilter: function (doc, req) {
            var localite_doc = ['pays', 'region', 'commune', 'departement', 'village'/*, 'variete', 'culture'*/];
              var doc_pour_centre = [/*'federation', 'union', 'op', */'membre', 'centre', 'production', 'produit', 'vente', 'produit-gate', 'stock', 'donnees-enquete'];
              //seul l'admin à accès à la totalité des inforamtions de la base de donnée
              if(doc._id == '_design/filtrerDocByCodeCentre' || (req.query.roles && req.query.roles.length && (req.query.roles.indexOf('admin') != -1) || (req.query.roles.indexOf('_admin') != -1))){
                return 1
              }else {
              //si pas moderateur
              //if(req.query.roles.indexOf('moderateur') === -1){

                
                //localité et photos
                if(doc.type){
                  //acceder aux localités
                  if(localite_doc.indexOf(doc.type) !== -1){
                    return 1;
                  }
                  //acceder aux photo des membres des centres autorisés
                  else if(doc.type == 'photo'){
                    if(req.query.codes_centres && req.query.codes_centres.length > 0 && doc.code_centre){
                      return req.query.codes_centres.indexOf(doc.code_centre) !== -1;
                    }
                  }/*else{
                    //return 'doc type probleme => '+doc._id
                    throw({forbidden: 'doc sans data probleme => '+doc._id})
                  }*/
                }//fin doc.type
                
                else if(doc.data && doc.data.type){
                  //culture, variete et type-produit sont publiques
                  if(doc.data.type == 'culture' || doc.data.type == 'variete' || doc.data.type == 'type-produit' || doc.data.type == 'formulaire-enquete'){
                    return 1;
                  }else 
                  //filtrer les fédérations par code_federation
                  if(doc.data.type == 'federation' && req.query.codes_federations && req.query.codes_federations.length > 0){
                    return req.query.codes_federations.indexOf(doc.data.code_federation) !== -1;
                  }else 
                  //filtrer les unions par code_union
                  if(doc.data.type == 'union' && req.query.codes_unions && req.query.codes_unions.length > 0){
                    return req.query.codes_unions.indexOf(doc.data.code_union) !== -1;
                  }else 
                  //filtrer les ops par code_op
                  if(doc.data.type == 'op' && req.query.codes_ops && req.query.codes_ops.length > 0){
                    return req.query.codes_ops.indexOf(doc.data.code_op) !== -1;
                  }else
                  //fitrer les autres document par code_centre
                  if(doc_pour_centre.indexOf(doc.data.type) !== -1){
                    //si filtre défini
                    if(req.query.codes_centres && req.query.codes_centres.length > 0){
                      //cas du protocole
                      return req.query.codes_centres.indexOf(doc.data.code_centre) !== -1;
                    }
                  }
                 else{
                  //throw({forbidden: 'erreur incomprise => '+doc._id})
                }
              }//fin  doc.data.type
            }//fin user filter
            }.toString()
          }
        }

        this.database.getDocById('_design/filtrerDocByCodeCentre').then((doc) => {
          if(doc && doc._id){
            //doc existe
            //this.database.remote(doc)
            filter_doc._id = '_design/filtrerDocByCodeCentre';
            filter_doc._rev = doc._rev;
            this.database.createSimpleDocReturn(filter_doc).then((res) => alert('Filter mise à jour avec succes')).catch((err) => {
              alert('erreur mise à jour du filter du filter => '+err)
              console.log(err)
            });
          }else{
            //créer le filtre de base
            //this.ajouterDesignDoc();
            filter_doc._id = '_design/filtrerDocByCodeCentre';
            this.database.createSimpleDocReturn(filter_doc).then((res) => alert('Filter ajouté avec succes')).catch((err) => {
              alert('erreur ajout du filter => '+err)
              console.log(err)
            });
          }
          
        }).catch((err) => {
          console.log(err)
          //this.ajouterDesignDoc();
          filter_doc._id = '_design/filtrerDocByCodeCentre';
          this.database.createSimpleDocReturn(filter_doc).then((res) => alert('Filter ajouté avec succes')).catch((err) => {
            alert('erreur ajout du filter '+err)
            console.log(err)
          });
        });
    

        //global.remoteSaved.put(filter_doc).catch((err) => alert('erreur vers server '+err));
        //this.database.put(doc, doc._id).catch((err) => alert('erreur vers local '+err));
  }


}
