import { Component } from '@angular/core';
import { NavController, IonicApp, PopoverController, ToastController, NavParams, LoadingController, ViewController, App, AlertController, Platform, ModalController, IonicPage, MenuController, Events  } from 'ionic-angular';
import { PouchdbProvider } from '../../providers/pouchdb-provider';
//import { AjouterEssaiPage } from './ajouter-essai/ajouter-essai';
//import { DetailEssaiPage } from './detail-essai/detail-essai';
import { Storage } from '@ionic/storage'; 
import { File } from '@ionic-native/file';
import { global } from '../../global-variables/variable';
import * as FileSaver from 'file-saver';
import { Printer, PrintOptions } from '@ionic-native/printer';
import { Device } from '@ionic-native/device';
import { Sim } from '@ionic-native/sim';

//import {Culture} from '../../app/culture.interface'
//import { from } from 'rxjs/observable/from';
import { Validators, FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { RelationCultureComponent } from '../../components/relation-culture/relation-culture';
//import { variable } from '@angular/compiler/src/output/output_ast';

declare var cordova: any;

/**
 * Generated class for the CulturePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-culture',
  templateUrl: 'culture.html',
})
export class CulturePage {

  cultureForm: FormGroup;

  cultures: any = [];
  allCultures: any = [];
  id: any = '';
  loading: boolean = true;
  rechercher: any = false;
  detailCulture: boolean = false;
  selectedStyle: any = 'liste';
  culture: any;
  culture1: any;
  cultureAModifier: any;
  grandCulture: any;

  //type_culture: any = 'Mil';
  selectedLimit: any = 10;
  limits: any = [10, 25, 50, 100, 500, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 'Tous'];

  annee: any = '';
  code: any = '';
  today: any;
  imei: any = '';
  phonenumber: any = '';
  user: any = global.info_user;
  global:any = global;
  estManager: boolean = false;
  estAnimataire: boolean = false;
  aProfile:boolean = false;
  modifierFrom: boolean = false;
  estInstancier: boolean = false;
  ajoutForm: boolean = false;
  listeCultures:any  = ['Arachide', 'Igname', 'Maïs', 'Manioc', 'Mil', 'Niébé', 'Oignon', 'Pomme de terre', 'Riz', 'Sorgho', 'Tomate'];
  sauvegarder: boolean = true;

  constructor(public navCtrl: NavController, public popoverController: PopoverController, public loadtingCtl: LoadingController, public toastCtl: ToastController, public ionicApp: IonicApp, public viewCtl: ViewController, public formBuilder: FormBuilder, public sim: Sim, public device: Device, public modelCtl: ModalController, public a: App, public events: Events, public navParams: NavParams, public menuCtl: MenuController, public printer: Printer, public file: File, public platform: Platform, public storage: Storage, public servicePouchdb: PouchdbProvider, public alertCtl: AlertController) {
  
    this.menuCtl.enable(false, 'options');
      this.menuCtl.enable(false, 'connexion');
      this.menuCtl.enable(false, 'profile');
      
    
    events.subscribe('user:login', (user) => {
        if(user){
          this.aProfile = true;
          this.estManagerConnecter(user)
          this.estAnimataireConnecter(user)
        }else{
          this.aProfile = false;
          this.estManager = false;
          this.estAnimataire = false;
          this.user = global.info_user;
        }
        //alert(user)
        /*this.servicePouchdb.remoteSaved.getSession((err, response) => {
          if (response.userCtx.name) {
            //this.aProfile = true;
            this.user = global.info_user;
          }else{
            this.aProfile = false;
            this.user = {};
          }
        }, err => console.log(err));*/
      });
  
  }
  
  dismiss(){
    this.viewCtl.dismiss(/*this.cultures*/);
    //this.a_matricule = false;
  }
  closeToast(){
   let toast = this.ionicApp._toastPortal.getActive();
    toast.dismiss();
  }
  estManagerConnecter(user){
    if(user && user.roles){
      this.estManager = global.estManager(user.roles);
    }
  }

   estAnimataireConnecter(user){
    if(user && user.roles){
      this.estAnimataire = global.estAnimataire(user.roles);
    }
  }


  createDate(jour: any, moi: any, annee: any){
    let s = annee+'-';
    moi += 1;
    if(moi < 10){
      s += '0'+moi+'-';
    }else{
      s += moi+'-';
    }

    if(jour < 10){
      s += '0'+jour;
    }else{
      s += jour;
    }
    return s;
  }

  initForm(){

    let maDate = new Date();
    //this.dateAjout = maDate;
    let today = this.createDate(maDate.getDate(), maDate.getMonth(), maDate.getFullYear());
    this.cultureForm = this.formBuilder.group({
      type:['culture'],
      nom: ['', Validators.required],
      description: [''],
      today: [today],
      //deviceid: [''],
      //imei: [''],
      //phonenumber: [''],
      start: [maDate.toJSON()],
      //end: ['']
  });
}


partager(_id){
  let ids: any = [];
  ids.push(_id);

  let alert = this.alertCtl.create({
    title: 'Information de connexion au du serveur',
    //cssClass: 'error',
    inputs: [
      {
        type: 'text',
        placeholder: 'Adrèsse hôte',
        name: 'ip',
        value: '@ip:5984'
      },
      {
        type: 'text',
        placeholder: 'Nom DB',
        name: 'nom_db',
        value: 'nom_db'
      },
      {
        type: 'text',
        placeholder: 'Nom d\'utilisateur',
        name: 'username',
        //value: info_db.ip
      },
      {
        type: 'password',
        placeholder: 'Mot de passe',
        name: 'passwd',
        //value: info_db.nom_db
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
          let ip = data.ip.toString();
          let nom_db = data.nom_db.toString();
          let username = data.username.toString();
          let passwd = data.passwd.toString();
          let ids:any = [];
          ids.push(_id);
          this.servicePouchdb.replicationByDocsId(ids, ip, nom_db, username, passwd);
        }
      }
    ]
  }); 

  alert.present();
  
}





  clone(obj) {
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) {return obj};

    // Handle Date
    if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        let copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = this.clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        let copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = this.clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}


  getInfoSimEmei(){
    this.sim.getSimInfo().then(
        (info) => {
          if(info.cards.length > 0){
            info.cards.forEach((infoCard) => {
              if(infoCard.phoneNumber){
                this.phonenumber = infoCard.phoneNumber;
              }
              if(infoCard.deviceId){
                this.imei = infoCard.deviceId;
              }
            })
          }else{
            this.phonenumber = info.phoneNumber;
            this.imei = info.deviceId;
          }

        },
        (err) => console.log('Unable to get sim info: ', err)
      );
  }


  reinitForm(){
    //let maDate = new Date();
    //this.dateAjout = maDate;
    //this.today = this.createDate(maDate.getDate(), maDate.getMonth(), maDate.getFullYear());
    //this.chargerChamps('');
    //this.annee = '';
    
    this.initForm();
  }

  generateId(){
    var numbers='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    var randomArray=[]
    for(let i=0;i<30;i++){
      var rand = Math.floor(Math.random()*62)
      randomArray.push(numbers[rand])
    }
    
    var randomString=randomArray.join("");
    var Id= /*+pays+'-'+region+'-'+department+'-'+commune +'-' +village+ */''+randomString 
    return Id;
  }


  openRelationCulture(ev: any) {
    let popover = this.popoverController.create(RelationCultureComponent);
    popover.present({ev: ev});
  
    popover.onWillDismiss((res) => {
      if(res == 'variete'){
        this.varietes(this.culture);
      }
    })
  }
  


  existe(culture){
    //let c: any = {};
    let res: any = 0;
    //alert(producteur_connu+'  '+matricule_producteur)
    for(let i = 0; i < this.allCultures.length; i++){ 
      //c = this.allCultures[i];
      if(this.allCultures[i].doc.data.nom == culture.nom && (culture.code  && this.allCultures[i].doc.data.code != culture.code)){
        res = 1;
        break;
      }
    }

    return res;

    
  }


  actionForm(){
    if(this.sauvegarder){
      let culture = this.cultureForm.value;
      let res = this.existe(culture);
      if(res == 1){
        alert('Erreur! Enrégistrement impossible, cette culture existe déjà');
      }else{

        if(this.ajoutForm && !this.modifierFrom){
          let date = new Date();
          
          culture.deviceid = this.device.uuid;
          culture.phonenumber = this.phonenumber;
          culture.imei = this.imei; 
          culture.update_deviceid = this.device.uuid;
          culture.update_phonenumber = this.phonenumber;
          culture.update_imei = this.imei;
          culture.code = this.id;
          
          //union._id = 'fuma'+ id;
          culture.end = date.toJSON();
          //culture.code_essai = id;
          //champs.id_champs = id;
        
          let cultureFinal: any = {};
          cultureFinal._id = 'culture:'+ this.id;
          cultureFinal.data = culture
          let EF: any;
          this.servicePouchdb.createDocReturn(cultureFinal).then((res) => {
            /* let toast = this.toastCtl.create({
                message: 'Essai bien enregistré!',
                position: 'top',
                duration: 1000
              });*/
              
              
              //alert(res.rev)
              cultureFinal._rev = res.rev;
              let E: any = {};
              E.doc = cultureFinal;
              
              //this.viewCtl.dismiss(essaiFinal);
            // this.zone.run(() => {
              this.cultures.push(E);
            }).catch((err) => alert('err ajout '+err));
  
            
            this.ajoutForm = false;
            this.reinitForm();

          }else if(this.modifierFrom){
            let date = new Date();
            //let culture = this.cultureForm.value;
            this.culture1.nom = culture.nom;
            this.culture1.description = culture.description;
            this.culture1.update_deviceid = this.device.uuid;
            this.culture1.update_phonenumber = this.phonenumber;
            this.culture1.update_imei = this.imei;
            this.grandCulture.data = this.culture1;
            this.servicePouchdb.updateDocReturn(this.grandCulture).then((res) => {
              this.grandCulture._rev = res.rev;
              this.culture = this.grandCulture;
              this.reinitFormModifier();
              this.modifierFrom = false;
              this.detailCulture = true
              this.ajoutForm = false;
      
            
            let e: any = {};
              e.doc = this.culture;
              this.cultures.forEach((es, i) => {
                if(es.doc._id === this.cultureAModifier._id){
                  this.cultures[i] = e ;
                }
                
              });
            });
          }
      
        }  
    }
    
}

varietes(culture){
  let model = this.modelCtl.create('GestionVarietePage', {'culture': culture}, {enableBackdropDismiss: false});
  model.present();
}

annuler(){
    this.ajoutForm = false;

  if(this.modifierFrom){
    this.modifierFrom = false;
    this.ajoutForm = false;
    this.detailCulture = true;
    this.reinitFormModifier();
  } 
}

fermerDetail(){
    this.detailCulture = false;
    //this.essai = {};
  
}

supprimer(culture){
  let e: any = {};
  let alert = this.alertCtl.create({
    title: 'Suppression culture',
    message: 'Etes vous sûr de vouloir supprimer cette culture ?',
    inputs: [
      {
        type: 'checkbox',
        label: 'Supprimer définitivement!',
        value: 'oui',
        checked: false
        }
    ],
    buttons:[
      {
        text: 'Non',
        handler: () => console.log('suppression annulée')

      },
      {
        text: 'Oui',
        handler: (data) => {
          if(data.toString() === 'oui'){
            this.servicePouchdb.deleteReturn(culture).then((res) => {
              //let e: any = {};
              //e.doc = essai;
              this.cultures.forEach((es, i) => {
                if(es.doc._id === culture._id){
                  this.cultures.splice(i, 1);
                }
                
              });
  
              this.detailCulture = false;
              //this.navCtrl.pop();
            }, err => {
              console.log(err)
            }) ;
          }else{
            this.servicePouchdb.deleteDocReturn(culture).then((res) => {
              //let e: any = {};
              //e.doc = essai;
              this.cultures.forEach((es, i) => {
                if(es.doc._id === culture._id){
                  this.cultures.splice(i, 1);
                }
                
              });
  
              this.detailCulture = false;
              //this.navCtrl.pop();
            }, err => {
              console.log(err)
            }) ;
          }
          
        }
      }
    ]
  });

  alert.present();
}

option(){
  this.menuCtl.enable(true, 'options');
  this.menuCtl.enable(false, 'connexion');
  this.menuCtl.enable(false, 'profile');
  this.menuCtl.toggle()
}

profile(){
  this.menuCtl.enable(false, 'options');
  this.menuCtl.enable(false, 'connexion');
  this.menuCtl.enable(true, 'profile');
  this.menuCtl.toggle()
}

connexion(){
  this.menuCtl.enable(false, 'options');
  this.menuCtl.enable(true, 'connexion');
  this.menuCtl.enable(false, 'profile');
  this.menuCtl.toggle() 
}


 sync(){
  this.servicePouchdb.syncAvecToast(this.getCultures());
  //this.pourCreerForm();
}

exportExcel(){

  let date = new Date();
  //let dateHeure = date.toLocaleDateString()+ date.toLocaleTimeString();// + date.getTime().toLocaleString();
  let nom = date.getDate().toString() +'_'+ (date.getMonth() + 1).toString() +'_'+ date.getFullYear().toString() +'_'+ date.getHours().toString() +'_'+ date.getMinutes().toString() +'_'+ date.getSeconds().toString();

  let blob = new Blob([document.getElementById('tableau').innerHTML], {
    //type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
    type: "text/plain;charset=utf-8"
    //type: 'application/vnd.ms-excel;charset=utf-8'
    //type: "application/vnd.ms-excel;charset=utf-8"
  });

  if(!this.platform.is('android')){
    FileSaver.saveAs(blob, 'cultures'+nom+'.xls');
  }else{

    let fileDestiny: string = cordova.file.externalRootDirectory;
    this.file.writeFile(fileDestiny, 'cultures_'+nom+'.xls', blob).then(()=> {
        alert("Fichier créé dans: " + fileDestiny);
    }).catch(()=>{
        alert("Erreur de création du fichier dans: " + fileDestiny);
    })
  }
}

onPrint(){
  let options: PrintOptions = {
      //name: 'Rapport',
      //printerId: 'printer007',
      duplex: true,
      landscape: true,
      grayscale: true
  };
  let content = document.getElementById('tableau').innerHTML;
  this.printer.print(content, options);
}


ionViewDidEnter(){
  //this.getEssais()
/*this.servicePouchdb.remoteSaved.getSession((err, response) => {
  if (err) {
    this.aProfile = false;
  } else if (!response.userCtx.name) {
    this.aProfile = false;
  } else {
    this.aProfile = true;
  }
});*/


//setInterval(this.servicePouchdb.testConnexion(), 2000)
if(!this.estInstancier){
this.getCultures();
this.estInstancier = true;
}

//this.pourCreerForm();
this.getInfoSimEmei();
this.estInstancier = true;

///this.corrigerErreur();
//this.servicePouchdb.findByTypeData()
}



ionViewDidLoad() { 

  this.initForm();

}


choixLimit(){
  this.rechercher = true;
  if(this.selectedLimit !== 'Tous'){
    this.cultures = this.allCultures.slice(0, this.selectedLimit);
    this.rechercher = false;
  }else{
    this.cultures = this.allCultures;
    this.rechercher = false;
  }
  
}

choixLimit1(){
  this.rechercher = true;

  if(this.selectedLimit === 'Tous'){
    this.servicePouchdb.getPlageDocsRapide('culture', 'culture:\uffff').then((c) => {
      if(c){
          this.cultures = c;
          this.allCultures = c;
          this.rechercher = false;
      }else{
        this.rechercher = false;
      }
    });

    }else{
      this.servicePouchdb.getPlageDocsRapideAvecLimit('culture', 'culture:\uffff', this.selectedLimit).then((p) => {
        if(p){
          this.cultures = p;
          this.allCultures = p;
          this.rechercher = false;
        }else{
          this.rechercher = false;
        }

      });

  }
}

 getCultures(refresher: any = ''){
  if(refresher === ''){
    this.rechercher = true;
  }



  if(this.selectedLimit === 'Tous'){
    // this.servicePouchdb.getPlageDocs('essai', 'essai:\uffff').then((e) => {
      //   if(e){
          //cas ou le producteur est connu

            this.servicePouchdb.getPlageDocsRapide('culture:', 'culture:\uffff').then((c) => {
              if(c){
                /*let cs:any = [];
                c.forEach((cultrue) => {
                  if(cultrue.doc.data.type == 'culture'){
                    cs.push(cultrue);
                  }
                })*/
                  this.cultures = c;
                  this.allCultures = c;
                  this.rechercher = false;
                  if(refresher !== ''){
                  refresher.complete();
                }
              }else{
                this.rechercher = false;
                if(refresher !== ''){
                  refresher.complete();
                }
              }
            });

      
      //  }
      // });
    }else{

  
        this.servicePouchdb.getPlageDocsRapideAvecLimit('culture:', 'culture:\uffff', this.selectedLimit).then((c) => {
          if(c){
            /*let cs: any = [];
            c.forEach((culture) => {
              if(culture.doc.data.type == 'culture'){
                cs.push(culture);
              }
            })*/
            this.cultures = c;
            //this.allEssais = e;
            this.rechercher = false;
            if(refresher !== ''){
              refresher.complete();
            }
          }else{
            this.rechercher = false;
            if(refresher !== ''){
              refresher.complete();
            }
          }

        });

        this.servicePouchdb.getPlageDocsRapide('culture:', 'culture:\uffff').then((c) => {
          if(c){
            /*let cs: any = [];
            c.forEach((culture) => {
              if(culture.doc.data.type == 'culture'){
                cs.push(culture);
              }
            })*/
            this.allCultures = c;
            //this.rechercher = false;
          }
        });

    }
}



editer(culture, dbclick: boolean = false){
  if(!dbclick || (dbclick && this.user && this.user.roles && global.estManager(this.user.roles))){
    this.grandCulture = culture;
    this.culture1 = this.grandCulture.data;
    let Culture = {
      nom: culture.data.nom, // required
      description: culture.data.description,
      type: culture.data.type,
      today: culture.data.today,
      start: culture.data.start
  }
  //this.cultureForm.patchValue(Culture);

    
    this.detailCulture = false;

    this.ajoutForm = true;

    this.modifierFrom = true;
    this.cultureAModifier = culture;
 }
}

reinitFormModifier(){
  this.grandCulture = {};
  this.culture1 = {};
  //this.cultureForm.reset({variables: []});

  this.initForm();
  //this.type_culture = '';
  this.annee = '';
}


 ajouter(){

    let maDate = new Date();
    this.today = this.createDate(maDate.getDate(), maDate.getMonth(), maDate.getFullYear());
    this.id = this.generateId();
    this.ajoutForm = true;
    
}


detail(culture){
  this.culture = culture;

  this.detailCulture = true;

}



getItems(ev: any) {
  // Reset items back to all of the items
  //this.essais = this.allEssais;

  // set val to the value of the searchbar
  let val = ev.target.value;

  // if the value is an empty string don't filter the items
  if (val && val.trim() != '' && val.trim() != 'FM-' && val.trim() != 'fm-') {
    this.cultures = this.allCultures.filter((item, index) => {
      return (item.doc.data.nom.toLowerCase().indexOf(val.toLowerCase()) > -1);
    });
  }else{
    this.choixLimit();
  }
} 


}
