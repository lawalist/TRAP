import { Component } from '@angular/core';
import { IonicPage, NavController, ActionSheetController, NavParams, LoadingController, ViewController, MenuController, AlertController, ToastController, ModalController, Platform } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { PouchdbProvider } from '../../providers/pouchdb-provider';
import { global } from '../../global-variables/variable';
import { Device } from '@ionic-native/device';
import { Sim } from '@ionic-native/sim';
import { File } from '@ionic-native/file';
import * as FileSaver from 'file-saver';
import { Printer, PrintOptions } from '@ionic-native/printer';
declare var cordova: any;

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
  estManger: boolean = false;
  estAdmin: boolean = false;
  productions: any = [];
  allProductions: any = [];
  //allProductions1: any = [];
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
  ingredients: any = [];
  varietes: any = [];
  stock: any;
  id_produit_selected: any;
  copie_stock: any;
  selectedProduitIngredients: any;
  //depense: number = 0;

  id_produit: any;
  nom_produit: any;
  produitsCentre: any = [];

  constructor(public navCtrl: NavController, public actionSheetCtrl: ActionSheetController, public loadinCtl: LoadingController, public viewCtl: ViewController, public menuCtl: MenuController, public alertCtl: AlertController, public sim: Sim, public device: Device, public servicePouchdb: PouchdbProvider, public platform: Platform, public toastCtl: ToastController, public printer: Printer, public file: File, public modelCtl: ModalController, public navParams: NavParams, public formBuilder: FormBuilder) {
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
  }

  initParamsData(){
    if(this.id_centre && this.id_centre != ''){
      this.getProduitsByCentre(this.id_centre);
    }
    if(this.id_produit && this.id_produit != ''){
      this.getProduit(this.id_produit);
    }
  }

  reinitVar(){
    this.selectedCentre = '';
    this.selectedProduit = '';
    this.code = '';
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
    var numbers='0123456789ABCDEFGHIJKLMNPQRSTUVWYZ'
    var randomArray=[]
    for(let i=0;i<24;i++){
      var rand = Math.floor(Math.random()*34)
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
      nom_produit: [''], 
      code_produit: [''], 
      type_produit: [''],
      unite: [''],
      ingredients: [],
      id_centre: [this.id_centre],
      nom_centre: [''],
      code_centre: [''],
      depense: [0],
      autre_depense: [0],
      quantite_produite: [, Validators.required],
      quantite_gate: [0, Validators.required],
      perte: [0, Validators.required],
      montan_production: [0, Validators.required],
      benefice: [0, Validators.required],
      quantite_reelle: [0, Validators.required],
      ancien_stock: [0, Validators.required],
      nouveau_stock: [0, Validators.required],
      prix_unitaire: [0, Validators.required],
      type_main_doeuvre_interne: ['gratuite', Validators.required],
      nombre_femme_interne: [0, Validators.required],
      cout_femme_interne: [0, Validators.required],
      nombre_homme_interne: [0, Validators.required],
      cout_homme_interne: [0, Validators.required],
      mode_paiement_interne: ['argent'],

      type_main_doeuvre_externe: ['aucune', Validators.required],
      nombre_femme_externe: [0, Validators.required],
      cout_femme_externe: [0, Validators.required],
      nombre_homme_externe: [0, Validators.required],
      cout_homme_externe: [0, Validators.required],
      mode_paiement_externe: ['argent'],
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
      ingredients: [production.data.ingredients],
      id_centre: [production.data.id_centre],
      nom_centre: [production.data.nom_centre],
      code_centre: [production.data.code_centre],
      depense: [production.data.depense, Validators.required],
      quantite_produite: [production.data.quantite_produite, Validators.required],
      autre_depense: [production.data.autre_depense, Validators.required],
      quantite_gate: [production.data.quantite_gate, Validators.required],
      perte: [production.data.perte, Validators.required],
      montan_production: [production.data.montan_production, Validators.required],
      benefice: [production.data.benefice, Validators.required],
      quantite_reelle: [production.data.quantite_reelle, Validators.required],
      ancien_stock: [production.data.ancien_stock, Validators.required],
      nouveau_stock: [production.data.nouveau_stock, Validators.required],
      prix_unitaire: [production.data.prix_unitaire, Validators.required],
      
      type_main_doeuvre_interne: [production.data.type_main_doeuvre_interne, Validators.required],
      nombre_femme_interne: [production.data.nombre_femme_interne],
      cout_femme_interne: [production.data.cout_femme_interne],
      nombre_homme_interne: [production.data.nombre_homme_interne],
      cout_homme_interne: [production.data.cout_homme_interne],
      mode_paiement_interne: [production.data.mode_paiement_interne],

      type_main_doeuvre_externe: [production.data.type_main_doeuvre_externe, Validators.required],
      nombre_femme_externe: [production.data.nombre_femme_externe],
      cout_femme_externe: [production.data.cout_femme_externe],
      nombre_homme_externe: [production.data.nombre_homme_externe],
      cout_homme_externe: [production.data.cout_homme_externe],
      mode_paiement_externe: [production.data.mode_paiement_externe],
      id_stock: [production.data.id_stock],
      today: [production.data.today, Validators.required],
    });

    this.selectedCentre = production.data.id_centre;
    this.selectedProduit = production.data.id_type_produit;
    this.nom_centre = production.data.nom_centre;
    this.code_centre = production.data.code_centre;
    this.code = production.data.code;
    this.ingredients = production.data.ingredients;
    this.getStock(production.data.id_stock, 'editer');
  }


  getVariete(){
    let cls: any = [];
    this.servicePouchdb.getPlageDocsRapide('variete', 'variete:\uffff').then((v) => {
      this.varietes = v
    });
  }
  

  getProduit(id_produit){
    for(let i = 0; i < this.produits.length; i++){
      if(this.produitsCentre[i].doc._id == id_produit){
        this.productionForm.controls.code_produit.setValue(this.produits[i].doc.data.code);
        this.productionForm.controls.nom_produit.setValue(this.produits[i].doc.data.nom);
        this.productionForm.controls.code_centre.setValue(this.produits[i].doc.data.code_centre);
        this.productionForm.controls.nom_centre.setValue(this.produits[i].doc.data.nom_centre);
        /*if(this.id_produit && this.id_produit != ''){
          this.productionForm.controls.id_centre.setValue(this.produits[i].doc.data.id_centre);
        }*/
        this.productionForm.controls.unite.setValue(this.produits[i].doc.data.unite);
        this.productionForm.controls.type_produit.setValue(this.produits[i].doc.data.nom_type_produit);
        this.productionForm.controls.prix_unitaire.setValue(this.produits[i].doc.data.prix_unitaire);
        this.productionForm.controls.id_stock.setValue(this.produits[i].doc.data.id_stock);
        this.ingredients = this.produits[i].doc.data.ingredients;
        this.getStock(this.produits[i].doc.data.id_stock)
        this.getVariete();
        this.getDepense();
        this.getQuantiteReelle();
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
      this.productionForm.controls.ancien_stock.setValue(s.data.quantite_disponible);
    })
  }

  getDepense(){
    //if(quantite && prix_unitaire){
      //this.depense += quantite * prix_unitaire;

    let d: number = 0;
    //cout des ingredients
    this.ingredients.forEach((i) => {
      d += /*i.quantite * */i.cout * 1;
    })

    //cout de la main d'oeuvre interne
    if(this.productionForm.controls.mode_paiement_interne.value != 'argent'){
      d += parseFloat(this.productionForm.controls.prix_unitaire.value) * parseFloat(this.productionForm.controls.cout_femme_interne.value);
      d += parseFloat(this.productionForm.controls.prix_unitaire.value) * parseFloat(this.productionForm.controls.cout_homme_interne.value);
      //mise à jour de la quantié réelle
      this.getQuantiteReelle()
    }else{
      //cas de paiement par argents
      d += parseFloat(this.productionForm.controls.cout_femme_interne.value) * 1;
      d += parseFloat(this.productionForm.controls.cout_homme_interne.value) * 1;
    }

    //cout de la main d'oeuvre externe
    //cas de paiement par quantité de produit
    if(this.productionForm.controls.mode_paiement_externe.value != 'argent'){
      d += parseFloat(this.productionForm.controls.prix_unitaire.value) * parseFloat(this.productionForm.controls.cout_femme_externe.value);
      d += parseFloat(this.productionForm.controls.prix_unitaire.value) * parseFloat(this.productionForm.controls.cout_homme_externe.value);
      //mise à jour de la quantié réelle
      this.getQuantiteReelle()
    }else{
      //cas de paiement par argents
      d += parseFloat(this.productionForm.controls.cout_femme_externe.value) * 1;
      d += parseFloat(this.productionForm.controls.cout_homme_externe.value) * 1;
    }

    if(!isNaN(parseFloat(this.productionForm.controls.autre_depense.value))){
      d += parseFloat(this.productionForm.controls.autre_depense.value);
      //this.getBenefice();
    }

    this.productionForm.controls.depense.setValue(d);
    this.getBenefice();
    //}
  }

  getDepenseSupplementaire(){
    if(!isNaN(parseFloat(this.productionForm.controls.autre_depense.value))){
      this.productionForm.controls.depense.setValue(parseFloat(this.productionForm.controls.autre_depense.value) + parseFloat(this.productionForm.controls.depense.value));
      this.getBenefice();
    }
    
  }

  getPerte(){
    this.productionForm.controls.perte.setValue(parseFloat(this.productionForm.controls.prix_unitaire.value) * parseFloat(this.productionForm.controls.quantite_gate.value));
  }

  getTypeMainInterne(type){
    if(type == 'gratuite'){
      this.productionForm.controls.cout_femme_interne.setValue(0);
      this.productionForm.controls.cout_homme_interne.setValue(0);
      //this.productionForm.controls.mode_paiement_interne.setValue(' ');
      this.getDepense();
      this.getQuantiteReelle();
    }else{
      this.getDepense();
      this.getQuantiteReelle();
    }
  }

  getTypeMainExterne(type){
    if(type == 'aucune'){
      this.productionForm.controls.nombre_femme_externe.setValue(0);
      this.productionForm.controls.nombre_homme_externe.setValue(0);
      this.productionForm.controls.cout_femme_externe.setValue(0);
      this.productionForm.controls.cout_homme_externe.setValue(0);
      //this.productionForm.controls.mode_paiement_externe.setValue(' ');
      this.getDepense();
      this.getQuantiteReelle();
    }else if(type == 'gratuite'){
      this.productionForm.controls.cout_femme_externe.setValue(0);
      this.productionForm.controls.cout_homme_externe.setValue(0);
      //this.productionForm.controls.mode_paiement_externe.setValue(' ');
      this.getDepense();
      this.getQuantiteReelle();
    }else{
      this.getDepense();
      this.getQuantiteReelle();
    }
  }

  ModepaiementInterne(mode){
    this.getDepense();
    this.getQuantiteReelle();
  }

  ModepaiementExterne(mode){
    this.getDepense();
    this.getQuantiteReelle();
  }

  /*getCoutM(cout){
    this.depense += parseFloat(cout);
  }

  //
  getCoutMP(cout, prix){
    this.depense += cout * prix;
    if(this.productionForm.controls.quantite_produite.value && this.productionForm.controls.quantite_produite.value != ''){
      this.getQuantiteReelle();
    }
  }
*/

getBenefice(){
  if(!isNaN(parseFloat(this.productionForm.value.montan_production)) && !isNaN(parseFloat(this.productionForm.controls.depense.value))){
    this.productionForm.controls.benefice.setValue(parseFloat(this.productionForm.value.montan_production) - parseFloat(this.productionForm.controls.depense.value));
  }
  
}

  getQuantiteReelle(){
    //cas de main d'oeuvre avec paiement par produit interne et externe
    if(!isNaN(parseFloat(this.productionForm.value.quantite_produite))){
      this.productionForm.controls.montan_production.setValue(parseFloat(this.productionForm.value.quantite_produite) * parseFloat(this.productionForm.controls.prix_unitaire.value));
    }
 
    //this.productionForm.controls.perte.setValue(parseFloat(this.productionForm.value.quantite_produite) * parseFloat(this.productionForm.controls.prix_unitaire.value));
    this.getBenefice();
    if(this.productionForm.controls.mode_paiement_externe.value != 'argent' && this.productionForm.controls.mode_paiement_interne.value != 'argent'){
      this.productionForm.controls.quantite_reelle.setValue( parseFloat(this.productionForm.value.quantite_produite) /*- this.productionForm.value.quantite_gate*/ - parseFloat(this.productionForm.controls.cout_femme_externe.value) - parseFloat(this.productionForm.controls.cout_homme_externe.value) - parseFloat(this.productionForm.controls.cout_femme_interne.value) - parseFloat(this.productionForm.controls.cout_homme_interne.value));
      this.productionForm.controls.nouveau_stock.setValue(parseFloat(this.productionForm.controls.ancien_stock.value) + parseFloat(this.productionForm.controls.quantite_reelle.value));
    }else 
    ////cas de main d'oeuvre avec paiement par produit externe seulement
    if(this.productionForm.controls.mode_paiement_externe.value != 'argent' && this.productionForm.controls.mode_paiement_interne.value == 'argent'){
      this.productionForm.controls.quantite_reelle.setValue(parseFloat(this.productionForm.value.quantite_produite) /*- this.productionForm.value.quantite_gate*/ - parseFloat(this.productionForm.controls.cout_femme_externe.value) - parseFloat(this.productionForm.controls.cout_homme_externe.value));
      this.productionForm.controls.nouveau_stock.setValue(parseFloat(this.productionForm.controls.ancien_stock.value) + parseFloat(this.productionForm.controls.quantite_reelle.value));
    }else
    //cas de main d'oeuvre avec paiement par produit interne seulement
    if(this.productionForm.controls.mode_paiement_externe.value == 'argent' && this.productionForm.controls.mode_paiement_interne.value != 'argent'){
      this.productionForm.controls.quantite_reelle.setValue(parseFloat(this.productionForm.value.quantite_produite) - /*this.productionForm.value.quantite_gate -*/ parseFloat(this.productionForm.controls.cout_femme_interne.value) - parseFloat(this.productionForm.controls.cout_homme_interne.value));
      this.productionForm.controls.nouveau_stock.setValue(parseFloat(this.productionForm.controls.ancien_stock.value) + parseFloat(this.productionForm.controls.quantite_reelle.value));
    }else{
      //sinon
      this.productionForm.controls.quantite_reelle.setValue(parseFloat(this.productionForm.value.quantite_produite)/* - this.productionForm.value.quantite_gate*/ + 0);
      this.productionForm.controls.nouveau_stock.setValue(parseFloat(this.productionForm.controls.ancien_stock.value) + parseFloat(this.productionForm.controls.quantite_reelle.value));

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


  doRefresh(refresher) {
     // this.productions = [];
      this.servicePouchdb.getPlageDocsRapide('production','production:\uffff').then((productions) => {
        if(productions){
          if(this.id_centre && this.id_centre != ""){
            let uns: any= [];
            productions.forEach((u) => {
              if(u.doc.data.id_produit == this.id_produit_selected && u.doc.data.id_centre && u.doc.data.id_centre == this.id_centre){
                uns.push(u)
              }
            });
            this.productions = uns;
            this.allProductions = uns;
            refresher.complete();
          }else{
            let uns: any= [];
            productions.forEach((u) => {
              if(u.doc.data.id_produit == this.id_produit_selected){
                uns.push(u)
              }
            });
            this.productions = uns;
            this.allProductions = uns;
            refresher.complete();
          }
          
        }
      });
  }

  estMangerConnecter(user){
    //alert('entree')
    if(user && user.roles){
      //alert('ok')
      this.estManger = global.estManager(user.roles);
    }
  }

  estAdminConnecter(user){
    if(user && user.roles){
      this.estManger = global.estAdmin(user.roles);
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

    production.ingredients.forEach((i) => {
      if(i.est_obligatoire == 'oui' &&((!i.quantite || i.quantite == '' ) || (i.type == 'culture' &&(!i.variete || i.variete == '' || !i.quantite || i.quantite == '' )))){
        msg += '\nLes renseignements de l\'ingrédient '+i.nom+' sont obligatoires.'
      }
    
      if(i.cout < 0 || (!i.cout && i.cout != 0)){
        msg += '\nLe coût de l\'ingrédient '+i.nom+' est obligatoire et non null ou négatif.'
      }
    });


    if(production.quantite_produite < 0){
      msg += '\nLa quantité produite ne peut pas être nulle ou négative.' 
    }

    //1
    /*if(this.action == 'ajouter'){
      this.allProductions.forEach((u, index) => {
        if((production.code == u.doc.data.code) || (production.nom == u.doc.data.nom && production.id_centre == u.doc.data.id_centre)){
          res = 0;
        }
      });      
    }else{
      this.allProductions.forEach((u, index) => {
        if((u.doc._id != this.production._id) && ((production.code == u.doc.data.code) || (production.nom == u.doc.data.nom && production.id_centre == u.doc.data.id_centre))){
          res = 0;
        }
      });      
    }*/
    
    return msg;
  }

  validAction(){
    let date = new Date();
    let production = this.productionForm.value;
    production.ingredients = this.ingredients;
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
          u.doc = productionFinal;

          //metre à jour le stock
          this.stock.data.quantite_produite += parseFloat(productionFinal.data.quantite_produite);
          //this.stock.data.quantite_gate += productionFinal.data.quantite_gate;
          this.stock.data.quantite_disponible += parseFloat(productionFinal.data.quantite_reelle);
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
        this.production.data.ingredients = this.ingredients;
        this.production.data.id_centre = production.id_centre;
        this.production.data.nom_centre = production.nom_centre;
        this.production.data.code_centre = production.code_centre;
        this.production.data.depense = production.depense;
        this.production.data.quantite_produite = production.quantite_produite;
        //this.production.data.quantite_gate = production.quantite_gate;
        this.production.data.quantite_reelle = production.quantite_reelle;
        this.production.data.ancien_stock = production.ancien_stock;
        this.production.data.nouveau_stock = production.nouveau_stock;
        this.production.data.prix_unitaire = production.montan_production;
        this.production.data.prix_unitaire = production.quantite_gate;
        this.production.data.prix_unitaire = production.perte;
        this.production.data.prix_unitaire = production.benefice;
        this.production.data.prix_unitaire = production.autre_depense;
      
        this.production.data.type_main_doeuvre_interne = production.type_main_doeuvre_interne;
        this.production.data.nombre_femme_interne = production.nombre_femme_interne;
        this.production.data.cout_femme_interne = production.cout_femme_interne;
        this.production.data.nombre_homme_interne = production.nombre_homme_interne;
        this.production.data.cout_homme_interne = production.cout_homme_interne;
        this.production.data.mode_paiement_interne = production.mode_paiement_interne;

        this.production.data.type_main_doeuvre_externe = production.type_main_doeuvre_externe;
        this.production.data.nombre_femme_externe = production.nombre_femme_externe;
        this.production.data.cout_femme_externe = production.cout_femme_externe;
        this.production.data.nombre_homme_externe = production.nombre_homme_externe;
        this.production.data.cout_homme_externe = production.cout_homme_externe;
        this.production.data.mode_paiement_externe = production.mode_paiement_externe;
        this.production.data.id_stock = production.id_stock;

        this.production.data.update_deviceid = this.device.uuid;
        this.production.data.update_phonenumber = this.phonenumber;
        this.production.data.update_imei = this.imei;

        this.servicePouchdb.updateDocReturn(this.production).then((res) => {
          this.production._rev = res.rev;
          //metre à jour le stock
          //en cas de changement de produit
          if(this.production.data.id_stock != this.copie_stock._id){
            //soustraire l'ancienne production
            this.copie_stock.data.quantite_produite -= parseFloat(this.copieProduction.data.quantite_produite);
            //this.copie_stock.data.quantite_gate -= this.copieProduction.data.quantite_gate;
            this.copie_stock.data.quantite_disponible -= parseFloat(this.copieProduction.data.quantite_reelle);
            this.servicePouchdb.updateDoc(this.copie_stock);

            //mise à jour nouveau stock
            this.stock.data.quantite_produite += parseFloat(this.production.data.quantite_produite);
            //this.stock.data.quantite_gate += this.production.data.quantite_gate;
            this.stock.data.quantite_disponible += parseFloat(this.production.data.quantite_reelle);
            this.servicePouchdb.updateDoc(this.stock);
          }else{
            //mise à jour du stocke
            this.stock.data.quantite_produite += parseFloat(this.production.data.quantite_produite) - parseFloat(this.copieProduction.data.quantite_produite);
            //this.stock.data.quantite_gate += (this.production.data.quantite_gate - this.copieProduction.data.quantite_gate);
            this.stock.data.quantite_disponible += parseFloat(this.production.data.quantite_reelle) - parseFloat(this.copieProduction.data.quantite_reelle);
            this.servicePouchdb.updateDoc(this.stock);
          }
          //fin mise à jour stock
          
          //this.production = this.grandeproduction
          let toast = this.toastCtl.create({
            message: 'Production bien sauvegardée!',
            position: 'top',
            duration: 1000
          });
          this.action  = 'detail';
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

    for(let i = 0; i > this.produits.length; i++ ){
      if(this.produits[i].doc._id == id_produit_selected){
        this.selectedProduitIngredients = this.produits[i].doc.data.ingredients;
        break;
      }
    }
    
    //this.rechercher = true;
     // this.productions = [];
      this.servicePouchdb.getPlageDocsRapide('production','production:\uffff').then((productions) => {
        if(productions){
          if(this.id_centre && this.id_centre != ""){
            let uns: any= [];
            productions.forEach((u) => {
              if(u.doc.data.id_produit == id_produit_selected && u.doc.data.id_centre && u.doc.data.id_centre == this.id_centre){
                uns.push(u)
              }
            });
            this.productions = uns;
            this.allProductions = uns;
            this.rechercher = false;
          }else{
            let uns: any= [];
            productions.forEach((u) => {
              if(u.doc.data.id_produit == id_produit_selected){
                uns.push(u)
              }
            });
            this.productions = uns;
            this.allProductions = uns;
            this.rechercher = false;
          }
          
          //this.allProductions1 = productions;
         
        }
      }).catch((err) => {
        console.log(err)
        this.rechercher = false;
      }); 
  }


  getAllCentre(){
      this.servicePouchdb.getPlageDocsRapide('centre','centre:\uffff').then((centres) => {
        if(centres){
          this.centres = centres;
        }
      }).catch((err) => console.log(err)); 
  }

  getProduitsCentre(id_centre){
    this.getProduitsByCentre(id_centre);
  }

  getAllProduits(){
    this.rechercher = true;
     // this.productions = [];
    this.servicePouchdb.getPlageDocsRapide('produit:','produit:\uffff').then((produits) => {
      if(produits){
        if(this.id_centre && this.id_centre != ''){
          let p: any = [];
          produits.forEach((prod) => {
            if(prod.doc.data.id_centre == this.id_centre){
              p.push(prod);
            }
          });
          this.produits = p;
          if(this.produits.length > 0){
            this.id_produit_selected = this.produits[0].doc._id;
            this.selectedProduitIngredients = this.produits[0].doc.data.ingredients;
            this.getAllProductions(this.id_produit_selected);
          }else{
            this.rechercher = false;
      // this.productions = [];
          }
        }else{
          this.produits = produits;
          if(this.produits.length > 0){
            this.id_produit_selected = this.produits[0].doc._id;
            this.selectedProduitIngredients = this.produits[0].doc.data.ingredients;
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
    if(prod.doc.data.id_centre == id_centre){
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
    this.getProduitsByCentre(production.data.id_centre);
    this.copieProduction = this.clone(production);
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
          return (item.doc.data.nom_produit.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }else if(this.typeRecherche === 'code_produit'){
          return (item.doc.data.code_produit.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }else if(this.typeRecherche === 'type_produit'){
           return (item.doc.data.type_produit.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }if(this.typeRecherche === 'code_centre'){
          return (item.doc.data.code_centre.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }if(this.typeRecherche === 'nom_centre'){
          return (item.doc.data.nom_centre.toLowerCase().indexOf(val.toLowerCase()) > -1);
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
              //if(stock.data.quantite_disponible - production.data.quantite_reelle >= 0){
               // stock.data.quantite_produite -= production.data.quantite_produite;
                //stock.data.quantite_gate -= production.data.quantite_gate;
               // stock.data.quantite_disponible -= production.data.quantite_reelle;

                //supprimer la production
                this.servicePouchdb.deleteReturn(production).then((res) => {
                  //mettre le stock à jour
                  //this.servicePouchdb.updateDoc(stock);
                  //let e: any = {};
                  //e.doc = essai;
                  this.productions.forEach((es, i) => {
                    if(es.doc._id === production._id){
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
              //if(stock.data.quantite_disponible - production.data.quantite_reelle >= 0){
               // stock.data.quantite_produite -= production.data.quantite_produite;
                //stock.data.quantite_gate -= production.data.quantite_gate;
               // stock.data.quantite_disponible -= production.data.quantite_reelle;

                //supprimer la production
                this.servicePouchdb.deleteDocReturn(production).then((res) => {
                  //mettre le stock à jour
                 // this.servicePouchdb.updateDoc(stock);
                  //let e: any = {};
                  //e.doc = essai;
                  this.productions.forEach((es, i) => {
                    if(es.doc._id === production._id){
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
              if(stock.data.quantite_disponible - production.data.quantite_reelle >= 0){
                stock.data.quantite_produite -= production.data.quantite_produite;
                //stock.data.quantite_gate -= production.data.quantite_gate;
                stock.data.quantite_disponible -= production.data.quantite_reelle;

                //supprimer la production
                this.servicePouchdb.deleteReturn(production).then((res) => {
                  //mettre le stock à jour
                  this.servicePouchdb.updateDoc(stock);
                  //let e: any = {};
                  //e.doc = essai;
                  this.productions.forEach((es, i) => {
                    if(es.doc._id === production._id){
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
              if(stock.data.quantite_disponible - production.data.quantite_reelle >= 0){
                stock.data.quantite_produite -= production.data.quantite_produite;
                //stock.data.quantite_gate -= production.data.quantite_gate;
                stock.data.quantite_disponible -= production.data.quantite_reelle;

                //supprimer la production
                this.servicePouchdb.deleteDocReturn(production).then((res) => {
                  //mettre le stock à jour
                  this.servicePouchdb.updateDoc(stock);
                  //let e: any = {};
                  //e.doc = essai;
                  this.productions.forEach((es, i) => {
                    if(es.doc._id === production._id){
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
