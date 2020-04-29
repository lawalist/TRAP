import { Component } from '@angular/core';
import { IonicPage, NavController, PopoverController, ActionSheetController, NavParams, LoadingController, ViewController, MenuController, AlertController, ToastController, ModalController, Platform } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { PouchdbProvider } from '../../providers/pouchdb-provider';
import { global } from '../../global-variables/variable';
import { Device } from '@ionic-native/device';
import { Sim } from '@ionic-native/sim';
import { File } from '@ionic-native/file';
import * as FileSaver from 'file-saver';
import { Printer, PrintOptions } from '@ionic-native/printer';
import { RelationProduitComponent } from '../../components/relation-produit/relation-produit';
import * as cryptoRandomString from 'crypto-random-string';
declare var createDataTable: any;
declare var JSONToCSVAndTHMLTable: any;
declare var $: any;
declare var Formio;
declare var cordova: any;
/**
 * Generated class for the GestionProduitPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
 
@IonicPage()
@Component({
  selector: 'page-gestion-produit',
  templateUrl: 'gestion-produit.html',
})
export class GestionProduitPage {

  produitForm: any;
  user: any = global.info_user;
  global:any = global;
  estManager: boolean = false;
  estAdmin: boolean = false;
  produits: any = [];
  allProduits: any = [];
  //allProduits1: any = [];
  code: any;
  phonenumber: any;
  imei: any;
  aProfile: boolean = false;
  ajoutForm: boolean = false;
  selectedStyle: any = 'liste';
  typeRecherche: any = 'nom';
  rechercher: any = false;
  action: string = 'liste';
  produit: any;
  copieproduit: any;
  centres: any = [];
  selectedCentre: any;
  code_centre: string;
  nom_centre: string;
  id_centre: string;

  typeProduits: any = [];
  selectedTypeProduit: any;
  code_type_produit: string;
  nom_type_produit: string;
  id_type_produit: string;


  constructor(public navCtrl: NavController, public popoverController: PopoverController, public actionSheetCtrl: ActionSheetController, public loadinCtl: LoadingController, public viewCtl: ViewController, public menuCtl: MenuController, public alertCtl: AlertController, public sim: Sim, public device: Device, public servicePouchdb: PouchdbProvider, public platform: Platform, public toastCtl: ToastController, public printer: Printer, public file: File, public modelCtl: ModalController, public navParams: NavParams, public formBuilder: FormBuilder) {
    if(navParams.data.id_centre){
      this.id_centre = this.navParams.data.id_centre;
      this.code_centre = this.navParams.data.code_centre;
      this.nom_centre = this.navParams.data.nom_centre;
      this.selectedCentre = this.id_centre;
    }

    if(navParams.data.id_type_produit){
      this.selectedTypeProduit = navParams.data.id_type_produit;
      this.nom_type_produit = navParams.data.nom_type_produit;
    }
  }

  reinitVar(){
    this.selectedCentre = '';
    this.selectedTypeProduit = '';
    this.code = '';
  }

  
openRelationProduit(ev: any) {
  let popover = this.popoverController.create(RelationProduitComponent);
  popover.present({ev: ev});

  popover.onWillDismiss((res) => {
    if(res == 'Evaluations'){
      this.getEvaluations(this.produit._id, this.produit.data.nom, this.produit.data.id_centre);
    }else if(res == 'Productions'){
      this.getProduction(this.produit._id, this.produit.data.nom, this.produit.data.id_centre);
    }else if(res == 'Etat du stock'){
      this.etatStock(this.produit.data.id_stock, this.produit.data.nom);
    }else if(res == 'Ventes'){
      this.getVentes(this.produit._id, this.produit.data.nom, this.produit.data.id_centre);
    }
  })
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
            this.editer(this.produit)
          }
        },
        {
          text: 'Productions',
          role: 'destructive',
          icon: 'redo',
          cssClass: 'myActionSheetBtnStyle',
          handler: () => {
            this.getProduction(this.produit._id, this.produit.data.nom, this.produit.data.id_centre);
          }
        },{
          text: 'Etat du stock',
          role: 'destructive',
          icon: 'redo',
          cssClass: 'myActionSheetBtnStyle',
          handler: () => {
            this.etatStock(this.produit.data.id_stock, this.produit.data.nom);
          }
        },{
          text: 'Ventes',
          role: 'destructive',
          icon: 'redo',
          cssClass: 'myActionSheetBtnStyle',
          handler: () => {
            this.getVentes(this.produit._id, this.produit.data.nom, this.produit.data.id_centre);
          }
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          icon: 'trash',
          cssClass: 'myActionSheetBtnStyle',
          handler: () => {
            this.supprimer(this.produit);
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

  etatStock(id_stock, nom_produit){
    let model = this.modelCtl.create('StockPage', {'id_stock': id_stock, 'nom_produit': nom_produit}, {enableBackdropDismiss: false});
    model.present();
  }

  getProduction(id_produit, nom_produit, id_centre){
    let model = this.modelCtl.create('GestionProductionPage', {'id_produit': id_produit, 'nom_produit': nom_produit, 'id_centre': id_centre}, {enableBackdropDismiss: false});
    model.present();
  }

  getVentes(id_produit, nom_produit, id_centre){
    let model = this.modelCtl.create('GestionVentePage', {'id_produit': id_produit, 'nom_produit': nom_produit, 'id_centre': id_centre}, {enableBackdropDismiss: false});
    model.present();
  }

  getEvaluations(id_produit, nom_produit, id_centre){
    let model = this.modelCtl.create('EvaluationPage', {'id_produit': id_produit, 'nom_produit': nom_produit, 'id_centre': id_centre}, {enableBackdropDismiss: false});
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

  /*generateId(){
    var numbers='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    var randomArray=[]
    for(let i=0;i<32;i++){
      var rand = Math.floor(Math.random()*62)
      randomArray.push(numbers[rand])
    }
    
    var randomString=randomArray.join("");
    var Id= /*+pays+'-'+region+'-'+department+'-'+commune +'-' +village+ ***''+randomString 
    return Id;
  }*/



  membresproduit(id_produit, nom_produit, code){
    let model = this.modelCtl.create('MembrePage', {'id_produit': id_produit, "nom_produit": nom_produit, "code": code}, {enableBackdropDismiss: false});
    model.present();
  }

  initForm(){
    let maDate = new Date();
    let today = this.createDate(maDate.getDate(), maDate.getMonth(), maDate.getFullYear());

 
    this.produitForm = this.formBuilder.group({
      //_id:[''],
      type:['produit'],
      nom: ['', Validators.required], 
      code: ['', Validators.required], 
      id_type_produit: ['', Validators.required],
      nom_type_produit: [''],
      code_type_produit: [''],
      unite: ['', Validators.required],
      prix_unitaire: ['', Validators.required],
      typeForm: [],
      formioData: [],
      id_centre: ['', Validators.required],
      nom_centre: [''],
      code_centre: [''],
      today: [today, Validators.required],
      deviceid: [''],
      imei: [''],
      phonenumber: [''],
      start: [maDate.toJSON()],
      end: ['']
    });
    
  }

  editForm(produit){
    this.produitForm = null;
    this.produitForm = this.formBuilder.group({
      //_id:[''],
      type:['produit'],
      nom: [produit.data.nom, Validators.required], 
      code: [produit.data.code, Validators.required], 
      typeForm: [produit.data.typeForm],
      formioData: [produit.data.formioData],
      id_type_produit: [produit.data.id_type_produit, Validators.required],
      nom_type_produit: [produit.data.nom_type_produit],
      unite: [produit.data.unite, Validators.required],
      prix_unitaire: [produit.data.prix_unitaire, Validators.required],
      code_type_produit: [produit.data.code_type_produit],
      id_centre: [produit.data.id_centre, Validators.required],
      nom_centre: [produit.data.nom_centre],
      code_centre: [produit.data.code_centre],
      today: [produit.data.today, Validators.required],
    });

    this.selectedCentre = produit.data.id_centre;
    this.selectedTypeProduit = produit.data.id_type_produit;
    this.nom_centre = produit.data.nom_centre;
    this.code_centre = produit.data.code_centre;
    this.code = produit.data.code;
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
     // this.produits = [];
      this.servicePouchdb.getDocByType('produit').then((res) => {
        if(res){
          let produits = res.docs;
          if(this.id_centre && this.id_centre != ""){
            let uns: any= [];
            produits.forEach((u) => {
              if(u.data.id_centre && u.data.id_centre == this.id_centre){
                uns.push(u)
              }
            });
            this.produits = uns;
            this.allProduits = uns;
            refresher.complete();
          }else{
            this.produits = produits;
            this.allProduits = produits;
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
    this.produits = this.allProduits;
  }


  exportExcel(){

    let date = new Date();
    //let dateHeure = date.toLocaleDateString()+ date.toLocaleTimeString();// + date.getTime().toLocaleString();
    let nom = date.getDate().toString() +'_'+ (date.getMonth() + 1).toString() +'_'+ date.getFullYear().toString() +'_'+ date.getHours().toString() +'_'+ date.getMinutes().toString() +'_'+ date.getSeconds().toString();

    let blob = new Blob([document.getElementById('produit_tableau').innerHTML], {
      //type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
      type: "text/plain;charset=utf-8"
      //type: 'application/vnd.ms-excel;charset=utf-8'
      //type: "application/vnd.ms-excel;charset=utf-8"
    });

    if(!this.platform.is('android')){
      FileSaver.saveAs(blob, 'produits_'+nom+'.xls');
    }else{

      let fileDestiny: string = cordova.file.externalRootDirectory;
      this.file.writeFile(fileDestiny, 'produits_'+nom+'.xls', blob).then(()=> {
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
    let content = document.getElementById('produit_tableau').innerHTML;
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


  verifierUniqueNon(produit){

    let res = 1;
    if(this.action == 'ajouter'){
      this.allProduits.forEach((u, index) => {
        if((produit.code == u.data.code) || (produit.nom == u.data.nom && produit.id_centre == u.data.id_centre)){
          res = 0;
        }
      });      
    }else{
      this.allProduits.forEach((u, index) => {
        if((u._id != this.produit._id) && ((produit.code == u.data.code) || (produit.nom == u.data.nom && produit.id_centre == u.data.id_centre))){
          res = 0;
        }
      });      
    }
    
    return res;
  }

  validAction(){
    let date = new Date();
    let produit = this.produitForm.value;

    if(this.verifierUniqueNon(produit) == 0){
      alert('Le code du produit doit être unique pour tous les centres de trnasformation!\nLe nom du produit doit être unique par centre de transformation!');
    }else{
      for(let i = 0; i < this.centres.length; i++){
        if(this.centres[i]._id == this.selectedCentre){
          produit.nom_centre = this.centres[i].data.nom_centre;
          produit.code_centre = this.centres[i].data.code_centre;
        }
      }

      for(let i = 0; i < this.typeProduits.length; i++){
        if(this.typeProduits[i]._id == this.selectedTypeProduit){
          produit.nom_type_produit = this.typeProduits[i].data.nom;
          produit.code_type_produit = this.typeProduits[i].data.code;
          produit.typeForm = this.typeProduits[i].data.formioData.display;
          produit.formioData = this.typeProduits[i].data.formioData
          //produit.ingredients = this.typeProduits[i].data.ingredients;
        }
      }
     
      produit.deviceid = this.device.uuid;
      produit.phonenumber = this.phonenumber;
      produit.imei = this.imei;
      if(this.action == 'ajouter'){
        let id = cryptoRandomString({length: 20});;
        produit.end = date.toJSON();
        produit.id_stock = 'stock:'+id;
        let produitFinal: any = {};
        produitFinal._id =  'produit:'+produit.code_centre+':'+id;
        
        produitFinal.data = produit
        this.servicePouchdb.createDocReturn(produitFinal).then((res) => {
          produitFinal._rev = res.rev;
          let u: any = {}
          u = produitFinal;

          //créer le stock associé, ce documnt sera utiliser pour savoir si le stock est disponible ou pa et faire un inventaire sommaine de la stuation du stock
          let stock: any = {};
          stock._id = produitFinal.data.id_stock;
          stock.type = 'stock';
          stock.data = {};
          stock.data.id_centre = produitFinal.data.id_centre;
          stock.data.code_centre = produitFinal.data.code_centre;
          stock.data.nom_centre = produitFinal.data.nom_centre;
          stock.data.id_produit = produitFinal._id;
          stock.data.code_produit = produitFinal.data.code;
          stock.data.nom_produit = produitFinal.data.nom;
          stock.data.unite_produit = produitFinal.data.unite;
          stock.data.type_produit = produitFinal.data.nom_type_produit;
          stock.data.quantite_produite = 0;
          stock.data.quantite_disponible = 0;
          stock.data.quantite_gate = 0;
          this.servicePouchdb.createDocReturn(stock);
          //fin création stock
          this.produits.push(u)
          this.allProduits = this.produits;
          //this.allProduits1.push(u)
          this.action = 'liste';
          //this.ressetChampsForm();
          let toast = this.toastCtl.create({
            message: 'produit bien enregistré!',
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

        let stockDefini = 'oui';
        this.produit.data.nom = produit.nom;
        this.produit.data.code = produit.code;
        this.produit.data.nom_type_produit = produit.nom_type_produit;
        this.produit.data.code_type_produit = produit.code_type_produit;
        this.produit.data.typeForm = produit.typeForm;
        this.produit.data.formioData = produit.formioData;
        //this.produit.data.ingredients = produit.ingredients;
        this.produit.data.id_type_produit = produit.id_type_produit;
        this.produit.data.unite = produit.unite;
        this.produit.data.prix_unitaire = produit.prix_unitaire;
        this.produit.data.id_centre = produit.id_centre;
        this.produit.data.nom_centre = produit.nom_centre;
        this.produit.data.code_centre = produit.code_centre;
        this.produit.data.update_deviceid = this.device.uuid;
        this.produit.data.update_phonenumber = this.phonenumber;
        this.produit.data.update_imei = this.imei;
        if(!this.produit.data.id_stock || this.produit.data.id_stock == ''){
          this.produit.data.id_stock = 'stock:'+cryptoRandomString({length: 20});;
          stockDefini = 'non';
        }

        this.produit
        this.servicePouchdb.updateDocReturn(this.produit).then((res) => {
          this.produit._rev = res.rev;
          if(stockDefini == 'non'){
            let stock: any = {};
            stock._id = this.produit.data.id_stock;
            stock.type = 'stock';
            stock.data = {};
            stock.data.id_centre = this.produit.data.id_centre;
            stock.data.code_centre = this.produit.data.code_centre;
            stock.data.nom_centre = this.produit.data.nom_centre;
            stock.data.id_produit = this.produit._id;
            stock.data.code_produit = this.produit.data.code;
            stock.data.nom_produit = this.produit.data.nom;
            stock.data.unite_produit = this.produit.data.unite;
            stock.data.type_produit = this.produit.data.nom_type_produit;
            stock.data.quantite_produite = 0;
            stock.data.quantite_disponible = 0;
            stock.data.quantite_gate = 0;
            this.servicePouchdb.createDocReturn(stock);
            stockDefini = 'oui';
          }
          
          //this.produit = this.grandeproduit
          let toast = this.toastCtl.create({
            message: 'Produit bien sauvegardée!',
            position: 'top',
            duration: 1000
          });
          this.action  = 'detail';
          this.detail(this.produit);
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

  
  getallProduits(){
    
    this.rechercher = true;
     // this.produits = [];
      this.servicePouchdb.getDocByType('produit', false).then((res) => {
        if(res){
          let produits = res.docs;
          if(this.id_centre && this.id_centre != ""){
            let uns: any= [];
            produits.forEach((u) => {
              if(u.data.id_centre && u.data.id_centre == this.id_centre){
                uns.push(u)
              }
            });
            this.produits = uns;
            this.allProduits = uns;
            this.rechercher = false;
          }else{
            this.produits = produits;
            this.allProduits = produits;
            this.rechercher = false;
          }
          
          //this.allProduits1 = produits;
         
        }
      }).catch((err) => {
        console.log(err)
        this.rechercher = false;
      }); 
  }


  getAllCentre(){
      this.servicePouchdb.getDocByType('centre', false).then((res) => {
        if(res){
          this.centres = res.docs;
        }
      }).catch((err) => console.log(err)); 
  }

  getAllTypeProduits(){
    this.servicePouchdb.getDocByType('type-produit', false).then((res) => {
      if(res){
        this.typeProduits = res.docs;
      }
    }).catch((err) => console.log(err)); 
}


  ionViewDidEnter() {
    this.getallProduits();
    /*this.servicePouchdb.remoteSaved.getSession((err, response) => {
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
      });*/
      
        
  }

  collect(){
    this.navCtrl.push('CollectPage')
  }


  ajouter(){
    this.initForm();
    this.getInfoSimEmei();
    this.action = 'ajouter';
    this.getAllCentre();
    this.getAllTypeProduits();
    this.code = cryptoRandomString({length: 10, type: 'numeric'});
      //this.navCtrl.push('AjouterproduitPage', {'confLocaliteEnquete': confLocaliteEnquete});    
  }

  editer(produit, dbclick: boolean = false){
    if(!dbclick || (dbclick && this.user && this.user.roles && global.estManager(this.user.roles))){ 
      this.editForm(produit);
      this.getAllCentre();
      this.getAllTypeProduits();
      this.getInfoSimEmei();
      this.action = 'modifier';
      this.copieproduit = this.clone(produit);
    } //this.navCtrl.push('AjouterproduitPage', {'confLocaliteEnquete': confLocaliteEnquete});    
  }

  modifier(){
    this.getInfoSimEmei();
    this.action = 'modifier';
    //this.navCtrl.push('AjouterproduitPage', {'confLocaliteEnquete': confLocaliteEnquete});    
  }

  detail(produit){
    this.produit = produit;
    this.action = 'detail';
    this.showForm(produit.data.formioData)
    //this.navCtrl.push('DetailproduitPage', {'produit': produit, 'selectedSource': selectedSource});
  }


  showForm(form){
    $('#show-produit-form').ready(() => {
      var formElement = document.getElementById('show-produit-form');
      formElement.innerHTML = '';
      Formio.createForm(formElement, form, {readOnly: true});
    })
  }

  getItems(ev: any) {
    // Reset items back to all of the items
    this.produits = this.allProduits;

    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.produits = this.produits.filter((item) => {
        if(this.typeRecherche === 'nom'){
          return (item.data.nom.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }else if(this.typeRecherche === 'code'){
          return (item.data.code.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }else if(this.typeRecherche === 'type-produit'){
           return (item.data.nom_type_produit.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }if(this.typeRecherche === 'centre'){
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
      this.action = 'detail';
      this.detail(this.produit)
    }
  }

  
  fermerDetail(){
    this.action = 'liste';
    //this.essai = {};

  }

  
supprimer(produit){
  let e: any = {};
  let alert = this.alertCtl.create({
    title: 'Suppression produit',
    message: 'Etes vous sûr de vouloir supprimer ce produit ?',
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
            this.servicePouchdb.deleteReturn(produit).then((res) => {
              //let e: any = {};
              //e = essai;
              this.produits.forEach((es, i) => {
                if(es._id === produit._id){
                  this.produits.splice(i, 1);
                }
                
              });
  
              this.action = 'liste';
              //this.navCtrl.pop();
            }, err => {
              console.log(err)
            }) ;
          }else{
            this.servicePouchdb.deleteDocReturn(produit).then((res) => {
              //let e: any = {};
              //e = essai;
              this.produits.forEach((es, i) => {
                if(es._id === produit._id){
                  this.produits.splice(i, 1);
                }
                
              });
  
              this.action = 'liste';
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

/*
  supprimer(produit){
    let alert = this.alertCtl.create({
      title: 'Suppression produit',
      message: 'Etes vous sûr de vouloir supprimer ce produit ?',
      buttons:[
        {
          text: 'Annuler',
          handler: () => console.log('suppression annulée')
 
        },
        {
          text: 'Confirmer',
          handler: () => {
            this.servicePouchdb.deleteDoc(produit);
            let toast = this.toastCtl.create({
              message:'produit bien suppriée',
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
