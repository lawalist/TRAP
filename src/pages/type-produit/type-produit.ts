import { Component } from '@angular/core';
import { NavController, IonicApp, ActionSheetController, ToastController, NavParams, LoadingController, ViewController, App, AlertController, Platform, ModalController, IonicPage, MenuController, Events  } from 'ionic-angular';
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
import { Validators, FormGroup, FormArray, FormBuilder } from '@angular/forms';
declare var cordova: any;
/**
 * Generated class for the TypeProduitPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
 
@IonicPage()
@Component({
  selector: 'page-type-produit',
  templateUrl: 'type-produit.html',
})
export class TypeProduitPage {

  typeProduitForm: FormGroup;

  typeProduits: any = [];
  AllTypeProduits: any = [];
  id: any = '';
  loading: boolean = true;
  rechercher: any = false;
  detailTypeProduit: boolean = false;
  selectedStyle: any = 'liste';
  typeProduit: any;
  typeProduit1: any;
  typeProduitAModifier: any;
  grandTypeProduit: any;

  //type_typeProduit: any = 'Mil';
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
  cultures:any  = [];
  sauvegarder: boolean = true;
  ingredients: any = [];

  constructor(public navCtrl: NavController, public actionSheetCtrl: ActionSheetController, public loadtingCtl: LoadingController, public toastCtl: ToastController, public ionicApp: IonicApp, public viewCtl: ViewController, public formBuilder: FormBuilder, public sim: Sim, public device: Device, public modelCtl: ModalController, public a: App, public events: Events, public navParams: NavParams, public menuCtl: MenuController, public printer: Printer, public file: File, public platform: Platform, public storage: Storage, public servicePouchdb: PouchdbProvider, public alertCtl: AlertController) {
  
    this.menuCtl.enable(false, 'options');
      this.menuCtl.enable(false, 'connexion');
      this.menuCtl.enable(false, 'profile');
      
    
    events.subscribe('user:login', (user) => {
        if(user){
          this.aProfile = true;
          this.estMangerConnecter(user)
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


  actions() {
    const actionSheet = this.actionSheetCtrl.create({
      title: 'Actions',
      buttons: [
        {
          text: 'Modifier',
          //role: 'destructive',
          icon: 'create',
          handler: () => {
            this.editer(this.typeProduit)
          }
        },
        {
          text: 'Produits',
          role: 'destructive',
          icon: 'redo',
          cssClass: 'myActionSheetBtnStyle',
          handler: () => {
            this.getProduits(this.typeProduit._id, this.typeProduit.data.nom);
          }
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          icon: 'trash',
          cssClass: 'myActionSheetBtnStyle',
          handler: () => {
            this.supprimer(this.typeProduit);
          }
        }
        ,{
          text: 'Fermer',
          role: 'cancel',
          icon: 'close',
          handler: () => {
            console.log('Cancel');
          }
        }
      ]
    });
    actionSheet.present();
  }


  
  options() {
    const actionSheet = this.actionSheetCtrl.create({
      title: 'Actions',
      buttons: [
        {
          text: 'Ajouter',
          //role: 'destructive',
          icon: 'add',
          handler: () => {
            this.ajouter();
          }
        },{
          text: 'Exporter',
          //role: 'destructive',
          icon: 'logo-windows',
          handler: () => {
            this.exportExcel();
          }
        },{
          text: 'Imprimer',
          //role: 'destructive',
          icon: 'print',
          handler: () => {
            this.onPrint();
          }
        }
        ,{
          text: 'Fermer',
          role: 'cancel',
          icon: 'close',
          handler: () => {
            console.log('Cancel');
          }
        }
      ]
    });
    actionSheet.present();
  }


  getProduits(id_type, nom_type){
    let model = this.modelCtl.create('GestionProduitPage', {'id_type_produit': id_type, 'nom_type_produit': nom_type}, {enableBackdropDismiss: false});
    model.present();
  }
  
  dismiss(){
    this.viewCtl.dismiss(/*this.typeProduits*/);
    //this.a_matricule = false;
  }
  closeToast(){
   let toast = this.ionicApp._toastPortal.getActive();
    toast.dismiss();
  }
  estMangerConnecter(user){
    if(user && user.roles){
      this.estManager = global.estManager(user.roles);
    }
  }

   estAnimataireConnecter(user){
    if(user && user.roles){
      this.estAnimataire = global.estAnimataire(user.roles);
    }
  }

  getCultures(){
    this.servicePouchdb.getPlageDocsRapide('culture:', 'culture:\uffff').then((c) => {
      if(c){
          this.cultures = c;
        }
    });
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
    this.typeProduitForm = this.formBuilder.group({
      type:['type-produit'],
      nom: ['', Validators.required],
      culture: [''],
      id_culture: [''],
      origine: [''],
      ingredients: this.formBuilder.array([]),
      description: [''],
      today: [today],
      //deviceid: [''],
      //imei: [''],
      //phonenumber: [''],
      start: [maDate.toJSON()],
      //end: ['']
  });
}


editForm(typeProduit){

  let maDate = new Date();
  //this.dateAjout = maDate;
  let today = this.createDate(maDate.getDate(), maDate.getMonth(), maDate.getFullYear());
  this.typeProduitForm = this.formBuilder.group({
    //type:['type-produit'],
    nom: [typeProduit.nom, Validators.required],
    culture: [typeProduit.culture],
    id_culture: [typeProduit.id_culture],
    origine: [typeProduit.origine],
    code: [typeProduit.code],
    //ingredients: this.formBuilder.array([]),
    description: [typeProduit.description],
    today: [typeProduit.today],
    //deviceid: [''],
    //imei: [''],
    //phonenumber: [''],
    //start: [maDate.toJSON()],
    //end: ['']
});
}


addIngredient(ingredients){
  let model = this.modelCtl.create('IngredientPage', {'ingredients': ingredients}, {enableBackdropDismiss: false});
  model.present();
  
  model.onDidDismiss((ingredient) => {
    if(ingredient){
      this.ingredients.push(ingredient)
    }
    //this.typeProduitForm.controls.ingredients.setValue(ingredients);
    //const control = <FormArray>this.typeProduitForm.controls['ingredients'];
    //control.push(ingredient);
  })
}

deleteIngredient(i, ind){
  this.ingredients.splice(ind, 1);
  //const control = <FormArray>this.typeProduitForm.controls['ingredients'];
  //control.removeAt(ind);
}

editerIngredient(i, ind, ingredients){
  let model = this.modelCtl.create('IngredientPage', {'ingredient': i, 'index': ind, 'ingredients': ingredients}, {enableBackdropDismiss: false});
  model.present();
  model.onDidDismiss((ingredient) => {
    if(ingredient){
      this.ingredients[ind] = ingredient;
    }
    //const control = <FormArray>this.typeProduitForm.controls['ingredients'];
    //control[ind] = ingredient;
  });
}

detailIngredient(i){
  let model = this.modelCtl.create('IngredientPage', {'ingredient': i, 'detail': 'true'}, {enableBackdropDismiss: false});
  model.present();
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
    var numbers='0123456789ABCDEFGHIJKLMNPQRSTUVWYZ'
    var randomArray=[]
    for(let i=0;i<6;i++){
      var rand = Math.floor(Math.random()*34)
      randomArray.push(numbers[rand])
    }
    
    var randomString=randomArray.join("");
    var Id= /*+pays+'-'+region+'-'+department+'-'+commune +'-' +village+ */''+randomString 
    return Id;
  }


  existe(typeProduit){
    //let c: any = {};
    let res: any = 0;
    //alert(producteur_connu+'  '+matricule_producteur)
    for(let i = 0; i < this.AllTypeProduits.length; i++){ 
      //c = this.AllTypeProduits[i];
      if((!typeProduit.code && this.AllTypeProduits[i].doc.data.nom == typeProduit.nom) || (typeProduit.code  && this.AllTypeProduits[i].doc.data.code != typeProduit.code && this.AllTypeProduits[i].doc.data.nom == typeProduit.nom)){
        res = 1;
        break;
      }
    }

    return res;

    
  }


  actionForm(){
    if(this.sauvegarder){
      let typeProduit = this.typeProduitForm.value;
      let res = this.existe(typeProduit);
      if(res == 1){
        alert('Erreur! Enrégistrement impossible, ce type de produit existe déjà !!');
      }else{

        if(this.ajoutForm && !this.modifierFrom){
          let date = new Date();
          this.cultures.forEach((c) => {
            if(typeProduit.culture == c.doc.data.nom){
              typeProduit.id_culture = c.doc._id;
            }
          })
          
          typeProduit.ingredients = this.ingredients;
          typeProduit.deviceid = this.device.uuid;
          typeProduit.phonenumber = this.phonenumber;
          typeProduit.imei = this.imei; 
          typeProduit.update_deviceid = this.device.uuid;
          typeProduit.update_phonenumber = this.phonenumber;
          typeProduit.update_imei = this.imei;
          typeProduit.code = this.id;
          
          //union._id = 'fuma'+ id;
          typeProduit.end = date.toJSON();
          //typeProduit.code_essai = id;
          //champs.id_champs = id;
        
          let typeProduitFinal: any = {};
          typeProduitFinal._id = 'type-produit:'+ this.id;
          typeProduitFinal.data = typeProduit
          let EF: any;
          this.servicePouchdb.createDocReturn(typeProduitFinal).then((res) => {
            /* let toast = this.toastCtl.create({
                message: 'Essai bien enregistré!',
                position: 'top',
                duration: 1000
              });*/
              
              
              //alert(res.rev)
              typeProduitFinal._rev = res.rev;
              let E: any = {};
              E.doc = typeProduitFinal;
              
              //this.viewCtl.dismiss(essaiFinal);
            // this.zone.run(() => {
              this.typeProduits.push(E);
              this.ingredients = [];
            }).catch((err) => alert('err ajout '+err));
  
            
            this.ajoutForm = false;
            this.reinitForm();

          }else if(this.modifierFrom){
            let date = new Date();
            //let typeProduit = this.typeProduitForm.value;
            this.typeProduit1.nom = typeProduit.nom;
            this.typeProduit1.origine = typeProduit.origine;
            //this.typeProduit1.ingredients = typeProduit.ingredients;
            this.typeProduit1.culture = typeProduit.culture;
            this.cultures.forEach((c) => {
              if(typeProduit.culture == c.doc.data.nom){
                this.typeProduit1.id_culture = c.doc._id;
              }
            })
            this.typeProduit1.ingredients = this.ingredients;
            this.typeProduit1.description = typeProduit.description;
            this.typeProduit1.update_deviceid = this.device.uuid;
            this.typeProduit1.update_phonenumber = this.phonenumber;
            this.typeProduit1.update_imei = this.imei;
            this.grandTypeProduit.data = this.typeProduit1;
            this.servicePouchdb.updateDocReturn(this.grandTypeProduit).then((res) => {
              this.grandTypeProduit._rev = res.rev;
              this.updateProduit(this.grandTypeProduit);
              this.typeProduit = this.grandTypeProduit;
              this.reinitFormModifier();
              /*this.modifierFrom = false;
              this.detailTypeProduit = true
              this.ajoutForm = false;*/
            let e: any = {};
              e.doc = this.typeProduit;
              this.typeProduits.forEach((es, i) => {
                if(es.doc._id === this.typeProduitAModifier._id){
                  this.typeProduits[i] = e ;
                }
                
              });
            });
          }
      
        }  
    }
    
}

updateProduit(typeProduit){
  let loadin = this.loadtingCtl.create({
    content: 'Modification des produits associés en cours....'
  });

  loadin.present();
  this.servicePouchdb.getPlageDocsRapide('produit','produit:\uffff').then((produits) => {
    if(produits){
      produits.forEach((p) => {
        if(p.doc.data.id_type_produit == typeProduit._id){
          p.doc.data.nom_type_produit = typeProduit.data.nom;
          p.doc.data.code_type_produit = typeProduit.data.code;
          p.doc.data.ingredients = typeProduit.data.ingredients;
          this.servicePouchdb.updateDoc(p.doc);
        }
      });

      loadin.dismiss();
      let toast = this.toastCtl.create({
        message: 'produits bien sauvegardée!',
        position: 'top',
        duration: 1000
      });

      this.modifierFrom = false;
      this.detailTypeProduit = true
      this.ajoutForm = false;
      toast.present();
    }else{
      loadin.dismiss();
      let toast = this.toastCtl.create({
        message: 'produits bien sauvegardée!',
        position: 'top',
        duration: 1000
      });

      this.modifierFrom = false;
      this.detailTypeProduit = true
      this.ajoutForm = false;
      toast.present();
    }
  }).catch((err) => {
      loadin.dismiss();
      let toast = this.toastCtl.create({
        message: 'produits bien sauvegardée!',
        position: 'top',
        duration: 1000
      });

      this.modifierFrom = false;
      this.detailTypeProduit = true
      this.ajoutForm = false;
      toast.present();
  });
}
annuler(){
    this.ajoutForm = false;

  if(this.modifierFrom){
    this.modifierFrom = false;
    this.ajoutForm = false;
    this.detailTypeProduit = true;
    this.reinitFormModifier();
  } 
}

fermerDetail(){
    this.detailTypeProduit = false;
    //this.essai = {};
  
}

supprimer(typeProduit){
  let e: any = {};
  let alert = this.alertCtl.create({
    title: 'Suppression type produit',
    message: 'Etes vous sûr de vouloir supprimer ce type de produit ?',
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
            this.servicePouchdb.deleteReturn(typeProduit).then((res) => {
              //let e: any = {};
              //e.doc = essai;
              this.typeProduits.forEach((es, i) => {
                if(es.doc._id === typeProduit._id){
                  this.typeProduits.splice(i, 1);
                }
                
              });
  
              this.detailTypeProduit = false;
              //this.navCtrl.pop();
            }, err => {
              console.log(err)
            }) ;
          }else{
            this.servicePouchdb.deleteDocReturn(typeProduit).then((res) => {
              //let e: any = {};
              //e.doc = essai;
              this.typeProduits.forEach((es, i) => {
                if(es.doc._id === typeProduit._id){
                  this.typeProduits.splice(i, 1);
                }
                
              });
  
              this.detailTypeProduit = false;
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
  this.servicePouchdb.syncAvecToast(this.gettypeProduits());
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
    FileSaver.saveAs(blob, 'type-produits'+nom+'.xls');
  }else{

    let fileDestiny: string = cordova.file.externalRootDirectory;
    this.file.writeFile(fileDestiny, 'type-produits_'+nom+'.xls', blob).then(()=> {
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
this.gettypeProduits();
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
    this.typeProduits = this.AllTypeProduits.slice(0, this.selectedLimit);
    this.rechercher = false;
  }else{
    this.typeProduits = this.AllTypeProduits;
    this.rechercher = false;
  }
  
}

choixLimit1(){
  this.rechercher = true;

  if(this.selectedLimit === 'Tous'){
    this.servicePouchdb.getPlageDocsRapide('type-produit', 'type-produit:\uffff').then((c) => {
      if(c){
          this.typeProduits = c;
          this.AllTypeProduits = c;
          this.rechercher = false;
      }else{
        this.rechercher = false;
      }
    });

    }else{
      this.servicePouchdb.getPlageDocsRapideAvecLimit('type-produit', 'type-produit:\uffff', this.selectedLimit).then((p) => {
        if(p){
          this.typeProduits = p;
          this.AllTypeProduits = p;
          this.rechercher = false;
        }else{
          this.rechercher = false;
        }

      });

  }
}

 gettypeProduits(refresher: any = ''){
  if(refresher === ''){
    this.rechercher = true;
  }



  if(this.selectedLimit === 'Tous'){
    // this.servicePouchdb.getPlageDocs('essai', 'essai:\uffff').then((e) => {
      //   if(e){
          //cas ou le producteur est connu

            this.servicePouchdb.getPlageDocsRapide('type-produit:', 'type-produit:\uffff').then((c) => {
              if(c){
                /*let cs:any = [];
                c.forEach((culture) => {
                  if(culture.doc.data.type == 'typeProduit'){
                    cs.push(culture);
                  }
                })*/
                  this.typeProduits = c;
                  this.AllTypeProduits = c;
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

  
        this.servicePouchdb.getPlageDocsRapideAvecLimit('type-produit:', 'type-produit:\uffff', this.selectedLimit).then((c) => {
          if(c){
            /*let cs: any = [];
            c.forEach((typeProduit) => {
              if(typeProduit.doc.data.type == 'typeProduit'){
                cs.push(typeProduit);
              }
            })*/
            this.typeProduits = c;
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

        this.servicePouchdb.getPlageDocsRapide('type-produit:', 'type-produit:\uffff').then((c) => {
          if(c){
            /*let cs: any = [];
            c.forEach((typeProduit) => {
              if(typeProduit.doc.data.type == 'typeProduit'){
                cs.push(typeProduit);
              }
            })*/
            this.AllTypeProduits = c;
            //this.rechercher = false;
          }
        });

    }
}



editer(typeProduit2, dbclick: boolean = false){
  if(!dbclick || (dbclick && this.user && this.user.roles && global.estAnimataire(this.user.roles))){
    this.getCultures();
    this.grandTypeProduit = typeProduit2;
    this.typeProduit1 = this.grandTypeProduit.data;
    this.ingredients = this.grandTypeProduit.data.ingredients;
    let typeProduit = {
      nom: typeProduit2.data.nom, // required
      description: typeProduit2.data.description,
      culture: typeProduit2.data.nom,
      origine: typeProduit2.data.origine,
      type: typeProduit2.data.type,
      ingredients: typeProduit2.data.ingredients,
      today: typeProduit2.data.today,
      start: typeProduit2.data.start
  }
  //this.typeProduitForm.patchValue(typeProduit);

  this.editForm(typeProduit2.data)
    
    this.detailTypeProduit = false;

    this.ajoutForm = true;

    this.modifierFrom = true;
    this.typeProduitAModifier = typeProduit;
 }
}

reinitFormModifier(){
  this.ingredients = [];
  this.grandTypeProduit = {};
  this.typeProduit1 = {};
  //this.typeProduitForm.reset({variables: []});

  this.initForm();
  //this.type_typeProduit = '';
  this.annee = '';
}


 ajouter(){

  this.getCultures();
    let maDate = new Date();
    this.today = this.createDate(maDate.getDate(), maDate.getMonth(), maDate.getFullYear());
    this.id = this.generateId();

    this.ajoutForm = true;
    
}


detail(typeProduit){
  this.typeProduit = typeProduit;

  this.detailTypeProduit = true;

}



getItems(ev: any) {
  // Reset items back to all of the items
  //this.essais = this.allEssais;

  // set val to the value of the searchbar
  let val = ev.target.value;

  // if the value is an empty string don't filter the items
  if (val && val.trim() != '' && val.trim() != 'FM-' && val.trim() != 'fm-') {
    this.typeProduits = this.AllTypeProduits.filter((item, index) => {
      return (item.doc.data.nom.toLowerCase().indexOf(val.toLowerCase()) > -1);
    });
  }else{
    this.choixLimit();
  }
} 



}
