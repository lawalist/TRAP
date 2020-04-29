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
import { RelationProduitGateComponent } from '../../components/relation-produit-gate/relation-produit-gate';
declare var cordova: any;
/**
 * Generated class for the ProduitGatePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-produit-gate',
  templateUrl: 'produit-gate.html',
})
export class ProduitGatePage {

  gateForm: FormGroup;
  user: any = global.info_user;
  global:any = global;
  estManger: boolean = false;
  estAdmin: boolean = false;
  estAnimataire: boolean = false;
  gates: any = [];
  allGates: any = [];
  //allGates1: any = [];
  code: any;
  phonenumber: any;
  imei: any;
  aProfile: boolean = false;
  ajoutForm: boolean = false;
  selectedStyle: any = 'liste';
  typeRecherche: any = 'nom';
  rechercher: any = false;
  action: string = 'liste';
  gate: any;
  copieGate: any;
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


  constructor(public navCtrl: NavController, public popoverController: PopoverController, public actionSheetCtrl: ActionSheetController, public loadinCtl: LoadingController, public viewCtl: ViewController, public menuCtl: MenuController, public alertCtl: AlertController, public sim: Sim, public device: Device, public servicePouchdb: PouchdbProvider, public platform: Platform, public toastCtl: ToastController, public printer: Printer, public file: File, public modelCtl: ModalController, public navParams: NavParams, public formBuilder: FormBuilder) {
    if(navParams.data.id_centre){
      this.id_centre = this.navParams.data.id_centre;
      this.code_centre = this.navParams.data.code_centre;
      this.nom_centre = this.navParams.data.nom_centre;
      this.selectedCentre = this.id_centre;
    }
  }

  reinitVar(){
    this.selectedCentre = '';
    this.selectedProduit = '';
    this.code = '';
  }

     
openRelationProduitGate(ev: any) {
  let popover = this.popoverController.create(RelationProduitGateComponent);
  popover.present({ev: ev});

  popover.onWillDismiss((res) => {
    if(res == 'Etat du stock'){
      this.etatStock(this.gate.data.id_stock, this.gate.data.nom);
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
            this.editer(this.gate)
          }
        },
        {
          text: 'produit-gates',
          role: 'destructive',
          icon: 'trash',
          cssClass: 'myActionSheetBtnStyle',
          /*handler: () => {
            this.supprimer(this.gate);
          }*/
        },{
          text: 'Etat du stock',
          role: 'destructive',
          icon: 'trash',
          cssClass: 'myActionSheetBtnStyle',
          handler: () => {
            this.etatStock(this.gate.data.id_stock, this.gate.data.nom);
          }
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          icon: 'trash',
          cssClass: 'myActionSheetBtnStyle',
          handler: () => {
            this.supprimer(this.gate);
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

  etatStock(id_stock, nom_gate){
    let model = this.modelCtl.create('StockPage', {'id_stock': id_stock, 'nom_gate': nom_gate});
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



  membresgate(id_gate, nom_gate, code){
    let model = this.modelCtl.create('MembrePage', {'id_gate': id_gate, "nom_gate": nom_gate, "code": code});
    model.present();
  }

  initForm(){
    this.gateForm = null;
    let maDate = new Date();
    let today = this.createDate(maDate.getDate(), maDate.getMonth(), maDate.getFullYear());

 
    this.gateForm = this.formBuilder.group({
      //_id:[''],
      type:['produit-gate'],
      date: [today, Validators.required],
      id_produit: ['', Validators.required], 
      nom_produit: [''], 
      code_produit: [''], 
      type_produit: [''],
      unite: [''],
      perte: [0],
      id_centre: [''],
      nom_centre: [''],
      code_centre: [''],
      ancien_stock: [''],
      quantite_gate: ['', Validators.required],
      anciene_quantite_gate: [''],
      nouveau_stock: [''],
      prix_unitaire: [''],
      id_stock: [''],
      today: [today],
      deviceid: [''],
      imei: [''],
      phonenumber: [''],
      start: [maDate.toJSON()],
      end: ['']
    });
    
  }

  editForm(gate){
    this.gateForm = null;
    this.gateForm = this.formBuilder.group({
      //_id:[''],
      date: [gate.data.date, Validators.required],
      id_produit: [gate.data.id_produit, Validators.required], 
      nom_produit: [gate.data.nom_produit], 
      code_produit: [gate.data.code_produit], 
      type_produit: [gate.data.type_produit],
      unite: [gate.data.unite],
      id_centre: [gate.data.id_centre],
      nom_centre: [gate.data.nom_centre],
      code_centre: [gate.data.code_centre],
      ancien_stock: [gate.data.ancien_stock],
      anciene_quantite_gate: [gate.data.anciene_quantite_gate],
      quantite_gate: [gate.data.quantite_gate, Validators.required],
      nouveau_stock: [gate.data.nouveau_stock],
      prix_unitaire: [gate.data.prix_unitaire],
      perte: [gate.data.perte],
      id_stock: [gate.data.id_stock],
      today: [gate.data.today, Validators.required],
    });

    this.selectedCentre = gate.data.id_centre;
    this.selectedProduit = gate.data.id_type_produit;
    this.nom_centre = gate.data.nom_centre;
    this.code_centre = gate.data.code_centre;
    this.code = gate.data.code;
    this.getStock(gate.data.id_stock, 'editer');
  }


  getProduit(id_produit){
    for(let i = 0; i < this.produits.length; i++){
      if(this.produits[i].doc._id == id_produit){
        this.gateForm.controls.code_produit.setValue(this.produits[i].doc.data.code);
        this.gateForm.controls.nom_produit.setValue(this.produits[i].doc.data.nom);
        this.gateForm.controls.code_centre.setValue(this.produits[i].doc.data.code_centre);
        this.gateForm.controls.nom_centre.setValue(this.produits[i].doc.data.nom_centre);
        this.gateForm.controls.id_centre.setValue(this.produits[i].doc.data.id_centre);
        this.gateForm.controls.unite.setValue(this.produits[i].doc.data.unite);
        this.gateForm.controls.type_produit.setValue(this.produits[i].doc.data.nom_type_produit);
        this.gateForm.controls.prix_unitaire.setValue(this.produits[i].doc.data.prix_unitaire);
        this.gateForm.controls.id_stock.setValue(this.produits[i].doc.data.id_stock);
        this.getStock(this.produits[i].doc.data.id_stock)
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
      this.gateForm.controls.ancien_stock.setValue(s.data.quantite_disponible);
      if(!this.gateForm.controls.quantite_gate.value || this.gateForm.controls.quantite_gate.value == 0){
        this.gateForm.controls.nouveau_stock.setValue(s.data.quantite_disponible);
      }else{
        this.gateForm.controls.nouveau_stock.setValue(s.data.quantite_disponible - this.gateForm.controls.quantite_gate.value);
      }
      
    })
  }

  getNouvelleQuantite(q){
    this.gateForm.controls.nouveau_stock.setValue(this.stock.data.quantite_disponible - this.gateForm.controls.quantite_gate.value);
    
    this.gateForm.controls.perte.setValue(parseFloat(this.gateForm.controls.quantite_gate.value) * parseFloat(this.gateForm.controls.prix_unitaire.value));
    
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
     // this.gates = [];
      this.servicePouchdb.getPlageDocsRapide('produit-gate','produit-gate:\uffff').then((gates) => {
        if(gates){
          if(this.id_centre && this.id_centre != ""){
            let uns: any= [];
            gates.forEach((u) => {
              if(u.doc.data.id_produit == this.id_produit_selected && u.doc.data.id_centre && u.doc.data.id_centre == this.id_centre){
                uns.push(u)
              }
            });
            this.gates = uns;
            this.allGates = uns;
            refresher.complete();
          }else{
            let uns: any= [];
            gates.forEach((u) => {
              if(u.doc.data.id_produit == this.id_produit_selected){
                uns.push(u)
              }
            });
            this.gates = uns;
            this.allGates = uns;
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

  estAnimataireConnecter(user){
    if(user && user.roles){
      this.estAnimataire = global.estAnimataire(user.roles);
    }
  }

    typeRechercheChange(){
    this.gates = this.allGates;
  }


  exportExcel(){

    let date = new Date();
    //let dateHeure = date.toLocaleDateString()+ date.toLocaleTimeString();// + date.getTime().toLocaleString();
    let nom = date.getDate().toString() +'_'+ (date.getMonth() + 1).toString() +'_'+ date.getFullYear().toString() +'_'+ date.getHours().toString() +'_'+ date.getMinutes().toString() +'_'+ date.getSeconds().toString();

    let blob = new Blob([document.getElementById('produit-gate_tableau').innerHTML], {
      //type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
      type: "text/plain;charset=utf-8"
      //type: 'application/vnd.ms-excel;charset=utf-8'
      //type: "application/vnd.ms-excel;charset=utf-8"
    });

    if(!this.platform.is('android')){
      FileSaver.saveAs(blob, 'produit-gates_'+nom+'.xls');
    }else{

      let fileDestiny: string = cordova.file.externalRootDirectory;
      this.file.writeFile(fileDestiny, 'produit-gates_'+nom+'.xls', blob).then(()=> {
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
    let content = document.getElementById('produit-gate_tableau').innerHTML;
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


  verifierUniqueNon(gate){

    let res = 0;//1
    if(this.action == 'ajouter'){
        if(this.stock.data.quantite_disponible - gate.quantite_gate < 0){
          res = 1;
        }
    }else{

      if(gate.id_stock != this.copie_stock._id){
        if(this.stock.data.quantite_disponible - gate.quantite_gate < 0){
          res = 1;
        }
        
      }else{
        if(this.stock.data.quantite_disponible - (gate.quantite_gate - this.copieGate.data.quantite_gate) < 0){
          res = 1;
        }
      }
      
            
    }
    
    return res;
  }

  validAction(){
    let date = new Date();
    let gate = this.gateForm.value;
    gate.anciene_quantite_gate = Math.round(this.stock.data.quantite_gate * 100)/100;
    if(this.verifierUniqueNon(gate) != 0/*==*/){
      alert('Stock insuffisant');
    }else{
           
      gate.deviceid = this.device.uuid;
      gate.phonenumber = this.phonenumber;
      gate.imei = this.imei;

      if(this.action == 'ajouter'){
        let id = this.generateId();
        gate.end = date.toJSON();
        let gateFinal: any = {};
        gateFinal._id =  'produit-gate:'+id;
        
        gateFinal.data = gate
        this.servicePouchdb.createDocReturn(gateFinal).then((res) => {
          gateFinal._rev = res.rev;
          let u: any = {}
          u.doc = gateFinal;

          //metre à jour le stock
          //this.stock.data.quantite_produite -= gateFinal.data.quantite_gate;
          this.stock.data.quantite_gate += Math.round(gateFinal.data.quantite_gate * 100)/100;
          this.stock.data.quantite_disponible -= Math.round(gateFinal.data.quantite_gate * 100)/100;
          this.servicePouchdb.updateDoc(this.stock)
          //fin mise à jour stock
          
          this.gates.push(u)
          this.allGates = this.gates;
          //this.allGates1.push(u)
          this.action = 'liste';
          //this.ressetChampsForm();
          let toast = this.toastCtl.create({
            message: 'produit-gate bien enregistré!',
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

        this.gate.data.date = gate.date;
        this.gate.data.id_produit = gate.id_produit; 
        this.gate.data.nom_produit = gate.nom_produit; 
        this.gate.data.code_produit = gate.code_produit; 
        this.gate.data.type_produit = gate.type_produit;
        this.gate.data.unite = gate.unite;
        this.gate.data.id_centre = gate.id_centre;
        this.gate.data.nom_centre = gate.nom_centre;
        this.gate.data.code_centre = gate.code_centre;

        this.gate.data.quantite_gate = gate.quantite_gate;
        this.gate.data.perte = gate.perte;
        this.gate.data.anciene_quantite_gate = gate.anciene_quantite_gate;
        this.gate.data.ancien_stock = gate.ancien_stock;
        this.gate.data.nouveau_stock = gate.nouveau_stock;
        this.gate.data.prix_unitaire = gate.prix_unitaire;       
        this.gate.data.id_stock = gate.id_stock;

        this.gate.data.update_deviceid = this.device.uuid;
        this.gate.data.update_phonenumber = this.phonenumber;
        this.gate.data.update_imei = this.imei;

        this.servicePouchdb.updateDocReturn(this.gate).then((res) => {
          this.gate._rev = res.rev;
          //metre à jour le stock
          //en cas de changement de produit
          if(this.gate.data.id_stock != this.copie_stock._id){
            //soustraire l'ancienne gate
            //this.copie_stock.data.quantite_produite -= this.copieGate.data.quantite_produite;
            this.copie_stock.data.quantite_gate -= this.copieGate.data.quantite_gate;
            this.copie_stock.data.quantite_disponible += this.copieGate.data.quantite_gate;
            this.servicePouchdb.updateDoc(this.copie_stock);

            //mise à jour nouveau stock
            //this.stock.data.quantite_produite += this.gate.data.quantite_produite;
            this.stock.data.quantite_gate += this.gate.data.quantite_gate;
            this.stock.data.quantite_disponible -= this.gate.data.quantite_gate;
            this.servicePouchdb.updateDoc(this.stock);
          }else{
            //mise à jour du stocke
            //this.stock.data.quantite_produite += (this.gate.data.quantite_produite - this.copieGate.data.quantite_produite);
            this.stock.data.quantite_gate  += (this.gate.data.quantite_gate - this.copieGate.data.quantite_gate);
            this.stock.data.quantite_disponible -= (this.gate.data.quantite_gate - this.copieGate.data.quantite_gate);
            this.servicePouchdb.updateDoc(this.stock);
          }
          //fin mise à jour stock
          
          //this.gate = this.grandegate
          let toast = this.toastCtl.create({
            message: 'produit-gate bien sauvegardée!',
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

  
  getAllGates(id_produit_selected){

    for(let i = 0; i > this.produits.length; i++ ){
      if(this.produits[i].doc._id == id_produit_selected){
        this.selectedProduitIngredients = this.produits[i].doc.data.ingredients;
        break;
      }
    }
    
    //this.rechercher = true;
     // this.gates = [];
      this.servicePouchdb.getPlageDocsRapide('produit-gate','produit-gate:\uffff').then((gates) => {
        if(gates){
          if(this.id_centre && this.id_centre != ""){
            let uns: any= [];
            gates.forEach((u) => {
              if(u.doc.data.id_produit == id_produit_selected && u.doc.data.id_centre && u.doc.data.id_centre == this.id_centre){
                uns.push(u)
              }
            });
            this.gates = uns;
            this.allGates = uns;
            this.rechercher = false;
          }else{
            let uns: any= [];
            gates.forEach((u) => {
              if(u.doc.data.id_produit == id_produit_selected){
                uns.push(u)
              }
            });
            this.gates = uns;
            this.allGates = uns;
            this.rechercher = false;
          }
          
          //this.allGates1 = gates;
         
        }
      }).catch((err) => {
        console.log(err)
        this.rechercher = false;
      }); 
  }

  
  getAllProduits(){
    this.rechercher = true;
     // this.gates = [];
    this.servicePouchdb.getPlageDocsRapide('produit:','produit:\uffff').then((produits) => {
      if(produits){
        this.produits = produits;
        if(this.produits.length > 0){
          this.id_produit_selected = this.produits[0].doc._id;
          this.selectedProduitIngredients = this.produits[0].doc.data.ingredients;
          this.getAllGates(this.id_produit_selected);
        }else{
          this.rechercher = false;
     // this.gates = [];
        }
      }
    }).catch((err) => {
      this.rechercher = false;
     // this.gates = [];
      console.log(err)
    }); 
}


  ionViewDidEnter() {
    //this.getAllGates();
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
    //this.getAllProduits();
    this.code = this.generateCode();
      //this.navCtrl.push('AjoutergatePage', {'confLocaliteEnquete': confLocaliteEnquete});    
  }

  editer(gate){
    this.editForm(gate);
    //this.getAllProduits();
    this.getInfoSimEmei();
    this.action = 'modifier';
    this.copieGate = this.clone(gate);
      //this.navCtrl.push('AjoutergatePage', {'confLocaliteEnquete': confLocaliteEnquete});    
  }

  modifier(){
    this.getInfoSimEmei();
    this.action = 'modifier';
    //this.navCtrl.push('AjoutergatePage', {'confLocaliteEnquete': confLocaliteEnquete});    
  }

  detail(gate){
    this.gate = gate;
    this.action = 'detail';
    //this.navCtrl.push('DetailgatePage', {'produit-gate': gate, 'selectedSource': selectedSource});
  }

  getItems(ev: any) {
    // Reset items back to all of the items
    this.gates = this.allGates;

    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.gates = this.gates.filter((item) => {
        if(this.typeRecherche === 'nom'){
          return (item.doc.data.nom.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }else if(this.typeRecherche === 'code'){
          return (item.doc.data.code.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }else if(this.typeRecherche === 'produit'){
           return (item.doc.data.nom_type_produit.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }if(this.typeRecherche === 'centre'){
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

  
supprimer(gate){
  let e: any = {};
  let alert = this.alertCtl.create({
    title: 'Suppression gate',
    message: 'Etes vous sûr de vouloir supprimer cet enregistrement ?',
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
            this.servicePouchdb.getDocById(gate.data.id_stock).then((stock) => {
              //restituer la quantité emputé
              stock.data.quantite_gate -= gate.data.quantite_gate;
              stock.data.quantite_disponible += gate.data.quantite_gate;

              //supprimer la gate
              this.servicePouchdb.deleteReturn(gate).then((res) => {
                //mettre le stock à jour
                this.servicePouchdb.updateDoc(stock);
                //let e: any = {};
                //e.doc = essai;
                this.gates.forEach((es, i) => {
                  if(es.doc._id === gate._id){
                    this.gates.splice(i, 1);
                  }
                  
                });
    
                this.action = 'liste';
                //this.navCtrl.pop();
              }, err => {
                console.log(err)
              }) ;
            })
          }else{

            this.servicePouchdb.getDocById(gate.data.id_stock).then((stock) => {
              //restituer la quantité emputé
              stock.data.quantite_gate -= gate.data.quantite_gate;
              stock.data.quantite_disponible += gate.data.quantite_gate;

              //supprimer la gate
              this.servicePouchdb.deleteDocReturn(gate).then((res) => {
                //mettre le stock à jour
                this.servicePouchdb.updateDoc(stock);
                //let e: any = {};
                //e.doc = essai;
                this.gates.forEach((es, i) => {
                  if(es.doc._id === gate._id){
                    this.gates.splice(i, 1);
                  }
                  
                });
    
                this.action = 'liste';
                //this.navCtrl.pop();
              }, err => {
                console.log(err)
              }) ;
            })
          }
          
        }
      }
    ]
  });

  alert.present();
}


/*
  supprimer(gate){
    let alert = this.alertCtl.create({
      title: 'Suppression gate',
      message: 'Etes vous sûr de vouloir supprimer ce gate ?',
      buttons:[
        {
          text: 'Annuler',
          handler: () => console.log('suppression annulée')
 
        },
        {
          text: 'Confirmer',
          handler: () => {
            this.servicePouchdb.deleteDoc(gate);
            let toast = this.toastCtl.create({
              message:'produit-gate bien suppriée',
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
