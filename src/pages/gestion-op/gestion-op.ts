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
import { RelationOpComponent } from '../../components/relation-op/relation-op';
declare var cordova: any;
/**
 * Generated class for the GestionOpPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
 
@IonicPage()
@Component({
  selector: 'page-gestion-op',
  templateUrl: 'gestion-op.html',
})
export class GestionOpPage {

  opForm: any;
  user: any = global.info_user;
  global:any = global;
  estManager: boolean = false;
  estAdmin: boolean = false;
  ops: any = [];
  allOps: any = [];
  //allOps1: any = [];
  code_op: any;
  nom_op: string = '';
  phonenumber: any;
  imei: any;
  pays: any = [];
  autrePays: any = {'id':'AUTRE', 'nom':'Autre'};
  selectedPays: any;
  regions: any = [];
  autreRegion: any = {'id':'AUTRE', 'nom':'Autre'};
  selectedRegion: any;
  departements: any = [];
  autreDepartement: any = {'id':'AUTRE', 'nom':'Autre'};
  selectedDepartement: any;
  communes: any = [];
  autreCommune: any = {'id':'AUTRE', 'nom':'Autre'};
  selectedCommune: any;
  villages: any = [];
  autreVillage: any = {'id':'AUTRE', 'nom':'Autre'};
  nom_autre_village: any = '';
  selectedVillage: any;
  aProfile: boolean = false;
  ajoutForm: boolean = false;
  selectedStyle: any = 'liste';
  typeRecherche: any = 'nom';
  rechercher: any = false;
  action: string = 'liste';
  op: any;
  copieOp: any;
  unions: any = [];
  selectedUnion: any;
  pour_union: string = 'oui';
  code_union: string;
  nom_union: string;
  id_union: string;


  constructor(public navCtrl: NavController, public popoverController: PopoverController, public actionSheetCtrl: ActionSheetController, public loadinCtl: LoadingController, public viewCtl: ViewController, public menuCtl: MenuController, public alertCtl: AlertController, public sim: Sim, public device: Device, public servicePouchdb: PouchdbProvider, public platform: Platform, public toastCtl: ToastController, public printer: Printer, public file: File, public modelCtl: ModalController, public navParams: NavParams, public formBuilder: FormBuilder) {
    if(navParams.data.id_union){
      this.id_union = this.navParams.data.id_union;
      this.code_union = this.navParams.data.code_union;
      this.nom_union = this.navParams.data.nom_union;
      this.selectedUnion = this.id_union;
    }
  }

  reinitVar(){
    this.selectedPays = '';
    this.selectedRegion = '';
    this.selectedDepartement = '';
    this.selectedCommune = '';
    this.selectedVillage = '';
    this.selectedUnion = '';
    this.nom_op = '';
    this.code_op = '';
    this.pour_union = 'oui';
  }


    
  openRelationOP(ev: any) {
    let popover = this.popoverController.create(RelationOpComponent);
    popover.present({ev: ev});
  
    popover.onWillDismiss((res) => {
      if(res == 'Centres de transformation'){
        this.centreop(this.op._id, this.op.data.nom_op, this.op.data.code_op);
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
            this.editer(this.op)
          }
        },{
          text: 'Centres de transformation',
          //role: 'destructive',
          icon: 'redo',
          handler: () => {
            this.centreop(this.op._id, this.op.data.nom_op, this.op.data.code_op);
          }
        },{
          text: 'Supprimer',
          role: 'destructive',
          icon: 'trash',
          cssClass: 'myActionSheetBtnStyle',
          handler: () => {
            this.supprimer(this.op);
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

  centreop(id_op, nom_op, code_op){
    let model = this.modelCtl.create('GestionCentreTransformationPage', {'id_op': id_op, "nom_op": nom_op, "code_op": code_op}, {enableBackdropDismiss: false})
    model.present();
    //this.navCtrl.push('GestionCentreTransformationPage', {'id_op': id_op, "nom_op": nom_op, "code_op": code_op});
  }

  initForm(){
    let maDate = new Date();
    let today = this.createDate(maDate.getDate(), maDate.getMonth(), maDate.getFullYear());


    this.opForm = this.formBuilder.group({
      //_id:[''],
      type:['op'],
      nom_op: ['', Validators.required], 
      code_op: ['', Validators.required], 
      num_aggrement: ['', Validators.required],
      pour_union: ['oui', Validators.required],

      id_federation: [''],
      nom_federation: [''],
      code_federation: [''],

      id_union: [''],
      nom_union: [''],
      code_union: [''],

      pays: ['', Validators.required],
      pays_nom: [''],
      region: ['', Validators.required],
      region_nom: [''],
      departement: [''],
      departement_nom: [''],
      commune: [''],
      commune_nom: [''],
      village: [''],
      village_nom: [''],
      today: [today, Validators.required],
      deviceid: [''],
      imei: [''],
      phonenumber: [''],
      start: [maDate.toJSON()],
      end: ['']
    });
    
  }

  editForm(op){
    this.opForm = null;
    this.opForm = this.formBuilder.group({
      //_id:[''],
      type:['op'],
      nom_op: [op.data.nom_op, Validators.required], 
      code_op: [op.data.code_op, Validators.required], 
      num_aggrement: [op.data.num_aggrement, Validators.required],
      pour_union: [op.data.pour_union, Validators.required],

      id_union: [op.data.id_union],
      nom_union: [op.data.nom_union],
      code_union: [op.data.code_union],

      id_federation: [op.data.id_federation],
      nom_federation: [op.data.nom_federation],
      code_federation: [op.data.code_federation],

      pays: [op.data.pays, Validators.required],
      pays_nom: [op.data.pays_nom],
      region: [op.data.region, Validators.required],
      region_nom: [op.data.region_nom],
      departement: [op.data.departement],
      departement_nom: [op.data.departement_nom],
      commune: [op.data.commune],
      commune_nom: [op.data.commune_nom],
      village: [op.data.village],
      village_nom: [op.data.village_nom],
      today: [op.data.today, Validators.required],
    });

    this.selectedPays = op.data.pays;
    this.selectedRegion = op.data.region
    this.selectedDepartement = op.data.departement;
    this.selectedCommune = op.data.commune;
    this.selectedVillage = op.data.village;
    this.pour_union = op.data.pour_union;
    this.selectedUnion = op.data.id_union;
    this.nom_op = op.data.nom_op;
    this.code_op = op.data.code_op;
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
     // this.ops = [];
      this.servicePouchdb.getPlageDocsRapide('op','op:\uffff').then((ops) => {
        if(ops){
          if(this.id_union && this.id_union != ""){
            let uns: any= [];
            ops.forEach((u) => {
              if(u.doc.data.id_union && u.doc.data.id_union == this.id_union){
                uns.push(u)
              }
            });
            this.ops = uns;
            this.allOps = uns;
            refresher.complete();
          }else{
            this.ops = ops;
            this.allOps = ops;
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
    this.ops = this.allOps;
  }


  exportExcel(){

    let date = new Date();
    //let dateHeure = date.toLocaleDateString()+ date.toLocaleTimeString();// + date.getTime().toLocaleString();
    let nom = date.getDate().toString() +'_'+ (date.getMonth() + 1).toString() +'_'+ date.getFullYear().toString() +'_'+ date.getHours().toString() +'_'+ date.getMinutes().toString() +'_'+ date.getSeconds().toString();

    let blob = new Blob([document.getElementById('op_tableau').innerHTML], {
      //type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
      type: "text/plain;charset=utf-8"
      //type: 'application/vnd.ms-excel;charset=utf-8'
      //type: "application/vnd.ms-excel;charset=utf-8"
    });

    if(!this.platform.is('android')){
      FileSaver.saveAs(blob, 'ops_'+nom+'.xls');
    }else{

      let fileDestiny: string = cordova.file.externalRootDirectory;
      this.file.writeFile(fileDestiny, 'ops_'+nom+'.xls', blob).then(()=> {
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
    let content = document.getElementById('op_tableau').innerHTML;
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

  //fait la conbinaison de caractere de gauche vers la droite en variant la taille a la recherche d'un code disponible
  genererCodeop(){
    if(this.action == 'ajouter'){
      //let taille_nom = this.nom_op.length;
      let exclut: any = [' ', ',', '!', ';','/', '-', '_', '.', '"','\'', 'é', 'ê', 'û', 'ë', 'ü', 'î', 'ï', 'ô', 'ö'];
      let nom = this.nom_op;
      //nom = nom.replace(' ' || '  ' || '    ' || '     ' || '      ' , '')
      //let nom = this.nom_op;
      let nom1: any = '';
      for(let i = 0; i < nom.length; i++){
        //if(nom.charAt(i) !== ' '){
        if(exclut.indexOf(nom.charAt(i)) === -1 ){
          nom1 += nom.charAt(i).toString();
        }
      }
      //let nom1 = nom.replace(/ /g,"");
      nom = nom1;
      let an = nom;
      //nom = nom.replace('  ' || '', '')
      //nom = nom.replace('  ', '')
      let taille_nom = nom.length;
      //taille initiale: deux aractères
      let taille_code = 2;
      let code: string = '';
      let p = 0;
      let last_position = 0;
      let trouve: boolean;
      this.code_op = code.toUpperCase();

      if(taille_nom >= 2){
        while(taille_code <= taille_nom){
          last_position = taille_code - 1;
          trouve  = false;
          code = '';
          
          for(let i = 0; i < taille_code; i++){
              code += nom.charAt(i).toString() ;
          }

          do{
              code = code.substr(0, code.length - 1);
              code += nom.charAt(last_position).toString() ;
              p = 0;
              for(let pos=0; pos < this.allOps.length; pos++){
                let u = this.allOps[pos];
                if(u.doc.data.code_op === code.toUpperCase()){
                  //alert('trouve '+code.toUpperCase())
                  trouve = true;
                  //alert('trouver '+trouve)
                  break ;
                }else{
                  //alert('non trouve '+code.toUpperCase())
                  trouve = false;
                }
              }
                last_position++;
              //}
              

            }while(trouve && last_position < taille_nom);
            //
            if(last_position === taille_nom && trouve){
              //non disponible, augmenter la taille du code
              taille_code++;
              //alert('ici')
              //au cas ou on teste toutes les combinaisons, sant trouver de combinaison disponible, on ajoute des chiffre
              if(taille_code > taille_nom){
                //non disponible, augmenter la taille et utiliser des chiffres
                taille_code = 3;
                nom = an + '123456789'.toString();
                taille_nom = nom.length;
              }
            }else{
                //trouvé
                this.code_op = code.toUpperCase();
                break;
              
            }
        }
        
      }else{
        this.code_op = '';
      }
      
    }
    
  }


  chargerPays(){
    this.servicePouchdb.getDocById('pays').then((results) => {
        this.pays = results.data;
        if(this.user && this.user.roles && global.estManager(this.user.roles)){
          this.pays.push(this.autrePays);
        }
    }).catch((err) => {
      console.log('error pays')
      if(this.user && this.user.roles && global.estManager(this.user.roles)){
        this.pays.push(this.autrePays);
      }
    });
  }

  chargerSousLocalite(localiteID, type){
    if(localiteID !== 'AUTRE'){
      let sous_type = 'village';
      if(type == 'pays'){
       sous_type = 'region';
      }else if(type == 'region'){
       sous_type = 'departement';
      }else if(type == 'departement'){
       sous_type = 'commune';
      }

      //réinitialser les sous localités de la cocalité
      this.reinitSousLocalite(type);

      this.servicePouchdb.getDocById(sous_type).then((results) => {
        //charger les sous localité correpondantes
        results.data.forEach((res, index) => {
          if(type == 'pays' && res.id_pays === localiteID){
              this.regions.push(res);
          }else if(type == 'region' && res.id_region === localiteID){
              this.departements.push(res);
          }else if(type == 'departement' && res.id_departement === localiteID){
              this.communes.push(res);
          }if(type == 'commune' && res.id_commune === localiteID){
              this.villages.push(res);
          }
          
        });

        //ajouter l'option autre pour l'administratuer seul
        if(this.user && this.user.roles && global.estManager(this.user.roles)){
          if(type == 'pays'){
            this.regions.push(this.autreRegion);
          }else if(type == 'region'){
            this.departements.push(this.autreDepartement);
          }else if(type == 'departement'){
            this.communes.push(this.autreCommune);
          }else if(type == 'commune'){
            this.villages.push(this.autreVillage);
          }
        }
        
      }).catch((err) => {
        if(this.user && this.user.roles && global.estManager(this.user.roles)){
          if(type == 'pays'){
            this.regions.push(this.autreRegion);
          }else if(type == 'region'){
            this.departements.push(this.autreDepartement);
          }else if(type == 'departement'){
            this.communes.push(this.autreCommune);
          }else if(type == 'commune'){
            this.villages.push(this.autreVillage);
          }
        }
      });
    }else{
      this.autreLocalite(localiteID, type);
    }
  } 

  autreLocalite(localiteID, type){
    if(localiteID == 'AUTRE'){
         if(type == 'pays'){
        let model = this.modelCtl.create('GestionPaysPage');
        model.present();
        model.onDidDismiss(() => {
          this.selectedPays = '';
          this.chargerPays();
          
        })
      }else if(type == 'region'){
        let model = this.modelCtl.create('GestionRegionPage', {'paysID': this.selectedPays});
        model.present();
        model.onDidDismiss(() => {
          this.selectedRegion = '';
          this.chargerSousLocalite(this.selectedPays, 'pays');
          
        })
      }else if(type == 'departement'){
        let model = this.modelCtl.create('GestionDepartementPage', {'regionID':this.selectedRegion});
        model.present();
        model.onDidDismiss(() => {
          this.selectedDepartement = '';
          this.chargerSousLocalite(this.selectedRegion, 'region');
          
        })
      }else if(type == 'commune'){
        let model = this.modelCtl.create('GestionCommunePage', {'departementID': this.selectedDepartement});
        model.present();
        model.onDidDismiss(() => {
          this.selectedCommune = '';
          this.chargerSousLocalite(this.selectedDepartement, 'departement');
          
        })
      }else if(type == 'village'){
        let model = this.modelCtl.create('GestionVillagePage', {'communeID': this.selectedCommune});
        model.present();
        model.onDidDismiss(() => {
          this.selectedVillage = '';
          this.chargerSousLocalite(this.selectedCommune, 'commune');
          
        })
      }
      
      this.nom_autre_village = '';
    }
  }
  

  reinitSousLocalite(type){
    if(type == 'pays'){
      this.selectedRegion = '';
      this.regions = []
      this.selectedDepartement = '';
      this.departements = []
      this.selectedCommune = '';
      this.communes = []
      this.selectedVillage = '';
      this.villages = []
    } else if(type == 'region'){
      this.selectedDepartement = '';
      this.departements = []
      this.selectedCommune = '';
      this.communes = []
      this.selectedVillage = '';
      this.villages = []
    }else if(type == 'departement'){
      this.selectedCommune = '';
      this.communes = []
      this.selectedVillage = '';
      this.villages = []
    }else if(type == 'commune'){
      this.selectedVillage = '';
      this.villages = []
    }
  }

  verifierUniqueNon(op){

    let res = 1;
    if(this.action == 'ajouter'){
      if((op.pour_union == 'oui' && !op.id_union) || (op.pour_union == 'oui' && op.id_union == '')){
        res = 2;
      }else{
        this.allOps.forEach((u, index) => {
          if(/*(op.nom_op === u.data.nom_op) || */(op.num_aggrement === u.doc.data.num_aggrement)){
            res = 0;
          }
        });
      }
      
    }else{
      if((op.pour_union == 'oui' && !op.id_union) || (op.pour_union == 'oui' && op.id_union == '')){
        res = 2;
      }else{
        this.allOps.forEach((u, index) => {
          if((u.doc._id !== this.op._id) && (/*(op.nom_op === u.data.nom_op) || */(op.num_aggrement === u.doc.data.num_aggrement))){
            res = 0;
          }
        });
      }
      
    }
    
    return res;
  }

  generateId(){
    var numbers='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    var randomArray=[]
    for(let i=0;i<24;i++){
      var rand = Math.floor(Math.random()*62)
      randomArray.push(numbers[rand])
    }
    
    var randomString=randomArray.join("");
    var Id= /*+pays+'-'+region+'-'+department+'-'+commune +'-' +village+ */''+randomString 
    return Id;
  }

  validAction(){
    let date = new Date();
    let op = this.opForm.value;

    if(this.verifierUniqueNon(op) === 0){
      alert('Le numéro d\'aggrement doit être unique!');
    }else if(this.verifierUniqueNon(op) === 2){
      alert('l\'union est obligatoir!');
    }{
      //op.pays = this.selectedPays;
      for(let i = 0; i < this.pays.length; i++){
        if(this.pays[i].id == this.selectedPays){
          op.pays_nom = this.pays[i].nom;
          break;
        }
      }
      
      //op.region = this.selectedRegion.id;
      for(let i = 0; i < this.regions.length; i++){
        if(this.regions[i].id == this.selectedRegion){
          op.region_nom = this.regions[i].nom;
          break;
        }
      }
      //op.departement = this.selectedDepartement.id;
      for(let i = 0; i < this.departements.length; i++){
        if(this.departements[i].id == this.selectedDepartement){
          op.departement_nom = this.departements[i].nom;
          break;
        }
      }
      //op.commune = this.selectedCommune.id;
      for(let i = 0; i < this.communes.length; i++){
        if(this.communes[i].id == this.selectedCommune){
          op.commune_nom = this.communes[i].nom;
          break;
        }
      }
      //op.village = this.selectedVillage.id;
      for(let i = 0; i < this.villages.length; i++){
        if(this.villages[i].id == this.selectedVillage){
          op.village_nom = this.villages[i].nom;
          break;
        }
      }

      if(op.pour_union == 'oui'){
        for(let i = 0; i < this.unions.length; i++){
          if(this.unions[i].doc._id == this.selectedUnion){
            op.nom_union = this.unions[i].doc.data.nom_union;
            op.code_union = this.unions[i].doc.data.code_union;
            op.id_federation = this.unions[i].doc.data.id_federation;
            op.nom_federation = this.unions[i].doc.data.nom_federation;
            op.code_federation = this.unions[i].doc.data.code_federation;
          }
        }
      }else{
        op.id_union = null;
        op.nom_union = null;
        op.code_union = null;
        op.id_federation = null;
        op.nom_federation = null;
        op.code_federation = null;
      }
      op.deviceid = this.device.uuid;
      op.phonenumber = this.phonenumber;
      op.imei = this.imei;

      if(this.action == 'ajouter'){
        let id = 'op:'+this.generateId();
        op.end = date.toJSON();

        let opFinal: any = {};
        opFinal._id =  id;
        opFinal.data = op
        this.servicePouchdb.createDocReturn(opFinal).then((res) => {
          opFinal._rev = res.rev;
          let u: any = {}
          u.doc = opFinal;
          this.ops.push(u)
          this.allOps = this.ops;
          //this.allOps1.push(u)
          this.action = 'liste';
          //this.ressetChampsForm();
          let toast = this.toastCtl.create({
            message: 'op bien enregistré!',
            position: 'top',
            duration: 1000
          });
          toast.present();

          this.unions = [];
          this.reinitVar()
        /*let E: any = this.essais;
        E = E.concat(essais);
         
        this.essais = E;
        this.allEssais = this.essais;*/
          
      }).catch((err) => alert('une erreur est survenue lors de l\'enregistrement: '+err) );
    
      }else{


        this.op.data.nom_op = op.nom_op;
        this.op.data.code_op = op.code_op;
        this.op.data.num_aggrement = op.num_aggrement;
        this.op.data.pour_union = op.pour_union;
        this.op.data.id_union = op.id_union;
        this.op.data.nom_union = op.nom_union;
        this.op.data.code_union = op.code_union;
        this.op.data.id_federation = op.id_federation;
        this.op.data.nom_federation = op.nom_federation;
        this.op.data.code_federation = op.code_federation;
        this.op.data.pays = op.pays;
        this.op.data.pays_nom = op.pays_nom;
        this.op.data.region = op.region;
        this.op.data.region_nom = op.region_nom;
        this.op.data.departement = op.departement;
        this.op.data.departement_nom = op.departement_nom;
        this.op.data.commune = op.commune;
        this.op.data.commune_nom = op.commune_nom;
        this.op.data.village = op.village;
        this.op.data.village_nom = op.village_nom;
        this.op.data.update_deviceid = this.device.uuid;
        this.op.data.update_phonenumber = this.phonenumber;
        this.op.data.update_imei = this.imei;

        //this.op
        this.servicePouchdb.updateDocReturn(this.op).then((res) => {
          this.op._rev = res.rev;
          //this.op = this.grandeop

          if(this.op.data.code_op !== this.copieOp.data.code_op || this.op.data.nom_op !== this.copieOp.data.nom_op){
            this.updateCentreAssocies(this.op);
          }

          let toast = this.toastCtl.create({
            message: 'OP bien sauvegardée!',
            position: 'top',
            duration: 1000
          });
          this.action  = 'detail';
          toast.present();
          this.unions = [];
          this.reinitVar()
      
      });

    }
  }
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



updateCentreAssocies(op) {
  /*let loadin = this.loadinCtl.create({
    content: 'Modification des centre associés en cours....'
  });

  loadin.present();*/
  //modification du code op dans centre
  this.servicePouchdb.getPlageDocsRapide('centre','centre:\uffff').then((centres) => {
    centres.forEach((c) => {
        //return this.getPhoto(membre)
        if( c.doc.data.niveau_centre != 'Indépendant' && c.doc.data.id_op === op._id){
            c.doc.data.nom_op = op.data.nom_op;
            c.doc.data.code_op = op.data.code_op;

            c.doc.data.id_federation = op.data.id_federation;
            c.doc.data.nom_federation = op.data.nom_federation;
            c.doc.data.code_federation = op.data.code_federation;
            c.doc.data.id_union = op.data.id_union;
            c.doc.data.nom_union = op.data.nom_union;
            c.doc.data.code_union = op.data.code_union;

            this.servicePouchdb.updateDoc(c.doc);

          }
      });
      /*loadin.dismiss();
      let toast = this.toastCtl.create({
        message: 'op bien sauvegardée!',
        position: 'top',
        duration: 1000
      });

      this.action  = 'detail';
      toast.present();*/
  }).catch((err) => {
    console.log(err)
  })
  
        
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

  
  getallOps(){
    
    this.rechercher = true;
     // this.ops = [];
      this.servicePouchdb.getPlageDocsRapide('op','op:\uffff').then((ops) => {
        if(ops){
          if(this.id_union && this.id_union != ""){
            let uns: any= [];
            ops.forEach((u) => {
              if(u.doc.data.id_union && u.doc.data.id_union == this.id_union){
                uns.push(u)
              }
            });
            this.ops = uns;
            this.allOps = uns;
            this.rechercher = false;
          }else{
            this.ops = ops;
            this.allOps = ops;
            this.rechercher = false;
          }
          
          //this.allOps1 = ops;
         
        }
      }).catch((err) => {
        console.log(err)
        this.rechercher = false;
      }); 
  }

  pourop(pour_op){
    if(pour_op == 'oui'/* && this.unions.length < 0*/){
      this.getAllUnion();
    }
  }

  getAllUnion(){
      this.servicePouchdb.getPlageDocsRapide('union','union:\uffff').then((unions) => {
        if(unions){
          this.unions = unions;
        }
      }).catch((err) => console.log(err)); 
  }


  ionViewDidEnter() {
    this.getallOps();
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
    this.chargerPays();
    this.initForm();
    this.getInfoSimEmei();
    this.action = 'ajouter';
    this.getAllUnion();
      //this.navCtrl.push('AjouteropPage', {'confLocaliteEnquete': confLocaliteEnquete});    
  }

  editer(op, dbclick: boolean = false){
    if(!dbclick || (dbclick && this.user && this.user.roles && global.estManager(this.user.roles))){        
      this.chargerPays();
      this.chargerSousLocalite(op.data.pays, 'pays')
      this.chargerSousLocalite(op.data.region, 'region')
      this.chargerSousLocalite(op.data.departement, 'departement')
      this.chargerSousLocalite(op.data.commune, 'commune')
      this.editForm(op);
      if(op.data.pour_union == 'oui'/* && this.unions.length < 0*/){
        this.getAllUnion();
      }
      this.getInfoSimEmei();
      this.action = 'modifier';
      this.copieOp = this.clone(op);
        
    }//this.navCtrl.push('AjouteropPage', {'confLocaliteEnquete': confLocaliteEnquete});    
  }

  modifier(){
    this.getInfoSimEmei();
    this.action = 'modifier';
    //this.navCtrl.push('AjouteropPage', {'confLocaliteEnquete': confLocaliteEnquete});    
  }

  detail(op){
    this.op = op;
    this.action = 'detail';
    //this.navCtrl.push('DetailopPage', {'op': op, 'selectedSource': selectedSource});
  }

  getItems(ev: any) {
    // Reset items back to all of the items
    this.ops = this.allOps;

    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.ops = this.ops.filter((item) => {
        if(this.typeRecherche === 'nom'){
          return (item.doc.data.nom_op.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }else if(this.typeRecherche === 'code'){
          return (item.doc.data.code_op.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }else if(this.typeRecherche === 'aggrement'){
           return (item.doc.data.num_aggrement.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }if(this.typeRecherche === 'site'){
          if(item.doc.data.commune_nom){
            return (item.doc.data.commune_nom.toLowerCase().indexOf(val.toLowerCase()) > -1);
          }
        }if(this.typeRecherche === 'village'){
          if(item.doc.data.village_nom){
            return (item.doc.data.village_nom.toLowerCase().indexOf(val.toLowerCase()) > -1);
          }
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


  
  supprimer(op){
    let e: any = {};
    let alert = this.alertCtl.create({
      title: 'Suppression op',
      message: 'Etes vous sûr de vouloir supprimer cette op ?',
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
              this.servicePouchdb.deleteReturn(op).then((res) => {
                //let e: any = {};
                //e.doc = essai;
                this.ops.forEach((es, i) => {
                  if(es.doc._id === op._id){
                    this.ops.splice(i, 1);
                  }
                  
                });
    
                this.action = 'liste';
                //this.navCtrl.pop();
              }, err => {
                console.log(err)
              }) ;
            }else{
              this.servicePouchdb.deleteDocReturn(op).then((res) => {
                //let e: any = {};
                //e.doc = essai;
                this.ops.forEach((es, i) => {
                  if(es.doc._id === op._id){
                    this.ops.splice(i, 1);
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
  supprimer(op){
    let alert = this.alertCtl.create({
      title: 'Suppression op',
      message: 'Etes vous sûr de vouloir supprimer cette op ?',
      buttons:[
        {
          text: 'Annuler',
          handler: () => console.log('suppression annulée')
 
        },
        {
          text: 'Confirmer',
          handler: () => {
            this.servicePouchdb.deleteDoc(op);
            let toast = this.toastCtl.create({
              message:'op bien suppriée',
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
