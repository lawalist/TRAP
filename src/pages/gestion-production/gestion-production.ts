import { Component } from '@angular/core';
import { IonicPage, NavController, PopoverController, Events, ActionSheetController, NavParams, LoadingController, ViewController, MenuController, AlertController, ToastController, ModalController, Platform } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { PouchdbProvider } from '../../providers/pouchdb-provider';
import { global } from '../../global-variables/variable';
import { Device } from '@ionic-native/device';
import { Sim } from '@ionic-native/sim';
import { File } from '@ionic-native/file';
import * as FileSaver from 'file-saver';
import { Printer, PrintOptions } from '@ionic-native/printer';
import { RelationProductionComponent } from '../../components/relation-production/relation-production';
var flatten = require('flat');
const keys = require('all-object-keys');
const jessy = require('jessy');

declare var cordova: any;
declare var createDataTable: any;
declare var JSONToCSVAndTHMLTable: any;
declare var $: any;
declare var Formio;
/**
 * Generated class for the GestionProductionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-gestion-production',
  templateUrl: 'gestion-production.html',
})
export class GestionProductionPage {

  productionForm: FormGroup;
  user: any = global.info_user;
  global:any = global;
  estManager: boolean = false;
  estAnimataire: boolean = false;
  estAdmin: boolean = false;
  productions: any = [];
  allProductions: any = [];
  //allProductions1: any = [];
  jessy = jessy;
  code: any;
  phonenumber: any;
  imei: any;
  aProfile: boolean = false;
  ajoutForm: boolean = false;
  selectedStyle: any = 'liste';
  typeRecherche: any = 'nom_produit';
  rechercher: any = false;
  action: string = 'liste';
  production: any;
  copieProduction: any;
  centres: any = [];
  selectedCentre: any;
  code_centre: string;
  nom_centre: string;
  id_centre: string;

  produits: any = [];
  selectedProduit: any;
  //ingredients: any = [];
  varietes: any = [];
  stock: any;
  id_produit_selected: any;
  copie_stock: any;
  produitFormio: any;
  //depense: number = 0;

  id_produit: any;
  nom_produit: any;
  produitsCentre: any = [];
  complete: boolean = false;

  colonnes = [];

  constructor(public navCtrl: NavController, public popoverController: PopoverController, public actionSheetCtrl: ActionSheetController, public loadinCtl: LoadingController, public viewCtl: ViewController, public menuCtl: MenuController, public alertCtl: AlertController, public sim: Sim, public device: Device, public servicePouchdb: PouchdbProvider, public events: Events, public platform: Platform, public toastCtl: ToastController, public printer: Printer, public file: File, public modelCtl: ModalController, public navParams: NavParams, public formBuilder: FormBuilder) {
    if(navParams.data.id_centre && !navParams.data.id_produit){
      this.id_centre = this.navParams.data.id_centre;
      this.code_centre = this.navParams.data.code_centre;
      this.nom_centre = this.navParams.data.nom_centre;
      this.selectedCentre = this.id_centre;
      //this.getProduitsByCentre(this.id_centre);
    }else
    if(navParams.data.id_produit){
      this.id_produit = navParams.data.id_produit;
      this.nom_produit = navParams.data.nom_produit;
      this.id_centre = this.navParams.data.id_centre;
      this.selectedCentre = this.id_centre;
      //this.getProduit(this.id_produit);
    }

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
    });
  }

  initParamsData(){
    if(this.id_centre && this.id_centre != ''){
      this.getProduitsByCentre(this.id_centre);
    }
    if(this.id_produit && this.id_produit != ''){
      this.getProduit(this.id_produit);
    }
  }

  estAnimataireConnecter(user){
    if(user && user.roles){
      this.estAnimataire = global.estAnimataire(user.roles);
    }
  }
  
  reinitVar(){
    this.selectedCentre = '';
    this.selectedProduit = '';
    this.code = '';
  }

  
openRelationProduction(ev: any) {
  let popover = this.popoverController.create(RelationProductionComponent);
  popover.present({ev: ev});

  popover.onWillDismiss((res) => {
    if(res == 'Etat du stock'){
      this.etatStock(this.production.data.id_stock, this.production.data.nom);
    }
  })
}


  actions(){
    const actionSheet = this.actionSheetCtrl.create({
      title: 'Actions',
      buttons: [
        {
          text: 'Modifier',
          //role: 'destructive',
          icon: 'create',
          handler: () => {
            this.editer(this.production)
          }
        },
        /*{
          text: 'Productions',
          role: 'destructive',
          icon: 'basket',
          cssClass: 'myActionSheetBtnStyle',
          /*handler: () => {
            this.supprimer(this.production);
          }*
    },*/{
          text: 'Etat du stock',
          role: 'destructive',
          icon: 'redo',
          cssClass: 'myActionSheetBtnStyle',
          handler: () => {
            this.etatStock(this.production.data.id_stock, this.production.data.nom);
          }
        },
        {
          text: 'Annuler la production',
          role: 'destructive',
          icon: 'trash',
          cssClass: 'myActionSheetBtnStyle',
          handler: () => {
            this.annulerProduction(this.production);
          }
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          icon: 'trash',
          cssClass: 'myActionSheetBtnStyle',
          handler: () => {
            this.supprimer(this.production);
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

  etatStock(id_stock, nom_production){
    let model = this.modelCtl.create('StockPage', {'id_stock': id_stock, 'nom_production': nom_production});
    model.present();
  }
  
  generateCode(){
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

  generateId(){
    var numbers='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    var randomArray=[]
    for(let i=0;i<50;i++){
      var rand = Math.floor(Math.random()*62)
      randomArray.push(numbers[rand])
    }
    
    var randomString=randomArray.join("");
    var Id= /*+pays+'-'+region+'-'+department+'-'+commune +'-' +village+ */''+randomString 
    return Id;
  }



  membresproduction(id_production, nom_production, code){
    let model = this.modelCtl.create('MembrePage', {'id_production': id_production, "nom_production": nom_production, "code": code}, {enableBackdropDismiss: false});
    model.present();
  }

  initForm(){
    this.productionForm = null;
    let maDate = new Date();
    let today = this.createDate(maDate.getDate(), maDate.getMonth(), maDate.getFullYear());

 
    this.productionForm = this.formBuilder.group({
      //_id:[''],
      type:['production'],
      date_production: [today, Validators.required],
      id_produit: [this.id_produit, Validators.required], 
      prixUnitaire: [0, Validators.required],
      nom_produit: [''], 
      code_produit: [''], 
      type_produit: [''],
      unite: [''],
      formData: [{}],
      id_centre: [this.id_centre],
      nom_centre: [''],
      code_centre: [''],
      quantiteProduite: [],
      ancienStock: [0, Validators.required],
      nouveauStock: [],
      
      id_stock: [''],
      today: [today, Validators.required],
      deviceid: [''],
      imei: [''],
      phonenumber: [''],
      start: [maDate.toJSON()],
      end: ['']
    });
    
  }

  editForm(production){
    this.productionForm = null;
    this.productionForm = this.formBuilder.group({
      //_id:[''],
      type:['production'],
      date_production: [production.data.date_production, Validators.required],
      id_produit: [production.data.id_produit, Validators.required], 
      nom_produit: [production.data.nom_produit], 
      code_produit: [production.data.code_produit], 
      type_produit: [production.data.type_produit],
      unite: [production.data.unite],
      formData: [production.data.formData],
      id_centre: [production.data.id_centre],
      nom_centre: [production.data.nom_centre],
      code_centre: [production.data.code_centre],
      quantiteProduite: [production.data.quantiteProduite, Validators.required],
      ancienStock: [production.data.ancienStock, Validators.required],
      nouveauStock: [production.data.nouveauStock, Validators.required],
      prixUnitaire: [production.data.prixUnitaire, Validators.required],
      
      id_stock: [production.data.id_stock],
      today: [production.data.today, Validators.required],
    });

    this.selectedCentre = production.data.id_centre;
    this.selectedProduit = production.data.id_type_produit;
    this.nom_centre = production.data.nom_centre;
    this.code_centre = production.data.code_centre;
    this.code = production.data.code;
    //this.ingredients = production.data.ingredients;
    this.getStock(production.data.id_stock, 'editer');
  }


  getVariete(){
    let cls: any = [];
    this.servicePouchdb.getDocByType('variete', false).then((v) => {
      this.varietes = v.docs;
    });
  }
  

  getProduit(id_produit){
    this.produitFormio = {};
    for(let i = 0; i < this.produitsCentre.length; i++){
      if(this.produitsCentre[i]._id == id_produit){
        this.productionForm.controls.code_produit.setValue(this.produitsCentre[i].data.code);
        this.productionForm.controls.nom_produit.setValue(this.produitsCentre[i].data.nom);
        this.productionForm.controls.code_centre.setValue(this.produitsCentre[i].data.code_centre);
        this.productionForm.controls.nom_centre.setValue(this.produitsCentre[i].data.nom_centre);
        /*if(this.id_produit && this.id_produit != ''){
          this.productionForm.controls.id_centre.setValue(this.produitsCentre[i].data.id_centre);
        }*/
        this.productionForm.controls.unite.setValue(this.produitsCentre[i].data.unite);
        this.productionForm.controls.type_produit.setValue(this.produitsCentre[i].data.nom_type_produit);
        this.productionForm.controls.prixUnitaire.setValue(this.produitsCentre[i].data.prix_unitaire);
        //console.log(this.productionForm.controls.prix_unitaire +"   "+this.produitsCentre[i].data.prix_unitaire)
        this.productionForm.controls.id_stock.setValue(this.produitsCentre[i].data.id_stock);
        this.produitFormio = this.produitsCentre[i].data.formioData;
        this.getStock(this.produitsCentre[i].data.id_stock)
        
        if(this.action != 'ajouter'){
          this.presentFormEditer(this.produitFormio, this.productionForm.controls.formData.value)
        }
        
        break;
      }
    }
  }

  getStock(id_stock, editer?){
    this.servicePouchdb.getDocById(id_stock).then((s) => {
      this.stock = s;
      if(editer == 'editer'){
        this.copie_stock = this.clone(s);
      }
      this.productionForm.controls.ancienStock.setValue(s.data.quantite_disponible);

      if(this.action == 'ajouter'){
        let data = {
          prixUnitaire: this.productionForm.controls.prixUnitaire.value,
          ancienStock: this.productionForm.controls.ancienStock.value
        }
        this.presentFormEditer(this.produitFormio, data)
      }
    })
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


  doRefresh(refresher) {
     // this.productions = [];
     this.colonnes = [];
      this.servicePouchdb.getDocByType('production', false).then((res) => {
        if(res){
          let productions = res.docs;
          if(this.id_centre && this.id_centre != ""){
            let uns: any= [];
            productions.forEach((u) => {
              if(u.data.id_produit == this.id_produit_selected && u.data.id_centre && u.data.id_centre == this.id_centre){
                uns.push(u);
                this.colonnes = Array.from(new Set(this.colonnes.concat(keys(u.data.formData))));
              }
            });
            this.colonnes.splice(this.colonnes.indexOf('quantiteProduite'), 1);
            this.colonnes.splice(this.colonnes.indexOf('prixUnitaire'), 1);
            this.colonnes.splice(this.colonnes.indexOf('ancienStock'), 1);
            this.productions = uns;
            this.allProductions = uns;
            refresher.complete();
          }else{
            let uns: any= [];
            productions.forEach((u) => {
              if(u.data.id_produit == this.id_produit_selected){
                uns.push(u)
                this.colonnes = Array.from(new Set(this.colonnes.concat(keys(u.data.formData))));
              }
            });
            this.colonnes.splice(this.colonnes.indexOf('quantiteProduite'), 1);
            this.colonnes.splice(this.colonnes.indexOf('prixUnitaire'), 1);
            this.colonnes.splice(this.colonnes.indexOf('ancienStock'), 1);
            this.productions = uns;
            this.allProductions = uns;
            refresher.complete();
          }
          
        }
      });
  }

  estManagerConnecter(user){
    //alert('entree')
    if(user && user.roles){
      //alert('ok')
      this.estManager = global.estManager(user.roles);
    }
  }

  estAdminConnecter(user){
    if(user && user.roles){
      this.estManager = global.estAdmin(user.roles);
    }
  }

    typeRechercheChange(){
    this.productions = this.allProductions;
  }


  exportExcel(){

    let date = new Date();
    //let dateHeure = date.toLocaleDateString()+ date.toLocaleTimeString();// + date.getTime().toLocaleString();
    let nom = date.getDate().toString() +'_'+ (date.getMonth() + 1).toString() +'_'+ date.getFullYear().toString() +'_'+ date.getHours().toString() +'_'+ date.getMinutes().toString() +'_'+ date.getSeconds().toString();

    let blob = new Blob([document.getElementById('production_tableau').innerHTML], {
      //type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
      type: "text/plain;charset=utf-8"
      //type: 'application/vnd.ms-excel;charset=utf-8'
      //type: "application/vnd.ms-excel;charset=utf-8"
    });

    if(!this.platform.is('android')){
      FileSaver.saveAs(blob, 'productions_'+nom+'.xls');
    }else{

      let fileDestiny: string = cordova.file.externalRootDirectory;
      this.file.writeFile(fileDestiny, 'productions_'+nom+'.xls', blob).then(()=> {
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
    let content = document.getElementById('production_tableau').innerHTML;
    this.printer.print(content, options);
  }


  getInfoSimEmei(){

    this.sim.getSimInfo().then(
      (info) => {
        if(info && info.cards && info.cards.length > 0){
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


  verifier(production){
    let msg = '';

    /*production.ingredients.forEach((i) => {
      if(i.est_obligatoire == 'oui' &&((!i.quantite || i.quantite == '' ) || (i.type == 'culture' &&(!i.variete || i.variete == '' || !i.quantite || i.quantite == '' )))){
        msg += '\nLes renseignements de l\'ingrédient '+i.nom+' sont obligatoires.'
      }
    
      if(i.cout < 0 || (!i.cout && i.cout != 0)){
        msg += '\nLe coût de l\'ingrédient '+i.nom+' est obligatoire et non null ou négatif.'
      }
    });*/


    if(production.quantiteProduite < 0){
      msg += '\nLa quantité produite ne peut pas être nulle ou négative.' 
    }

    //1
    /*if(this.action == 'ajouter'){
      this.allProductions.forEach((u, index) => {
        if((production.code == u.data.code) || (production.nom == u.data.nom && production.id_centre == u.data.id_centre)){
          res = 0;
        }
      });      
    }else{
      this.allProductions.forEach((u, index) => {
        if((u._id != this.production._id) && ((production.code == u.data.code) || (production.nom == u.data.nom && production.id_centre == u.data.id_centre))){
          res = 0;
        }
      });      
    }*/
    
    return msg;
  }

  validAction(){
    let date = new Date();
    let production = this.productionForm.value;
    delete production.formData.submit
    //production.ingredients = this.ingredients;
    if(this.verifier(production) != ''/*==*/){
      alert(this.verifier(production));
    }else{
           
      production.deviceid = this.device.uuid;
      production.phonenumber = this.phonenumber;
      production.imei = this.imei;

      if(this.action == 'ajouter'){
        let id = this.generateId();
        production.end = date.toJSON();
        let productionFinal: any = {};
        productionFinal._id =  'production:'+id;
        
        productionFinal.data = production
        this.servicePouchdb.createDocReturn(productionFinal).then((res) => {
          productionFinal._rev = res.rev;
          let u: any = {}
          u = productionFinal;

          //metre à jour le stock
          this.stock.data.quantiteProduite += parseFloat(productionFinal.data.quantiteProduite);
          //this.stock.data.quantite_gate += productionFinal.data.quantite_gate;
          this.stock.data.quantite_disponible += parseFloat(productionFinal.data.quantiteProduite);
          this.servicePouchdb.updateDoc(this.stock)
          //fin mise à jour stock
          
          this.productions.push(u)
          this.allProductions = this.productions;
          //this.allProductions1.push(u)
          this.action = 'liste';
          //this.ressetChampsForm();
          let toast = this.toastCtl.create({
            message: 'production bien enregistré!',
            position: 'top',
            duration: 1000
          });
          toast.present();

          this.centres = [];
          this.reinitVar()
        /*let E: any = this.essais;
        E = E.concat(essais);
         
        this.essais = E;
        this.allEssais = this.essais;*/
          
      }).catch((err) => alert('une erreur est survenue lors de l\'enregistrement: '+err) );
    
      }else{     

        this.production.data.date_production = production.date_production;
        this.production.data.id_produit = production.id_produit; 
        this.production.data.nom_produit = production.nom_produit; 
        this.production.data.code_produit = production.code_produit; 
        this.production.data.type_produit = production.type_produit;
        
        this.production.data.unite = production.unite;
        this.production.data.prixUnitaire = production.prixUnitaire;
        this.production.data.formData = production.formData;
        this.production.data.id_centre = production.id_centre;
        this.production.data.nom_centre = production.nom_centre;
        this.production.data.code_centre = production.code_centre;
        this.production.data.quantiteProduite = production.quantiteProduite;
        this.production.data.ancienStock = production.ancienStock;
        this.production.data.nouveauStock = production.nouveauStock;
      
       
        this.production.data.update_deviceid = this.device.uuid;
        this.production.data.update_phonenumber = this.phonenumber;
        this.production.data.update_imei = this.imei;

        this.servicePouchdb.updateDocReturn(this.production).then((res) => {
          this.production._rev = res.rev;
          //metre à jour le stock
          //en cas de changement de produit
          if(this.production.data.id_stock != this.copie_stock._id){
            //soustraire l'ancienne production
            this.copie_stock.data.quantiteProduite -= parseFloat(this.copieProduction.data.quantiteProduite);
            //this.copie_stock.data.quantite_gate -= this.copieProduction.data.quantite_gate;
            this.copie_stock.data.quantite_disponible -= parseFloat(this.copieProduction.data.quantiteProduite);
            this.servicePouchdb.updateDoc(this.copie_stock);

            //mise à jour nouveau stock
            this.stock.data.quantiteProduite += parseFloat(this.production.data.quantiteProduite);
            //this.stock.data.quantite_gate += this.production.data.quantite_gate;
            this.stock.data.quantite_disponible += parseFloat(this.production.data.quantiteProduite);
            this.servicePouchdb.updateDoc(this.stock);
          }else{
            //mise à jour du stocke
            this.stock.data.quantiteProduite += parseFloat(this.production.data.quantiteProduite) - parseFloat(this.copieProduction.data.quantiteProduite);
            //this.stock.data.quantite_gate += (this.production.data.quantite_gate - this.copieProduction.data.quantite_gate);
            this.stock.data.quantite_disponible += parseFloat(this.production.data.quantiteProduite) - parseFloat(this.copieProduction.data.quantiteProduite);
            this.servicePouchdb.updateDoc(this.stock);
          }
          //fin mise à jour stock
          
          //this.production = this.grandeproduction
          let toast = this.toastCtl.create({
            message: 'Production bien sauvegardée!',
            position: 'top',
            duration: 1000
          });
          //this.action  = 'detail';
          this.detail(this.production)
          toast.present();
          this.centres = [];
          this.reinitVar()
      });

    }
  }
}



detailIngredient(i){
  let model = this.modelCtl.create('IngredientPage', {'ingredient': i, 'detail': 'true'}, {enableBackdropDismiss: false});
  model.present();
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

  sync(){
    this.servicePouchdb.syncAvecToast();
  }

  replicationDepuisServeur(){
    this.servicePouchdb.replicationDepuisServeur();
  }

  replicationVersServeur(){
    this.servicePouchdb.replicationVersServeur();
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

  
  getAllProductions(id_produit_selected){

    /*for(let i = 0; i > this.produits.length; i++ ){
      if(this.produits[i]._id == id_produit_selected){
        this.produitFormio = this.produits[i].data.formioData;
        break;
      }
    }*/
    
    //this.rechercher = true;
     // this.productions = [];
     this.colonnes = [];
      this.servicePouchdb.getDocByType('production', false).then((res) => {
        if(res){
          let productions = res.docs;
          if(this.id_centre && this.id_centre != ""){
            let uns: any= [];
            productions.forEach((u) => {
              if(u.data.id_produit == id_produit_selected && u.data.id_centre && u.data.id_centre == this.id_centre){
                uns.push(u)
                this.colonnes = Array.from(new Set(this.colonnes.concat(keys(u.data.formData))));
              }
            });
            this.colonnes.splice(this.colonnes.indexOf('quantiteProduite'), 1);
            this.colonnes.splice(this.colonnes.indexOf('prixUnitaire'), 1);
            this.colonnes.splice(this.colonnes.indexOf('ancienStock'), 1);
            this.productions = uns;
            this.allProductions = uns;
            this.rechercher = false;
          }else{
            let uns: any= [];
            productions.forEach((u) => {
              if(u.data.id_produit == id_produit_selected){
                uns.push(u)
                this.colonnes = Array.from(new Set(this.colonnes.concat(keys(u.data.formData))));
              }
            });
            this.colonnes.splice(this.colonnes.indexOf('quantiteProduite'), 1);
            this.colonnes.splice(this.colonnes.indexOf('prixUnitaire'), 1);
            this.colonnes.splice(this.colonnes.indexOf('ancienStock'), 1);
            this.productions = uns;
            this.allProductions = uns;
            this.rechercher = false;
            //console.log(this.colonnes)
          }
          
          //this.allProductions1 = productions;
         
        }
      }).catch((err) => {
        console.log(err)
        this.rechercher = false;
      }); 
  }


  getAllCentre(){
      this.servicePouchdb.getDocByType('centre', false).then((centres) => {
        if(centres){
          this.centres = centres.docs;
        }
      }).catch((err) => console.log(err)); 
  }

  getProduitsCentre(id_centre){
    this.produitsCentre = [];
    this.servicePouchdb.getDocByType('produit', false).then((res) => {
      if(res){
        let produits =  res.docs;
        let p: any = [];
        produits.forEach((prod) => {
          if(prod.data.id_centre == id_centre){
            p.push(prod);
          }
        });
        this.produitsCentre = p;

        if(this.id_produit && this.id_produit != ''){
          if(this.action != 'modifier'){
            this.getProduit(this.id_produit);
          }
        }
      }
    }).catch((err) => {
      console.log(err)
    }); 

    //this.getProduitsByCentre(id_centre);
  }

  getProduitsCentreEdit(id_centre){
    this.produitsCentre = [];
    //console.log(this.copieProduction)
    this.servicePouchdb.getDocByType('produit', false).then((res) => {
      if(res){
        let produits =  res.docs;
        let pro = null;
        let p: any = [];
        produits.forEach((prod) => {
          if(prod.data.id_centre == id_centre){
            p.push(prod);
            if(prod._id == this.copieProduction.data.id_produit){
              pro = prod;
            }
          }
        });

        this.produitsCentre = p;

        if(pro)
          this.presentFormEditer(pro.data.formioData, this.copieProduction.data.formData)
      }
    }).catch((err) => {
      console.log(err)
    }); 

    //this.getProduitsByCentre(id_centre);
  }


  presentFormEditer(form, formData){
    var self = this;
    //console.log(formData)
    this.complete = false;
    $('#formio3').ready(() => {
      //Formio.icons = 'fontawesome';
      var formElement = document.getElementById('formio3');
      var opts = {
        breadcrumbSettings: {clickable:false},
        buttonSettings: {showCancel: false},
        language: 'fr',
        i18n: {
          fr: {
            'Submit': 'Valider',
            'submit': 'Terminer',
            'cancel': 'Annuler',
            'complete': 'Terminé avec succès',
            'error' : "Veuillez corriger les erreurs suivantes avant de termier.",
            'invalid_date' :"{{field}} is not a valid date.",
            'invalid_email' : "{{field}} must be a valid email.",
            'invalid_regex' : "{{field}} does not match the pattern {{regex}}.",
            'mask' : "{{field}} does not match the mask.",
            'max' : "{{field}} ne peut pas être supérieur à {{max}}.",
            'maxLength' : "{{field}} doit être plus court que {{length}} charactères.",
            'min' : "{{field}} ne peut pas être inférieur à {{min}}.",
            'minLength' : "{{field}} doit être plus long que {{length}} charactères.",
            'next' : "Suivant",
            'pattern' : "{{field}} does not match the pattern {{pattern}}",
            'previous' : "Précédent",
            'required' : "{{field}} est requis",
          }
        }
      };
      formElement.innerHTML = '';
      Formio.createForm(formElement, form, opts).then((form) => {
        //console.log(form)
        form.submission = {
          data: formData
        };
        //self.formObject = form;
        //self.formObject.submit().catch((err)=> {console.log(err)});
        form.on('submit', (submission) => {
          //JSON.stringify(submission)
          self.productionForm.controls.formData.setValue(submission.data);
          //console.log(submission.data)
          if(self.productionForm.controls.quantiteProduite.value){
            self.productionForm.controls.nouveauStock.setValue(parseFloat(self.productionForm.controls.ancienStock.value) + (parseFloat(submission.data.quantiteProduite) - parseFloat(self.productionForm.controls.quantiteProduite.value)));
          }else{
            self.productionForm.controls.nouveauStock.setValue(parseFloat(self.productionForm.controls.ancienStock.value) + (parseFloat(submission.data.quantiteProduite)/* - parseFloat(self.productionForm.controls.quantiteProduite.value))*/));
          }
          self.productionForm.controls.quantiteProduite.setValue(submission.data.quantiteProduite);
          
          self.complete = true;
          //self.afficheForm = false;
          //form.data = {};
          //console.log('The form was just submitted!!!');
        });

        /*form.on('change', (c) => {
          console.log('ch '+ c);
        })*/
        
        
        /*form.on('error', (errors) => {
          console.log('We have errors! '+errors);
        })*/
      });
    })
  }



  showForm(form, formData){
    $('#show-ingredient-form').ready(() => {
      var formElement = document.getElementById('show-ingredient-form');
      var opts = {
        //breadcrumbSettings: {clickable:false},
        //buttonSettings: {showCancel: false},
        readOnly: true,
        language: 'fr',
        i18n: {
          fr: {
            'Submit': 'Valider',
            'submit': 'Terminer',
            'cancel': 'Annuler',
            'complete': 'Terminé avec succès',
            'error' : "Veuillez corriger les erreurs suivantes avant de termier.",
            'invalid_date' :"{{field}} is not a valid date.",
            'invalid_email' : "{{field}} must be a valid email.",
            'invalid_regex' : "{{field}} does not match the pattern {{regex}}.",
            'mask' : "{{field}} does not match the mask.",
            'max' : "{{field}} ne peut pas être supérieur à {{max}}.",
            'maxLength' : "{{field}} doit être plus court que {{length}} charactères.",
            'min' : "{{field}} ne peut pas être inférieur à {{min}}.",
            'minLength' : "{{field}} doit être plus long que {{length}} charactères.",
            'next' : "Suivant",
            'pattern' : "{{field}} does not match the pattern {{pattern}}",
            'previous' : "Précédent",
            'required' : "{{field}} est requis",
          }
        }
      };
      
      formElement.innerHTML = '';
      Formio.createForm(formElement, form, opts).then((form) => {
        //console.log(form)
        form.submission = {
          data: formData
        };
        
      });
    })
  }

  getAllProduits(){
    this.rechercher = true;
     // this.productions = [];
    this.servicePouchdb.getDocByType('produit', false).then((res) => {
      if(res){
        let produits =  res.docs;
        if(this.id_centre && this.id_centre != ''){
          let p: any = [];
          produits.forEach((prod) => {
            if(prod.data.id_centre == this.id_centre){
              p.push(prod);
            }
          });
          this.produits = p;
          if(this.produits.length > 0){
            this.id_produit_selected = this.produits[0]._id;
            //this.produitFormio = this.produits[0].data.formioData;
            this.getAllProductions(this.id_produit_selected);
          }else{
            this.rechercher = false;
      // this.productions = [];
          }
        }else{
          this.produits = produits;
          if(this.produits.length > 0){
            this.id_produit_selected = this.produits[0]._id;
            //this.produitFormio = this.produits[0].data.formioData;
            this.getAllProductions(this.id_produit_selected);
          }else{
            this.rechercher = false;
      // this.productions = [];
          }
        }
        
      }
    }).catch((err) => {
      this.rechercher = false;
     // this.productions = [];
      console.log(err)
    }); 
}

getProduitsByCentre(id_centre){
  let p: any = [];
  this.produits.forEach((prod) => {
    if(prod.data.id_centre == id_centre){
      p.push(prod);
    }
  });
  this.produitsCentre = p;
  if(this.id_produit && this.id_produit != ''){
    if(this.action != 'modifier'){
      this.getProduit(this.id_produit);
    }
  }
}


  ionViewDidEnter() {
    //this.getallProductions();
    this.getAllProduits();
    this.servicePouchdb.remoteSaved.getSession((err, response) => {
        if (err) {
          // network error
          //this.events.publish('user:login');
          //alert('network')
          this.aProfile = false;
        } else if (!response.userCtx.name) {
          // nobody's logged in
          //this.events.publish('user:login');
          //alert('nobady')
          this.aProfile = false;
        } else {
          // response.userCtx.name is the current user
          //this.events.publish('user:login', response.userCtx);
          //alert(response.userCtx.name)
          this.aProfile = true;
        }
      });
      
        
  }

  collect(){
    this.navCtrl.push('CollectPage')
  }


  ajouter(){
    this.initForm();
    this.getInfoSimEmei();
    this.action = 'ajouter';
    this.getAllCentre();
    if(this.id_centre && this.id_centre != ''){
      this.getProduitsByCentre(this.id_centre);
    }
    //this.getAllProduits();
    this.code = this.generateCode();
    /*if(this.id_produit && this.id_produit != ''){
      this.getProduit(this.id_produit);
      this.getProduit(this.id_produit);
      this.productionForm.controls.id_produit.setValue(this.id_produit);
    }*/
      //this.navCtrl.push('AjouterproductionPage', {'confLocaliteEnquete': confLocaliteEnquete});    
  }

  editer(production){
    this.editForm(production);
    this.getAllCentre();
    //this.getAllProduits();
    this.getInfoSimEmei();
    this.action = 'modifier';
    this.copieProduction = this.clone(production);
    //this.getProduitsByCentre(production.data.id_centre);
    this.getProduitsCentreEdit(production.data.id_centre)
      //this.navCtrl.push('AjouterproductionPage', {'confLocaliteEnquete': confLocaliteEnquete});    
  }

  modifier(){
    this.getInfoSimEmei();
    this.action = 'modifier';
    //this.navCtrl.push('AjouterproductionPage', {'confLocaliteEnquete': confLocaliteEnquete});    
  }

  detail(production){
    this.production = production;
    this.action = 'detail';
    //console.log(production.data.id_produit)
    this.servicePouchdb.getDocById(production.data.id_produit).then((s) => {
      //console.log(s.data.formioData)
      //console.log(production.data.formData)
      this.showForm(s.data.formioData, production.data.formData)
    })
    //this.navCtrl.push('DetailproductionPage', {'production': production, 'selectedSource': selectedSource});
  }

  getItems(ev: any) {
    // Reset items back to all of the items
    this.productions = this.allProductions;

    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.productions = this.productions.filter((item) => {
        if(this.typeRecherche === 'nom_produit'){
          return (item.data.nom_produit.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }else if(this.typeRecherche === 'code_produit'){
          return (item.data.code_produit.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }else if(this.typeRecherche === 'type_produit'){
           return (item.data.type_produit.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }if(this.typeRecherche === 'code_centre'){
          return (item.data.code_centre.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }if(this.typeRecherche === 'nom_centre'){
          return (item.data.nom_centre.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }
      });
    } 
  }

  dismiss(){
    this.viewCtl.dismiss(/*this.cultures*/);
    //this.a_matricule = false;
  }

  annuler(){
    if(this.action == 'ajouter'){
      this.action = 'liste';
    }else if (this.action == 'modifier'){
      this.detail(this.production)
      //this.action = 'detail';
    }
  }

  
  fermerDetail(){
    this.action = 'liste';
    //this.essai = {};

  }

  
supprimer(production){
  let e: any = {};
  let alert = this.alertCtl.create({
    title: 'Suppression production',
    message: 'Etes vous sûr de vouloir supprimer cette production ?',
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
           // this.servicePouchdb.getDocById(production.data.id_stock).then((stock) => {
              //vérifier si le stock disponbile est supérieur la la quantité produite (production à supprimer)
              //if(stock.data.quantite_disponible - production.data.quantiteProduite >= 0){
               // stock.data.quantiteProduite -= production.data.quantiteProduite;
                //stock.data.quantite_gate -= production.data.quantite_gate;
               // stock.data.quantite_disponible -= production.data.quantiteProduite;

                //supprimer la production
                this.servicePouchdb.deleteReturn(production).then((res) => {
                  //mettre le stock à jour
                  //this.servicePouchdb.updateDoc(stock);
                  //let e: any = {};
                  //e = essai;
                  this.productions.forEach((es, i) => {
                    if(es._id === production._id){
                      this.productions.splice(i, 1);
                    }
                    
                  });
      
                  this.action = 'liste';
                  //this.navCtrl.pop();
                }, err => {
                  console.log(err)
                }) ;

              /*}else{
                let toast = this.toastCtl.create({
                  message:'Impossible de supprimer la production\nStock du produit disponible insuffisant',
                  position: 'top',
                  duration: 3000
                });
    
                toast.present();
              }*/
          //  })
          }else{

            //this.servicePouchdb.getDocById(production.data.id_stock).then((stock) => {
              //vérifier si le stock disponbile est supérieur la la quantité produite (production à supprimer)
              //if(stock.data.quantite_disponible - production.data.quantiteProduite >= 0){
               // stock.data.quantiteProduite -= production.data.quantiteProduite;
                //stock.data.quantite_gate -= production.data.quantite_gate;
               // stock.data.quantite_disponible -= production.data.quantiteProduite;

                //supprimer la production
                this.servicePouchdb.deleteDocReturn(production).then((res) => {
                  //mettre le stock à jour
                 // this.servicePouchdb.updateDoc(stock);
                  //let e: any = {};
                  //e = essai;
                  this.productions.forEach((es, i) => {
                    if(es._id === production._id){
                      this.productions.splice(i, 1);
                    }
                    
                  });
      
                  this.action = 'liste';
                  //this.navCtrl.pop();
                }, err => {
                  console.log(err)
                }) ;

             /* }else{
                let toast = this.toastCtl.create({
                  message:'Impossible de supprimer la production\nStock du produit disponible insuffisant',
                  position: 'top',
                  duration: 3000
                });
    
                toast.present();
              }*/
           // })
          }
          
        }
      }
    ]
  });

  alert.present();
}



annulerProduction(production){
  let e: any = {};
  let alert = this.alertCtl.create({
    title: 'Annulation production',
    message: 'Etes vous sûr de vouloir annuler cette production ?\nCette production sera supprimer et la quantité produite sera enlevée du stock',
    inputs: [
      {
        type: 'checkbox',
        label: 'Annuler définitivement!',
        value: 'oui',
        checked: false
        }
    ],
    buttons:[
      {
        text: 'Non',
        handler: () => console.log('Annulation annulée')

      },
      {
        text: 'Oui',
        handler: (data) => {
          if(data.toString() === 'oui'){
            this.servicePouchdb.getDocById(production.data.id_stock).then((stock) => {
              //vérifier si le stock disponbile est supérieur la la quantité produite (production à supprimer)
              if(stock.data.quantite_disponible - production.data.quantiteProduite >= 0){
                stock.data.quantiteProduite -= production.data.quantiteProduite;
                //stock.data.quantite_gate -= production.data.quantite_gate;
                stock.data.quantite_disponible -= production.data.quantiteProduite;

                //supprimer la production
                this.servicePouchdb.deleteReturn(production).then((res) => {
                  //mettre le stock à jour
                  this.servicePouchdb.updateDoc(stock);
                  //let e: any = {};
                  //e = essai;
                  this.productions.forEach((es, i) => {
                    if(es._id === production._id){
                      this.productions.splice(i, 1);
                    }
                    
                  });
      
                  this.action = 'liste';
                  //this.navCtrl.pop();
                }, err => {
                  console.log(err)
                }) ;

              }else{
                let toast = this.toastCtl.create({
                  message:'Impossible de supprimer la production\nStock du produit disponible insuffisant',
                  position: 'top',
                  duration: 3000
                });
    
                toast.present();
              }
            })
          }else{

            this.servicePouchdb.getDocById(production.data.id_stock).then((stock) => {
              //vérifier si le stock disponbile est supérieur la la quantité produite (production à supprimer)
              if(stock.data.quantite_disponible - production.data.quantiteProduite >= 0){
                stock.data.quantiteProduite -= production.data.quantiteProduite;
                //stock.data.quantite_gate -= production.data.quantite_gate;
                stock.data.quantite_disponible -= production.data.quantiteProduite;

                //supprimer la production
                this.servicePouchdb.deleteDocReturn(production).then((res) => {
                  //mettre le stock à jour
                  this.servicePouchdb.updateDoc(stock);
                  //let e: any = {};
                  //e = essai;
                  this.productions.forEach((es, i) => {
                    if(es._id === production._id){
                      this.productions.splice(i, 1);
                    }
                    
                  });
      
                  this.action = 'liste';
                  //this.navCtrl.pop();
                }, err => {
                  console.log(err)
                }) ;

              }else{
                let toast = this.toastCtl.create({
                  message:'Impossible de supprimer la production\nStock du produit disponible insuffisant',
                  position: 'top',
                  duration: 3000
                });
    
                toast.present();
              }
            })
          }
          
        }
      }
    ]
  });

  alert.present();
}


/*
  supprimer(production){
    let alert = this.alertCtl.create({
      title: 'Suppression production',
      message: 'Etes vous sûr de vouloir supprimer ce production ?',
      buttons:[
        {
          text: 'Annuler',
          handler: () => console.log('suppression annulée')
 
        },
        {
          text: 'Confirmer',
          handler: () => {
            this.servicePouchdb.deleteDoc(production);
            let toast = this.toastCtl.create({
              message:'production bien suppriée',
              position: 'top',
              duration: 1000
            });

            toast.present();
            this.navCtrl.pop();
          }
        }
      ]
    });

    alert.present();
  }
*/

}
