import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ActionSheetController, ViewController, MenuController, AlertController, ToastController, ModalController, Platform } from 'ionic-angular';
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
 * Generated class for the GestionFederationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-gestion-federation',
  templateUrl: 'gestion-federation.html',
})
export class GestionFederationPage {

  federationForm: any;
  user: any = global.info_user;
  global:any = global;
  estManger: boolean = false;
  estAdmin: boolean = false;
  federations: any = [];
  allFederations: any = [];
  //allFederations1: any = [];
  code_federation: any;
  nom_federation: string = '';
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
  federation: any;
  copiefederation: any;


  constructor(public navCtrl: NavController, public actionSheetCtrl: ActionSheetController, public loadinCtl: LoadingController, public viewCtl: ViewController, public menuCtl: MenuController, public alertCtl: AlertController, public sim: Sim, public device: Device, public servicePouchdb: PouchdbProvider, public platform: Platform, public toastCtl: ToastController, public printer: Printer, public file: File, public modelCtl: ModalController, public navParams: NavParams, public formBuilder: FormBuilder) {
    
  }

  reinitVar(){
    this.selectedPays = '';
    this.selectedRegion = '';
    this.selectedDepartement = '';
    this.selectedCommune = '';
    this.selectedVillage = '';
    this.nom_federation = '';
    this.code_federation = '';
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
            this.editer(this.federation)
          }
        },{
          text: 'Unions',
          //role: 'destructive',
          icon: 'redo',
          handler: () => {
            this.unionFederation(this.federation._id, this.federation.data.nom_federation, this.federation.data.code_federation);
          }
        },{
          text: 'Supprimer',
          role: 'destructive',
          icon: 'trash',
          cssClass: 'myActionSheetBtnStyle',
          handler: () => {
            this.supprimer(this.federation);
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


  initForm(){
    let maDate = new Date();
    let today = this.createDate(maDate.getDate(), maDate.getMonth(), maDate.getFullYear());


    this.federationForm = this.formBuilder.group({
      //_id:[''],
      type:['federation'],
      nom_federation: ['', Validators.required], 
      code_federation: ['', Validators.required], 
      num_aggrement: ['', Validators.required],
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

  editForm(federation){
    this.federationForm = null;
    this.federationForm = this.formBuilder.group({
      //_id:[''],
      type:['federation'],
      nom_federation: [federation.data.nom_federation, Validators.required], 
      code_federation: [federation.data.code_federation, Validators.required], 
      num_aggrement: [federation.data.num_aggrement, Validators.required],
      pays: [federation.data.pays, Validators.required],
      pays_nom: [federation.data.pays_nom],
      region: [federation.data.region, Validators.required],
      region_nom: [federation.data.region_nom],
      departement: [federation.data.departement],
      departement_nom: [federation.data.departement_nom],
      commune: [federation.data.commune],
      commune_nom: [federation.data.commune_nom],
      village: [federation.data.village],
      village_nom: [federation.data.village_nom],
      today: [federation.data.today, Validators.required],
    });

    this.selectedPays = federation.data.pays;
    this.selectedRegion = federation.data.region
    this.selectedDepartement = federation.data.departement;
    this.selectedCommune = federation.data.commune;
    this.selectedVillage = federation.data.village;
    this.nom_federation = federation.data.nom_federation;
    this.code_federation = federation.data.code_federation;

    
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
     // this.federations = [];
      this.servicePouchdb.getPlageDocsRapide('federation','federation:\uffff').then((federations) => {
        if(federations){
          this.federations = federations;
          this.allFederations = federations;
          refresher.complete();
        }
      }).catch((err) => refresher.complete());
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
    this.federations = this.allFederations;
  }


  exportExcel(){

    let date = new Date();
    //let dateHeure = date.toLocaleDateString()+ date.toLocaleTimeString();// + date.getTime().toLocaleString();
    let nom = date.getDate().toString() +'_'+ (date.getMonth() + 1).toString() +'_'+ date.getFullYear().toString() +'_'+ date.getHours().toString() +'_'+ date.getMinutes().toString() +'_'+ date.getSeconds().toString();

    let blob = new Blob([document.getElementById('federation_tableau').innerHTML], {
      //type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
      type: "text/plain;charset=utf-8"
      //type: 'application/vnd.ms-excel;charset=utf-8'
      //type: "application/vnd.ms-excel;charset=utf-8"
    });

    if(!this.platform.is('android')){
      FileSaver.saveAs(blob, 'federations_'+nom+'.xls');
    }else{

      let fileDestiny: string = cordova.file.externalRootDirectory;
      this.file.writeFile(fileDestiny, 'federations_'+nom+'.xls', blob).then(()=> {
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
    let content = document.getElementById('federation_tableau').innerHTML;
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
  genererCodefederation(){
    if(this.action == 'ajouter'){
      //let taille_nom = this.nom_federation.length;
      let exclut: any = [' ', ',', '!', ';','/', '-', '_', '.', '"','\'', 'é', 'ê', 'û', 'ë', 'ü', 'î', 'ï', 'ô', 'ö'];
      let nom = this.nom_federation;
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
      this.code_federation = code.toUpperCase();

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
              for(let pos=0; pos < this.allFederations.length; pos++){
                let u = this.allFederations[pos];
                if(u.doc.data.code_federation === code.toUpperCase()){
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
                this.code_federation = code.toUpperCase();
                break;
              
            }
        }
        
      }else{
        this.code_federation = '';
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

  verifierUniqueNon(federation){

    let res = 1;
    if(this.action == 'ajouter'){
      this.allFederations.forEach((u, index) => {
        if(/*(federation.nom_federation === u.data.nom_federation) || */(federation.num_aggrement === u.doc.data.num_aggrement)){
          res = 0;
        }
      });
    }else{
      this.allFederations.forEach((u, index) => {
        if((u.doc._id !== this.federation._id) && (/*(federation.nom_federation === u.data.nom_federation) || */(federation.num_aggrement === u.doc.data.num_aggrement))){
          res = 0;
        }
      });
    }
    
    return res;
  }

  validAction(){
    let date = new Date();
    let federation = this.federationForm.value;

    if(this.verifierUniqueNon(federation) === 0){
      alert('Le numéro d\'aggrement doit être unique!');
    }else{
      //federation.pays = this.selectedPays;
      for(let i = 0; i < this.pays.length; i++){
        if(this.pays[i].id == this.selectedPays){
          federation.pays_nom = this.pays[i].nom;
          break;
        }
      }
      
      //federation.region = this.selectedRegion.id;
      for(let i = 0; i < this.regions.length; i++){
        if(this.regions[i].id == this.selectedRegion){
          federation.region_nom = this.regions[i].nom;
          break;
        }
      }
      //federation.departement = this.selectedDepartement.id;
      if(this.selectedDepartement && this.selectedDepartement != ''){
        for(let i = 0; i < this.departements.length; i++){
          if(this.departements[i].id == this.selectedDepartement){
            federation.departement_nom = this.departements[i].nom;
            break;
          }
        }
      }
      //federation.commune = this.selectedCommune.id;
      if(this.selectedCommune && this.selectedCommune != ''){
        for(let i = 0; i < this.communes.length; i++){
          if(this.communes[i].id == this.selectedCommune){
            federation.commune_nom = this.communes[i].nom;
            break;
          }
        }
      }
      //federation.village = this.selectedVillage.id;
      if(this.selectedVillage && this.selectedVillage != ''){
        for(let i = 0; i < this.villages.length; i++){
          if(this.villages[i].id == this.selectedVillage){
            federation.village_nom = this.villages[i].nom;
            break;
          }
        }
      }
       
      federation.deviceid = this.device.uuid;
      federation.phonenumber = this.phonenumber;
      federation.imei = this.imei;

      if(this.action == 'ajouter'){
        let id = this.servicePouchdb.generateId('federation', federation.pays, federation.region);
        federation.end = date.toJSON();

        let federationFinal: any = {};
        federationFinal._id =  id;
        federationFinal.data = federation
        this.servicePouchdb.createDocReturn(federationFinal).then((res) => {
          federationFinal._rev = res.rev;
          let u: any = {}
          u.doc = federationFinal;
          this.federations.push(u)
          this.allFederations = this.federations;
          //this.allFederations1.push(u)
          this.action = 'liste';
          //this.ressetChampsForm();
          let toast = this.toastCtl.create({
            message: 'federation bien enregistré!',
            position: 'top',
            duration: 1000
          });
          toast.present();

          this.reinitVar()
        /*let E: any = this.essais;
        E = E.concat(essais);
         
        this.essais = E;
        this.allEssais = this.essais;*/
          
      }).catch((err) => alert('une erreur est survenue lors de l\'enregistrement: '+err) );
    
      }else{


        this.federation.data.nom_federation = federation.nom_federation;
        this.federation.data.code_federation = federation.code_federation;
        this.federation.data.num_aggrement = federation.num_aggrement;
        this.federation.data.pays = federation.pays;
        this.federation.data.pays_nom = federation.pays_nom;
        this.federation.data.region = federation.region;
        this.federation.data.region_nom = federation.region_nom;
        this.federation.data.departement = federation.departement;
        this.federation.data.departement_nom = federation.departement_nom;
        this.federation.data.commune = federation.commune;
        this.federation.data.commune_nom = federation.commune_nom;
        this.federation.data.village = federation.village;
        this.federation.data.village_nom = federation.village_nom;
        this.federation.data.update_deviceid = this.device.uuid;
        this.federation.data.update_phonenumber = this.phonenumber;
        this.federation.data.update_imei = this.imei;

        this.federation
        this.servicePouchdb.updateDocReturn(this.federation).then((res) => {
          this.federation._rev = res.rev;
          //this.federation = this.grandefederation

          if(this.federation.data.code_federation !== this.copiefederation.data.code_federation || this.federation.data.nom_federation !== this.copiefederation.data.nom_federation){
            this.updateInfoUnion(this.federation._id, this.federation.data.nom_federation, this.federation.data.code_federation);
          }else{

          let toast = this.toastCtl.create({
            message: 'federation bien sauvegardée!',
            position: 'top',
            duration: 1000
          });
          this.action  = 'detail';
          toast.present();
          this.reinitVar()
        }
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



updateInfoUnion(id_federation, nom, code) {
  let loadin = this.loadinCtl.create({
    content: 'Application des modification aux unions associées en cours....'
  });

  loadin.present();
  //modification du code federation dans op
  this.servicePouchdb.getPlageDocsRapide('union','union:\uffff').then((unions) => {
    unions.forEach((u) => {
        //return this.getPhoto(membre)
        if(u.doc.data.pour_federation == 'oui' && u.doc.data.id_federation == id_federation){
              u.doc.data.nom_federation = nom;
              u.doc.data.code_federation = code;
              this.servicePouchdb.updateDoc(u.doc);
              //mbrs.push(mbr);
            }
      });
      loadin.dismiss();
      let toast = this.toastCtl.create({
        message: 'federation bien sauvegardée!',
        position: 'top',
        duration: 1000
      });

      this.action  = 'detail';
      toast.present();
  }).catch((err) => {
      console.log('Pas d\'unions associé')
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

  
  getallFederations(){
    
    this.rechercher = true;
     // this.federations = [];
      this.servicePouchdb.getPlageDocsRapide('federation','federation:\uffff').then((federations) => {
        
        if(federations){
          this.federations = federations;
          this.allFederations = federations;
          //this.allFederations1 = federations;
          this.rechercher = false;
        }
      }).catch((err) => console.log(err)); 
  }

  ionViewDidEnter() {
    this.getallFederations();
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
      //this.navCtrl.push('AjouterfederationPage', {'confLocaliteEnquete': confLocaliteEnquete});    
  }

  editer(federation){
    this.chargerPays();
    this.chargerSousLocalite(federation.data.pays, 'pays')
    this.chargerSousLocalite(federation.data.region, 'region')
    this.chargerSousLocalite(federation.data.departement, 'departement')
    this.chargerSousLocalite(federation.data.commune, 'commune')
    this.editForm(federation);
    this.getInfoSimEmei();
    this.action = 'modifier';
    this.copiefederation = this.clone(federation);
      //this.navCtrl.push('AjouterfederationPage', {'confLocaliteEnquete': confLocaliteEnquete});    
  }

  modifier(){
    this.getInfoSimEmei();
    this.action = 'modifier';
    //this.navCtrl.push('AjouterfederationPage', {'confLocaliteEnquete': confLocaliteEnquete});    
  }

  detail(federation){
    this.federation = federation;
    this.action = 'detail';
    //this.navCtrl.push('DetailfederationPage', {'federation': federation, 'selectedSource': selectedSource});
  }

  getItems(ev: any) {
    // Reset items back to all of the items
    this.federations = this.allFederations;

    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.federations = this.federations.filter((item) => {
        if(this.typeRecherche === 'nom'){
          return (item.doc.data.nom_federation.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }else if(this.typeRecherche === 'code'){
          return (item.doc.data.code_federation.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }else if(this.typeRecherche === 'aggrement'){
           return (item.doc.data.num_aggrement.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }if(this.typeRecherche === 'pays'){
          if(item.doc.data.pays_nom){
            return (item.doc.data.commune_nom.toLowerCase().indexOf(val.toLowerCase()) > -1);
          }
        }if(this.typeRecherche === 'region'){
          if(item.doc.data.region_nom){
            return (item.doc.data.region_nom.toLowerCase().indexOf(val.toLowerCase()) > -1);
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


  supprimer(federation){
    let alert = this.alertCtl.create({
      title: 'Suppression fédération',
      message: 'Etes vous sûr de vouloir supprimer cette fédération ?',
      buttons:[
        {
          text: 'Annuler',
          handler: () => console.log('suppression annulée')
 
        },
        {
          text: 'Confirmer',
          handler: () => {
            this.servicePouchdb.deleteDoc(federation);
            let toast = this.toastCtl.create({
              message:'fédération bien suppriée',
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

  unionFederation(id_federation, nom_federation, code_federation){
    let modal = this.modelCtl.create('GestionUnionPage', {'id_federation': id_federation, "nom_federation": nom_federation, "code_federation": code_federation});
    modal.present();
    //this.navCtrl.push('GestionUnionPage', {'id_federation': id_federation, "nom_federation": nom_federation, "code_federation": code_federation});
  }

}
