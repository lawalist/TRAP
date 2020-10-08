import { Component } from '@angular/core';
  import { IonicPage, NavController, Events, PopoverController, ActionSheetController, NavParams, LoadingController, ViewController, MenuController, AlertController, ToastController, ModalController, Platform } from 'ionic-angular';
  import { Validators, FormBuilder, FormGroup } from '@angular/forms';
  import { PouchdbProvider } from '../../providers/pouchdb-provider';
  import { global } from '../../global-variables/variable';
  import { Device } from '@ionic-native/device';
  import { Sim } from '@ionic-native/sim';
  import { File } from '@ionic-native/file';
  import * as FileSaver from 'file-saver';
  import { Printer, PrintOptions } from '@ionic-native/printer';
import { RelationVenteComponent } from '../../components/relation-vente/relation-vente';
  declare var cordova: any;
  
/**
 * Generated class for the GestionVentePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-gestion-vente',
  templateUrl: 'gestion-vente.html',
})
export class GestionVentePage {

    venteForm: FormGroup;
    user: any = global.info_user;
    global:any = global;
    estManager: boolean = false;
    estAnimataire: boolean = false;
    estAdmin: boolean = false;
    ventes: any = [];
    allVentes: any = [];
    //allVentes1: any = [];
    code: any;
    phonenumber: any;
    imei: any;
    aProfile: boolean = false;
    ajoutForm: boolean = false;
    selectedStyle: any = 'liste';
    typeRecherche: any = 'nom_produit';
    rechercher: any = false;
    action: string = 'liste';
    vente: any;
    copieVente: any;
    centres: any = [];
    selectedCentre: any;
    code_centre: string;
    nom_centre: string;
    id_centre: string;
  
    produits: any = [];
    selectedProduit: any;
    varietes: any = [];
    stock: any;
    id_produit_selected: any;
    copie_stock: any;
  
    //depense: number = 0;
  
    id_produit: any;
    nom_produit: any;
    produitsCentre: any = [];
    constructor(public navCtrl: NavController, public events: Events, public popoverController: PopoverController, public actionSheetCtrl: ActionSheetController, public loadinCtl: LoadingController, public viewCtl: ViewController, public menuCtl: MenuController, public alertCtl: AlertController, public sim: Sim, public device: Device, public servicePouchdb: PouchdbProvider, public platform: Platform, public toastCtl: ToastController, public printer: Printer, public file: File, public modelCtl: ModalController, public navParams: NavParams, public formBuilder: FormBuilder) {
      if(navParams.data.id_centre && !navParams.data.id_produit){
        this.id_centre = this.navParams.data.id_centre;
        this.code_centre = this.navParams.data.code_centre;
        this.nom_centre = this.navParams.data.nom_centre;
        this.selectedCentre = this.id_centre;
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
  
    reinitVar(){
      this.selectedCentre = '';
      this.selectedProduit = '';
      this.code = '';
    }
  
    
openRelationVente(ev: any) {
  let popover = this.popoverController.create(RelationVenteComponent);
  popover.present({ev: ev});

  popover.onWillDismiss((res) => {
    if(res == 'Etat du stock'){
      this.etatStock(this.vente.data.id_stock, this.vente.data.nom);
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
              this.editer(this.vente)
            }
          },
          {
            text: 'Etat du stock',
            role: 'destructive',
            icon: 'redo',
            cssClass: 'myActionSheetBtnStyle',
            handler: () => {
              this.etatStock(this.vente.data.id_stock, this.vente.data.nom);
            }
          },
          {
            text: 'Annuler la vente',
            role: 'destructive',
            icon: 'trash',
            cssClass: 'myActionSheetBtnStyle',
            handler: () => {
              this.annulerVente(this.vente);
            }
          },{
            text: 'Supprimer',
            role: 'destructive',
            icon: 'trash',
            cssClass: 'myActionSheetBtnStyle',
            handler: () => {
              this.supprimer(this.vente);
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
  
    etatStock(id_stock, nom_vente){
      let model = this.modelCtl.create('StockPage', {'id_stock': id_stock, 'nom_vente': nom_vente});
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
  

    generateCodeVente(){
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
  
  
  
    membresvente(id_vente, nom_vente, code){
      let model = this.modelCtl.create('MembrePage', {'id_vente': id_vente, "nom_vente": nom_vente, "code": code}, {enableBackdropDismiss: false});
      model.present();
    }
  
    initForm(){
      this.venteForm = null;
      let maDate = new Date();
      let today = this.createDate(maDate.getDate(), maDate.getMonth(), maDate.getFullYear());
  
   
      this.venteForm = this.formBuilder.group({
        //_id:[''],
        type:['vente'],
        code_vente:[],
        date_vente: [today, Validators.required],
        id_produit: [this.id_produit, Validators.required], 
        nom_produit: [''], 
        code_produit: [''], 
        type_produit: [''],
        unite: [''],
        id_centre: [this.id_centre, Validators.required],
        nom_centre: [''],
        code_centre: [''],
        //depense: [0],
        type_client: [''],
        type_marche: [''],
        reduction: [0, Validators.required],
        quantite_vendue: [, Validators.required],
        cout_vente: [0, Validators.required],
        //quantite_gate: [0, Validators.required],
        //quantiteProduite: [0, Validators.required],
        ancien_stock: [0, Validators.required],
        nouveau_stock: [0, Validators.required],
        prix_unitaire: [0, Validators.required],
        
        id_stock: [''],
        today: [today, Validators.required],
        deviceid: [''],
        imei: [''],
        phonenumber: [''],
        start: [maDate.toJSON()],
        end: ['']
      });
      
    }
  
    editForm(vente){
      this.venteForm = null;
      this.venteForm = this.formBuilder.group({
        //_id:[''],
        type:['vente'],
        code_vente:[vente.data.code_vente],
        date_vente: [vente.data.date_vente, Validators.required],
        id_produit: [vente.data.id_produit, Validators.required], 
        nom_produit: [vente.data.nom_produit], 
        code_produit: [vente.data.code_produit], 
        type_produit: [vente.data.type_produit],
        unite: [vente.data.unite],
        id_centre: [vente.data.id_centre, Validators.required],
        nom_centre: [vente.data.nom_centre],
        code_centre: [vente.data.code_centre],
        type_client: [vente.data.type_client],
        type_marche: [vente.data.type_marche],
        reduction: [vente.data.reduction, Validators.required],
        quantite_vendue: [vente.data.quantite_vendue, Validators.required],
        cout_vente: [vente.data.cout_vente, Validators.required],
        //quantiteProduite: [vente.data.quantiteProduite, Validators.required],
        ancien_stock: [vente.data.ancien_stock, Validators.required],
        nouveau_stock: [vente.data.nouveau_stock, Validators.required],
        prix_unitaire: [vente.data.prix_unitaire, Validators.required],
        
        id_stock: [vente.data.id_stock],
        today: [vente.data.today, Validators.required],
      });
  
      this.selectedCentre = vente.data.id_centre;
      this.selectedProduit = vente.data.id_type_produit;
      this.nom_centre = vente.data.nom_centre;
      this.code_centre = vente.data.code_centre;
      this.code = vente.data.code;
      this.getStock(vente.data.id_stock, 'editer');
    }
  
  
    getVariete(){
      let cls: any = [];
      this.servicePouchdb.getDocByType('variete', false).then((v) => {
        this.varietes = v.docs
      });
    }
    
  
    getProduit(id_produit){
      for(let i = 0; i < this.produits.length; i++){
        if(this.produits[i]._id == id_produit){
          this.venteForm.controls.code_produit.setValue(this.produits[i].data.code);
          this.venteForm.controls.nom_produit.setValue(this.produits[i].data.nom);
          this.venteForm.controls.code_centre.setValue(this.produits[i].data.code_centre);
          this.venteForm.controls.nom_centre.setValue(this.produits[i].data.nom_centre);
          //this.venteForm.controls.id_centre.setValue(this.produits[i].data.id_centre);
          this.venteForm.controls.unite.setValue(this.produits[i].data.unite);
          this.venteForm.controls.type_produit.setValue(this.produits[i].data.nom_type_produit);
          this.venteForm.controls.prix_unitaire.setValue(this.produits[i].data.prix_unitaire);
          this.venteForm.controls.id_stock.setValue(this.produits[i].data.id_stock);
          this.getStock(this.produits[i].data.id_stock)
          this.getCoutVente();
          this.getCoutVenteReduction();
          //this.getVariete();
          //this.getDepense();
          //this.getQuantiteReelle();
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
        this.venteForm.controls.ancien_stock.setValue(s.data.quantite_disponible);
      })
    }
  
    /*getCoutM(cout){
      this.depense += parseFloat(cout);
    }
  
    //
    getCoutMP(cout, prix){
      this.depense += cout * prix;
      if(this.venteForm.controls.quantite_vendue.value && this.venteForm.controls.quantite_vendue.value != ''){
        this.getQuantiteReelle();
      }
    }
  */

 getCoutVente(){

  if(this.venteForm.controls.quantite_vendue.value && this.venteForm.controls.quantite_vendue.value != ''){
    if(this.venteForm.controls.ancien_stock.value - this.venteForm.controls.quantite_vendue.value < 0){
      alert('Impossible d\'effectuer cette opération, stock insuffisant!');
      this.venteForm.controls.quantite_vendue.setValue('');
      this.venteForm.controls.nouveau_stock.setValue('');
      this.venteForm.controls.cout_vente.setValue(0);
    }else if(this.venteForm.controls.quantite_vendue.value < 0){
      alert('Impossible d\'effectuer cette opération, la quantité vendue ne peut pas être négative!');
      this.venteForm.controls.quantite_vendue.setValue('');
      this.venteForm.controls.nouveau_stock.setValue('');
      this.venteForm.controls.cout_vente.setValue(0);
    }else{
      this.venteForm.controls.cout_vente.setValue((parseFloat(this.venteForm.controls.quantite_vendue.value) * parseFloat(this.venteForm.controls.prix_unitaire.value)) - parseFloat(this.venteForm.controls.reduction.value));
      this.venteForm.controls.nouveau_stock.setValue(parseFloat(this.venteForm.controls.ancien_stock.value) - parseFloat(this.venteForm.controls.quantite_vendue.value));
    }
  }
  
 }
 
 getCoutVenteReduction(){
   if(this.venteForm.controls.reduction.value && this.venteForm.controls.reduction.value != ''){
    if(this.venteForm.controls.reduction.value < 0){
      alert('Impossible d\'effectuer cette opération, la réduction ne peut pas être négative!');
      this.venteForm.controls.reduction.setValue('');
     }else if((parseFloat(this.venteForm.controls.quantite_vendue.value) * parseFloat(this.venteForm.controls.prix_unitaire.value)) - parseFloat(this.venteForm.controls.reduction.value) < 0){
      alert('Impossible d\'effectuer cette opération, la réduction ne peut pas être suppérieur au coût total de la vente!');
      this.venteForm.controls.reduction.setValue('');
     }else{
      this.venteForm.controls.cout_vente.setValue((parseFloat(this.venteForm.controls.quantite_vendue.value) * parseFloat(this.venteForm.controls.prix_unitaire.value)) - parseFloat(this.venteForm.controls.reduction.value));
     }
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
       // this.ventes = [];
        this.servicePouchdb.getDocByType('vente', false).then((res) => {
          if(res){
            let ventes = res.docs;
            if(this.id_centre && this.id_centre != ""){
              let uns: any= [];
              ventes.forEach((u) => {
                if(u.data.id_produit == this.id_produit_selected && u.data.id_centre && u.data.id_centre == this.id_centre){
                  uns.push(u)
                }
              });
              this.ventes = uns;
              this.allVentes = uns;
              refresher.complete();
            }else{
              let uns: any= [];
              ventes.forEach((u) => {
                if(u.data.id_produit == this.id_produit_selected){
                  uns.push(u)
                }
              });
              this.ventes = uns;
              this.allVentes = uns;
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

    estAnimataireConnecter(user){
      if(user && user.roles){
        this.estAnimataire = global.estAnimataire(user.roles);
      }
    }
  
      typeRechercheChange(){
      this.ventes = this.allVentes;
    }
  
  
    exportExcel(){
  
      let date = new Date();
      //let dateHeure = date.toLocaleDateString()+ date.toLocaleTimeString();// + date.getTime().toLocaleString();
      let nom = date.getDate().toString() +'_'+ (date.getMonth() + 1).toString() +'_'+ date.getFullYear().toString() +'_'+ date.getHours().toString() +'_'+ date.getMinutes().toString() +'_'+ date.getSeconds().toString();
  
      let blob = new Blob([document.getElementById('vente_tableau').innerHTML], {
        //type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
        type: "text/plain;charset=utf-8"
        //type: 'application/vnd.ms-excel;charset=utf-8'
        //type: "application/vnd.ms-excel;charset=utf-8"
      });
  
      if(!this.platform.is('android')){
        FileSaver.saveAs(blob, 'ventes_'+nom+'.xls');
      }else{
  
        let fileDestiny: string = cordova.file.externalRootDirectory;
        this.file.writeFile(fileDestiny, 'ventes_'+nom+'.xls', blob).then(()=> {
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
      let content = document.getElementById('vente_tableau').innerHTML;
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
  
  
    verifierUniqueNon(vente){
  
      let res = 0;//1
      if(this.action == 'ajouter'){
        this.allVentes.forEach((u, index) => {
          if((vente.code == u.data.code) || (vente.nom == u.data.nom && vente.id_centre == u.data.id_centre)){
            res = 0;
          }
        });      
      }else{
        this.allVentes.forEach((u, index) => {
          if((u._id != this.vente._id) && ((vente.code == u.data.code) || (vente.nom == u.data.nom && vente.id_centre == u.data.id_centre))){
            res = 0;
          }
        });      
      }
      
      return res;
    }
  
    validAction(){
      let date = new Date();
      let vente = this.venteForm.value;
      if(this.verifierUniqueNon(vente) != 0/*==*/){
        alert('Le code du vente doit être unique pour tous les centres de trnasformation!\nLe nom du vente doit être unique par centre de transformation!');
      }else{
             
        vente.deviceid = this.device.uuid;
        vente.phonenumber = this.phonenumber;
        vente.imei = this.imei;
  
        if(this.action == 'ajouter'){
          let id = this.generateId();
          vente.end = date.toJSON();
          let d = new Date(vente.date_vente)
          vente.code_vente = d.getFullYear()+'-'+this.generateCodeVente();
          let venteFinal: any = {};
          venteFinal._id =  'vente:'+id;
          
          venteFinal.data = vente
          this.servicePouchdb.createDocReturn(venteFinal).then((res) => {
            venteFinal._rev = res.rev;
            let u: any = {}
            u = venteFinal;
  
            //metre à jour le stock
            //this.stock.data.quantite_vendue += venteFinal.data.quantite_vendue;
            //this.stock.data.quantite_gate += venteFinal.data.quantite_gate;
            this.stock.data.quantite_disponible -= parseFloat(venteFinal.data.quantite_vendue);
            this.servicePouchdb.updateDoc(this.stock)
            //fin mise à jour stock
            
            this.ventes.push(u)
            this.allVentes = this.ventes;
            //this.allVentes1.push(u)
            this.action = 'liste';
            //this.ressetChampsForm();
            let toast = this.toastCtl.create({
              message: 'vente bien enregistré!',
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
  
          this.vente.data.date_vente = vente.date_vente;
          this.vente.data.id_produit = vente.id_produit; 
          this.vente.data.nom_produit = vente.nom_produit; 
          this.vente.data.code_produit = vente.code_produit; 
          this.vente.data.type_produit = vente.type_produit;
          
          this.vente.data.unite = vente.unite;
          this.vente.data.id_centre = vente.id_centre;
          this.vente.data.nom_centre = vente.nom_centre;
          this.vente.data.code_centre = vente.code_centre;
          this.vente.data.type_client = vente.type_client;
          this.vente.data.type_marche = vente.type_marche;
          this.vente.data.reduction = vente.reduction;
          
          this.vente.data.quantite_vendue = vente.quantite_vendue;
          this.vente.data.cout_vente = vente.cout_vente;
          //this.vente.data.quantiteProduite = vente.quantiteProduite;
          this.vente.data.ancien_stock = vente.ancien_stock;
          this.vente.data.nouveau_stock = vente.nouveau_stock;
          this.vente.data.prix_unitaire = vente.prix_unitaire;
          
          this.vente.data.id_stock = vente.id_stock;
  
          this.vente.data.update_deviceid = this.device.uuid;
          this.vente.data.update_phonenumber = this.phonenumber;
          this.vente.data.update_imei = this.imei;


          //metre à jour le stock
            //en cas de changement de produit
            if(this.vente.data.id_stock != this.copie_stock._id){
              //restituer l'ancienne vente
              //this.copie_stock.data.quantite_vendue -= this.copieVente.data.quantite_vendue;
              //this.copie_stock.data.quantite_gate -= this.copieVente.data.quantite_gate;
              this.copie_stock.data.quantite_disponible += parseFloat(this.copieVente.data.quantite_vendue);
              this.servicePouchdb.updateDoc(this.copie_stock);
  
              //mise à jour nouveau stock
              //this.stock.data.quantite_vendue += this.vente.data.quantite_vendue;
              //this.stock.data.quantite_gate += this.vente.data.quantite_gate;
              this.vente.data.ancien_stock = this.stock.data.quantite_disponible;
              this.stock.data.quantite_disponible -= parseFloat(this.vente.data.quantite_vendue);
              this.vente.data.nouveau_stock = this.stock.data.quantite_disponible;
              //this.servicePouchdb.updateDoc(this.stock);
            }else{
              //mise à jour du stocke
              //this.stock.data.quantite_vendue += (this.vente.data.quantite_vendue - this.copieVente.data.quantite_vendue);
              //this.stock.data.quantite_gate += (this.vente.data.quantite_gate - this.copieVente.data.quantite_gate);
              this.vente.data.ancien_stock = this.stock.data.quantite_disponible;
              this.stock.data.quantite_disponible -= parseFloat(this.vente.data.quantite_vendue) - parseFloat(this.copieVente.data.quantite_vendue);
              this.vente.data.nouveau_stock = this.stock.data.quantite_disponible;
             // this.servicePouchdb.updateDoc(this.stock);
            }
            //fin mise à jour stock
            
  
          this.servicePouchdb.updateDocReturn(this.vente).then((res) => {
            this.vente._rev = res.rev;
            //metre à jour le stock
            //en cas de changement de produit
            if(this.vente.data.id_stock != this.copie_stock._id){
              //restituer l'ancienne vente
              //this.copie_stock.data.quantite_vendue -= this.copieVente.data.quantite_vendue;
              //this.copie_stock.data.quantite_gate -= this.copieVente.data.quantite_gate;
              
              
              
              //this.copie_stock.data.quantite_disponible += parseFloat(this.copieVente.data.quantite_vendue);
              this.servicePouchdb.updateDoc(this.copie_stock);
  
              //mise à jour nouveau stock
              //this.stock.data.quantite_vendue += this.vente.data.quantite_vendue;
              //this.stock.data.quantite_gate += this.vente.data.quantite_gate;
              
              
              //this.stock.data.quantite_disponible -= parseFloat(this.vente.data.quantite_vendue);
              this.servicePouchdb.updateDoc(this.stock);
            }else{
              //mise à jour du stocke
              //this.stock.data.quantite_vendue += (this.vente.data.quantite_vendue - this.copieVente.data.quantite_vendue);
              //this.stock.data.quantite_gate += (this.vente.data.quantite_gate - this.copieVente.data.quantite_gate);
              
              
              
              ///this.stock.data.quantite_disponible -= parseFloat(this.vente.data.quantite_vendue) - parseFloat(this.copieVente.data.quantite_vendue);
              this.servicePouchdb.updateDoc(this.stock);
            }
            //fin mise à jour stock
            
            //this.vente = this.grandevente
            let toast = this.toastCtl.create({
              message: 'vente bien sauvegardée!',
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
  
    
    getAllVentes(id_produit_selected){
      
      //this.rechercher = true;
       // this.ventes = [];
        this.servicePouchdb.getDocByType('vente', false).then((res) => {
          if(res){
            let ventes = res.docs;
            if(this.id_centre && this.id_centre != ""){
              let uns: any= [];
              ventes.forEach((u) => {
                if(u.data.id_produit == id_produit_selected && u.data.id_centre && u.data.id_centre == this.id_centre){
                  uns.push(u)
                }
              });
              this.ventes = uns;
              this.allVentes = uns;
              this.rechercher = false;
            }else{
              let uns: any= [];
              ventes.forEach((u) => {
                if(u.data.id_produit == id_produit_selected){
                  uns.push(u)
                }
              });
              this.ventes = uns;
              this.allVentes = uns;
              this.rechercher = false;
            }
            
            //this.allVentes1 = ventes;
           
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
      this.getProduitsByCentre(id_centre);
    }
  
    getAllProduits(){
      this.rechercher = true;
       // this.ventes = [];
      this.servicePouchdb.getDocByType('produit', false).then((res) => {
        if(res){
          let produits = res.docs;
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
              this.getAllVentes(this.id_produit_selected);
            }else{
              this.rechercher = false;
        // this.ventes = [];
            }
          }else{
            this.produits = produits;
            if(this.produits.length > 0){
              this.id_produit_selected = this.produits[0]._id;
              this.getAllVentes(this.id_produit_selected);
            }else{
              this.rechercher = false;
        // this.ventes = [];
            }
          }
          
        }
      }).catch((err) => {
        this.rechercher = false;
       // this.ventes = [];
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
      //this.getAllVentes();
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
      //this.getAllCentre();
      if(this.id_centre && this.id_centre != ''){
        this.getProduitsByCentre(this.id_centre);
      }
      //this.getAllProduits();
      this.code = this.generateCode();
      /*if(this.id_produit && this.id_produit != ''){
        this.getProduit(this.id_produit);
        this.venteForm.controls.id_produit.setValue(this.id_produit);
      }*/
        //this.navCtrl.push('AjouterventePage', {'confLocaliteEnquete': confLocaliteEnquete});    
    }
  
    editer(vente){
      this.editForm(vente);
      this.getAllCentre();
      //this.getAllProduits();
      this.getInfoSimEmei();
      this.action = 'modifier';
      this.getProduitsByCentre(vente.data.id_centre);
      this.copieVente = this.clone(vente);
        //this.navCtrl.push('AjouterventePage', {'confLocaliteEnquete': confLocaliteEnquete});    
    }
  
    modifier(){
      this.getInfoSimEmei();
      this.action = 'modifier';
      //this.navCtrl.push('AjouterventePage', {'confLocaliteEnquete': confLocaliteEnquete});    
    }
  
    detail(vente){
      this.vente = vente;
      this.action = 'detail';
      //this.navCtrl.push('DetailventePage', {'vente': vente, 'selectedSource': selectedSource});
    }
  
    getItems(ev: any) {
      // Reset items back to all of the items
      this.ventes = this.allVentes;
  
      // set val to the value of the searchbar
      let val = ev.target.value;
  
      // if the value is an empty string don't filter the items
      if (val && val.trim() != '') {
        this.ventes = this.ventes.filter((item) => {
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
          /*
          if(this.typeRecherche === 'nom'){
            return (item.data.nom.toLowerCase().indexOf(val.toLowerCase()) > -1);
          }else if(this.typeRecherche === 'code'){
            return (item.data.code.toLowerCase().indexOf(val.toLowerCase()) > -1);
          }else if(this.typeRecherche === 'produit'){
             return (item.data.nom_type_produit.toLowerCase().indexOf(val.toLowerCase()) > -1);
          }if(this.typeRecherche === 'centre'){
            return (item.data.nom_centre.toLowerCase().indexOf(val.toLowerCase()) > -1);
          }*/
  
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
  
    
  supprimer(vente){
    let e: any = {};
    let alert = this.alertCtl.create({
      title: 'Suppression vente',
      message: 'Etes vous sûr de vouloir supprimer cette vente ?',
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
              //this.servicePouchdb.getDocById(vente.data.id_stock).then((stock) => {
                //vérifier si le stock disponbile est supérieur la la quantité produite (vente à supprimer)
                //if(stock.data.quantite_disponible - vente.data.quantiteProduite >= 0){
                  //stock.data.quantite_vendue -= vente.data.quantite_vendue;
                  //stock.data.quantite_gate -= vente.data.quantite_gate;
                  //stock.data.quantite_disponible += vente.data.quantite_vendue;
  
                  //supprimer la vente
                  this.servicePouchdb.deleteReturn(vente).then((res) => {
                    //mettre le stock à jour
                    //this.servicePouchdb.updateDoc(stock);
                    //let e: any = {};
                    //e = essai;
                    this.ventes.forEach((es, i) => {
                      if(es._id === vente._id){
                        this.ventes.splice(i, 1);
                      }
                      
                    });
        
                    this.action = 'liste';
                    //this.navCtrl.pop();
                  }, err => {
                    console.log(err)
                  }) ;
  
               /* }else{
                  let toast = this.toastCtl.create({
                    message:'Impossible de supprimer la vente\nStock du produit disponible insuffisant',
                    position: 'top',
                    duration: 3000
                  });
      
                  toast.present();
                }*/
             // })
            }else{
  
              //this.servicePouchdb.getDocById(vente.data.id_stock).then((stock) => {
                //vérifier si le stock disponbile est supérieur la la quantité produite (vente à supprimer)
                //if(stock.data.quantite_disponible - vente.data.quantiteProduite >= 0){
                  //stock.data.quantite_vendue -= vente.data.quantite_vendue;
                  //stock.data.quantite_gate -= vente.data.quantite_gate;
                  //stock.data.quantite_disponible += vente.data.quantite_vendue;
  
                  //supprimer la vente
                  this.servicePouchdb.deleteDocReturn(vente).then((res) => {
                    //mettre le stock à jour
                    //this.servicePouchdb.updateDoc(stock);
                    //let e: any = {};
                    //e = essai;
                    this.ventes.forEach((es, i) => {
                      if(es._id === vente._id){
                        this.ventes.splice(i, 1);
                      }
                      
                    });
        
                    this.action = 'liste';
                    //this.navCtrl.pop();
                  }, err => {
                    console.log(err)
                  }) ;
  
                /*}else{
                  let toast = this.toastCtl.create({
                    message:'Impossible de supprimer la vente\nStock du produit disponible insuffisant',
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
  

  
  annulerVente(vente){
    let e: any = {};
    let alert = this.alertCtl.create({
      title: 'Annulation vente',
      message: 'Etes vous sûr de vouloir anuuler cette vente ?\nCette vente sera supprimer et la quantité vendue sera restorée dans le stock',
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
              this.servicePouchdb.getDocById(vente.data.id_stock).then((stock) => {
                //vérifier si le stock disponbile est supérieur la la quantité produite (vente à supprimer)
                //if(stock.data.quantite_disponible - vente.data.quantiteProduite >= 0){
                  //stock.data.quantite_vendue -= vente.data.quantite_vendue;
                  //stock.data.quantite_gate -= vente.data.quantite_gate;
                  stock.data.quantite_disponible += vente.data.quantite_vendue;
  
                  //supprimer la vente
                  this.servicePouchdb.deleteReturn(vente).then((res) => {
                    //mettre le stock à jour
                    this.servicePouchdb.updateDoc(stock);
                    //let e: any = {};
                    //e = essai;
                    this.ventes.forEach((es, i) => {
                      if(es._id === vente._id){
                        this.ventes.splice(i, 1);
                      }
                      
                    });
        
                    this.action = 'liste';
                    //this.navCtrl.pop();
                  }, err => {
                    console.log(err)
                  }) ;
  
               /* }else{
                  let toast = this.toastCtl.create({
                    message:'Impossible de supprimer la vente\nStock du produit disponible insuffisant',
                    position: 'top',
                    duration: 3000
                  });
      
                  toast.present();
                }*/
              })
            }else{
  
              this.servicePouchdb.getDocById(vente.data.id_stock).then((stock) => {
                //vérifier si le stock disponbile est supérieur la la quantité produite (vente à supprimer)
                //if(stock.data.quantite_disponible - vente.data.quantiteProduite >= 0){
                  //stock.data.quantite_vendue -= vente.data.quantite_vendue;
                  //stock.data.quantite_gate -= vente.data.quantite_gate;
                  stock.data.quantite_disponible += vente.data.quantite_vendue;
  
                  //supprimer la vente
                  this.servicePouchdb.deleteDocReturn(vente).then((res) => {
                    //mettre le stock à jour
                    this.servicePouchdb.updateDoc(stock);
                    //let e: any = {};
                    //e = essai;
                    this.ventes.forEach((es, i) => {
                      if(es._id === vente._id){
                        this.ventes.splice(i, 1);
                      }
                      
                    });
        
                    this.action = 'liste';
                    //this.navCtrl.pop();
                  }, err => {
                    console.log(err)
                  }) ;
  
                /*}else{
                  let toast = this.toastCtl.create({
                    message:'Impossible de supprimer la vente\nStock du produit disponible insuffisant',
                    position: 'top',
                    duration: 3000
                  });
      
                  toast.present();
                }*/
              })
            }
            
          }
        }
      ]
    });
  
    alert.present();
  }
  
  
  /*
    supprimer(vente){
      let alert = this.alertCtl.create({
        title: 'Suppression vente',
        message: 'Etes vous sûr de vouloir supprimer ce vente ?',
        buttons:[
          {
            text: 'Annuler',
            handler: () => console.log('suppression annulée')
   
          },
          {
            text: 'Confirmer',
            handler: () => {
              this.servicePouchdb.deleteDoc(vente);
              let toast = this.toastCtl.create({
                message:'vente bien suppriée',
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
  