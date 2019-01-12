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
 * Generated class for the GestionUnionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
 
@IonicPage()
@Component({
  selector: 'page-gestion-union',
  templateUrl: 'gestion-union.html',
})
export class GestionUnionPage {

  unionForm: any;
  user: any = global.info_user;
  global:any = global;
  estManger: boolean = false;
  estAdmin: boolean = false;
  unions: any = [];
  allUnions: any = [];
  //allUnions1: any = [];
  code_union: any;
  nom_union: string = '';
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
  union: any;
  copieUnion: any;
  federations: any = [];
  selectedFederation: any;
  pour_federation: string = 'oui';
  code_federation: string;
  nom_federation: string;
  id_federation: string;


  constructor(public navCtrl: NavController, public actionSheetCtrl: ActionSheetController, public loadinCtl: LoadingController, public viewCtl: ViewController, public menuCtl: MenuController, public alertCtl: AlertController, public sim: Sim, public device: Device, public servicePouchdb: PouchdbProvider, public platform: Platform, public toastCtl: ToastController, public printer: Printer, public file: File, public modelCtl: ModalController, public navParams: NavParams, public formBuilder: FormBuilder) {
    if(navParams.data.id_federation){
      this.id_federation = this.navParams.data.id_federation;
      this.code_federation = this.navParams.data.code_federation;
      this.nom_federation = this.navParams.data.nom_federation;
      this.selectedFederation = this.id_federation;
    }
  }

  reinitVar(){
    this.selectedPays = '';
    this.selectedRegion = '';
    this.selectedDepartement = '';
    this.selectedCommune = '';
    this.selectedVillage = '';
    this.selectedFederation = '';
    this.nom_union = '';
    this.code_union = '';
    this.pour_federation = 'oui';
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
            this.editer(this.union)
          }
        },{
          text: 'OP',
          //role: 'destructive',
          icon: 'redo',
          handler: () => {
            this.OPUnion(this.union._id, this.union.data.nom_union, this.union.data.code_union);
          }
        },{
          text: 'Centres de transformation',
          //role: 'destructive',
          icon: 'redo',
          handler: () => {
            this.centreUnion(this.union._id, this.union.data.nom_union, this.union.data.code_union);
          }
        },{
          text: 'Supprimer',
          role: 'destructive',
          icon: 'trash',
          cssClass: 'myActionSheetBtnStyle',
          handler: () => {
            this.supprimer(this.union);
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

  centreUnion(id_union, nom_union, code_union){
    let model = this.modelCtl.create('GestionCentreTransformationPage', {'id_union': id_union, "nom_union": nom_union, "code_union": code_union}, {enableBackdropDismiss: false})
    model.present();
    //this.navCtrl.push('GestionCentreTransformationPage', {'id_union': id_union, "nom_union": nom_union, "code_union": code_union});
  }

  OPUnion(id_union, nom_union, code_union){
    let model = this.modelCtl.create('GestionOpPage', {'id_union': id_union, "nom_union": nom_union, "code_union": code_union}, {enableBackdropDismiss: false})
    model.present();
    //this.navCtrl.push('GestionCentreTransformationPage', {'id_union': id_union, "nom_union": nom_union, "code_union": code_union});
  }

  initForm(){
    let maDate = new Date();
    let today = this.createDate(maDate.getDate(), maDate.getMonth(), maDate.getFullYear());


    this.unionForm = this.formBuilder.group({
      //_id:[''],
      type:['union'],
      nom_union: ['', Validators.required], 
      code_union: ['', Validators.required], 
      num_aggrement: ['', Validators.required],
      pour_federation: ['oui', Validators.required],
      id_federation: [''],
      nom_federation: [''],
      code_federation: [''],
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

  editForm(union){
    this.unionForm = null;
    this.unionForm = this.formBuilder.group({
      //_id:[''],
      type:['union'],
      nom_union: [union.data.nom_union, Validators.required], 
      code_union: [union.data.code_union, Validators.required], 
      num_aggrement: [union.data.num_aggrement, Validators.required],
      pour_federation: [union.data.pour_federation, Validators.required],
      id_federation: [union.data.id_federation],
      nom_federation: [union.data.nom_federation],
      code_federation: [union.data.code_federation],
      pays: [union.data.pays, Validators.required],
      pays_nom: [union.data.pays_nom],
      region: [union.data.region, Validators.required],
      region_nom: [union.data.region_nom],
      departement: [union.data.departement],
      departement_nom: [union.data.departement_nom],
      commune: [union.data.commune],
      commune_nom: [union.data.commune_nom],
      village: [union.data.village],
      village_nom: [union.data.village_nom],
      today: [union.data.today, Validators.required],
    });

    this.selectedPays = union.data.pays;
    this.selectedRegion = union.data.region
    this.selectedDepartement = union.data.departement;
    this.selectedCommune = union.data.commune;
    this.selectedVillage = union.data.village;
    this.pour_federation = union.data.pour_federation;
    this.selectedFederation = union.data.id_federation;
    this.nom_union = union.data.nom_union;
    this.code_union = union.data.code_union;
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
     // this.unions = [];
      this.servicePouchdb.getPlageDocsRapide('union','union:\uffff').then((unions) => {
        if(unions){
          if(this.id_federation && this.id_federation != ""){
            let uns: any= [];
            unions.forEach((u) => {
              if(u.doc.data.id_federation && u.doc.data.id_federation == this.id_federation){
                uns.push(u)
              }
            });
            this.unions = uns;
            this.allUnions = uns;
            refresher.complete();
          }else{
            this.unions = unions;
            this.allUnions = unions;
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
    this.unions = this.allUnions;
  }


  exportExcel(){

    let date = new Date();
    //let dateHeure = date.toLocaleDateString()+ date.toLocaleTimeString();// + date.getTime().toLocaleString();
    let nom = date.getDate().toString() +'_'+ (date.getMonth() + 1).toString() +'_'+ date.getFullYear().toString() +'_'+ date.getHours().toString() +'_'+ date.getMinutes().toString() +'_'+ date.getSeconds().toString();

    let blob = new Blob([document.getElementById('union_tableau').innerHTML], {
      //type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
      type: "text/plain;charset=utf-8"
      //type: 'application/vnd.ms-excel;charset=utf-8'
      //type: "application/vnd.ms-excel;charset=utf-8"
    });

    if(!this.platform.is('android')){
      FileSaver.saveAs(blob, 'Unions_'+nom+'.xls');
    }else{

      let fileDestiny: string = cordova.file.externalRootDirectory;
      this.file.writeFile(fileDestiny, 'Unions_'+nom+'.xls', blob).then(()=> {
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
    let content = document.getElementById('union_tableau').innerHTML;
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
  genererCodeUnion(){
    if(this.action == 'ajouter'){
      //let taille_nom = this.nom_union.length;
      let exclut: any = [' ', ',', '!', ';','/', '-', '_', '.', '"','\'', 'é', 'ê', 'û', 'ë', 'ü', 'î', 'ï', 'ô', 'ö'];
      let nom = this.nom_union;
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
      this.code_union = code.toUpperCase();

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
              for(let pos=0; pos < this.allUnions.length; pos++){
                let u = this.allUnions[pos];
                if(u.doc.data.code_union === code.toUpperCase()){
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
                this.code_union = code.toUpperCase();
                break;
              
            }
        }
        
      }else{
        this.code_union = '';
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

  verifierUniqueNon(union){

    let res = 1;
    if(this.action == 'ajouter'){
      if((union.pour_federation == 'oui' && !union.id_federation) || (union.pour_federation == 'oui' && union.id_federation == '')){
        res = 2;
      }else{
        this.allUnions.forEach((u, index) => {
          if(/*(union.nom_union === u.data.nom_union) || */(union.num_aggrement === u.doc.data.num_aggrement)){
            res = 0;
          }
        });
      }
      
    }else{
      if((union.pour_federation == 'oui' && !union.id_federation) || (union.pour_federation == 'oui' && union.id_federation == '')){
        res = 2;
      }else{
        this.allUnions.forEach((u, index) => {
          if((u.doc._id !== this.union._id) && (/*(union.nom_union === u.data.nom_union) || */(union.num_aggrement === u.doc.data.num_aggrement))){
            res = 0;
          }
        });
      }
      
    }
    
    return res;
  }

  validAction(){
    let date = new Date();
    let union = this.unionForm.value;

    if(this.verifierUniqueNon(union) === 0){
      alert('Le numéro d\'aggrement doit être unique!');
    }else if(this.verifierUniqueNon(union) === 2){
      alert('La fédération est obligatoir!');
    }{
      //union.pays = this.selectedPays;
      for(let i = 0; i < this.pays.length; i++){
        if(this.pays[i].id == this.selectedPays){
          union.pays_nom = this.pays[i].nom;
          break;
        }
      }
      
      //union.region = this.selectedRegion.id;
      for(let i = 0; i < this.regions.length; i++){
        if(this.regions[i].id == this.selectedRegion){
          union.region_nom = this.regions[i].nom;
          break;
        }
      }
      //union.departement = this.selectedDepartement.id;
      for(let i = 0; i < this.departements.length; i++){
        if(this.departements[i].id == this.selectedDepartement){
          union.departement_nom = this.departements[i].nom;
          break;
        }
      }
      //union.commune = this.selectedCommune.id;
      for(let i = 0; i < this.communes.length; i++){
        if(this.communes[i].id == this.selectedCommune){
          union.commune_nom = this.communes[i].nom;
          break;
        }
      }
      //union.village = this.selectedVillage.id;
      for(let i = 0; i < this.villages.length; i++){
        if(this.villages[i].id == this.selectedVillage){
          union.village_nom = this.villages[i].nom;
          break;
        }
      }

      if(union.pour_federation == 'oui'){
        for(let i = 0; i < this.federations.length; i++){
          if(this.federations[i].doc._id == this.selectedFederation){
            union.nom_federation = this.federations[i].doc.data.nom_federation;
            union.code_federation = this.federations[i].doc.data.code_federation;
          }
        }
      }else{
        union.id_federation = null;
        union.nom_federation = null;
        union.code_federation = null;
      }
      union.deviceid = this.device.uuid;
      union.phonenumber = this.phonenumber;
      union.imei = this.imei;

      if(this.action == 'ajouter'){
        let id = this.servicePouchdb.generateId('union', union.commune, union.village);
        union.end = date.toJSON();

        let unionFinal: any = {};
        unionFinal._id =  id;
        unionFinal.data = union
        this.servicePouchdb.createDocReturn(unionFinal).then((res) => {
          unionFinal._rev = res.rev;
          let u: any = {}
          u.doc = unionFinal;
          this.unions.push(u)
          this.allUnions = this.unions;
          //this.allUnions1.push(u)
          this.action = 'liste';
          //this.ressetChampsForm();
          let toast = this.toastCtl.create({
            message: 'Union bien enregistré!',
            position: 'top',
            duration: 1000
          });
          toast.present();

          this.federations = [];
          this.reinitVar()
        /*let E: any = this.essais;
        E = E.concat(essais);
         
        this.essais = E;
        this.allEssais = this.essais;*/
          
      }).catch((err) => alert('une erreur est survenue lors de l\'enregistrement: '+err) );
    
      }else{


        this.union.data.nom_union = union.nom_union;
        this.union.data.code_union = union.code_union;
        this.union.data.num_aggrement = union.num_aggrement;
        this.union.data.pour_federation = union.pour_federation;
        this.union.data.id_federation = union.id_federation;
        this.union.data.nom_federation = union.nom_federation;
        this.union.data.code_federation = union.code_federation;
        this.union.data.pays = union.pays;
        this.union.data.pays_nom = union.pays_nom;
        this.union.data.region = union.region;
        this.union.data.region_nom = union.region_nom;
        this.union.data.departement = union.departement;
        this.union.data.departement_nom = union.departement_nom;
        this.union.data.commune = union.commune;
        this.union.data.commune_nom = union.commune_nom;
        this.union.data.village = union.village;
        this.union.data.village_nom = union.village_nom;
        this.union.data.update_deviceid = this.device.uuid;
        this.union.data.update_phonenumber = this.phonenumber;
        this.union.data.update_imei = this.imei;

        //this.union
        this.servicePouchdb.updateDocReturn(this.union).then((res) => {
          this.union._rev = res.rev;
          //this.union = this.grandeUnion

          if(this.union.data.code_union !== this.copieUnion.data.code_union || this.union.data.nom_union !== this.copieUnion.data.nom_union){
            this.updateCentreAssocies(this.union._id, this.union.data.nom_federation, this.union.data.code_federation);
          }else{

          let toast = this.toastCtl.create({
            message: 'Union bien sauvegardée!',
            position: 'top',
            duration: 1000
          });
          this.action  = 'detail';
          toast.present();
          this.federations = [];
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



updateCentreAssocies(id_union, nom_union, code_union) {
  let loadin = this.loadinCtl.create({
    content: 'Modification des centre associés en cours....'
  });

  loadin.present();
  //modification du code union dans centre
  this.servicePouchdb.getPlageDocsRapide('centre','centre:\uffff').then((centres) => {
    centres.forEach((c) => {
        //return this.getPhoto(membre)
        if(c.doc.data.pour_union == 'oui' && c.doc.data.id_union === id_union){
              c.doc.data.nom_union = nom_union;
              c.doc.data.code_union = code_union;
              this.servicePouchdb.updateDoc(c.doc);
              //mbrs.push(mbr);
            }
      });
      //modification du code union dans membres
      /*this.servicePouchdb.getPlageDocsRapide('membre', 'membre:\uffff').then((membres) => {
        membres.forEach((membre) => {
          if(membre.doc.data.code_union === ancien_code){
            membre.doc.data.code_union = code;
            this.servicePouchdb.updateDoc(membre.doc);
          }
        })

        //modification du code union dans essais
        this.servicePouchdb.getPlageDocsRapide('essai', 'essai:\uffff').then((essais) => {
          essais.forEach((essai) => {
              if(essai.doc.data.code_union === ancien_code){
                essai.doc.data.code_union = code;
                this.servicePouchdb.updateDoc(essai.doc);
              }
            });

            //modification du code union dans champs
            this.servicePouchdb.getPlageDocsRapide('fuma:champs','fuma:champs:\uffff').then((champs) => {
              champs.forEach((champ) => {
                if(champ.doc.data.code_union === ancien_code){
                  champ.doc.data.code_union = code;
                  this.servicePouchdb.updateDoc(champ.doc);
                }
              })

              loadin.dismiss();
              let toast = this.toastCtl.create({
                message: 'Union bien sauvegardée!',
                position: 'top',
                duration: 1000
              });

              this.action  = 'detail';
              toast.present();
            });
          }).catch((err) => {
            //modification du code union dans champs
            this.servicePouchdb.getPlageDocsRapide('fuma:champs','fuma:champs:\uffff').then((champs) => {
              champs.forEach((champ) => {
                if(champ.doc.data.code_union === ancien_code){
                  champ.doc.data.code_union = code;
                  this.servicePouchdb.updateDoc(champ.doc);
                }
              })

              loadin.dismiss();
              let toast = this.toastCtl.create({
                message: 'Union bien sauvegardée!',
                position: 'top',
                duration: 1000
              });

              this.action  = 'detail';
              toast.present();
            });
          } ) ;


        }).catch((err) => {
          //modification du code union dans essais
        this.servicePouchdb.getPlageDocsRapide('fuma:essai', 'fuma:essai:\uffff').then((essais) => {
          essais.forEach((essai) => {
              if(essai.doc.data.code_union === ancien_code){
                essai.doc.data.code_union = code;
                this.servicePouchdb.updateDoc(essai.doc);
              }
            });

            //modification du code union dans champs
            this.servicePouchdb.getPlageDocsRapide('fuma:champs','fuma:champs:\uffff').then((champs) => {
              champs.forEach((champ) => {
                if(champ.doc.data.code_union === ancien_code){
                  champ.doc.data.code_union = code;
                  this.servicePouchdb.updateDoc(champ.doc);
                }
              })

              loadin.dismiss();
              let toast = this.toastCtl.create({
                message: 'Union bien sauvegardée!',
                position: 'top',
                duration: 1000
              });

              this.action  = 'detail';
              toast.present();
            });
          }).catch((err) => {
            //modification du code union dans champs
            this.servicePouchdb.getPlageDocsRapide('fuma:champs','fuma:champs:\uffff').then((champs) => {
              champs.forEach((champ) => {
                if(champ.doc.data.code_union === ancien_code){
                  champ.doc.data.code_union = code;
                  this.servicePouchdb.updateDoc(champ.doc);
                }
              })

              loadin.dismiss();
              let toast = this.toastCtl.create({
                message: 'Union bien sauvegardée!',
                position: 'top',
                duration: 1000
              });

              this.action  = 'detail';
              toast.present();
            });
          });


        }) ;*/

      loadin.dismiss();
      let toast = this.toastCtl.create({
        message: 'Union bien sauvegardée!',
        position: 'top',
        duration: 1000
      });

      this.action  = 'detail';
      toast.present();
  }).catch((err) => {
       //modification du code union dans membres
      /*this.servicePouchdb.getPlageDocsRapide('op:membre', 'op:membre:\uffff').then((membres) => {
        membres.forEach((membre) => {
          if(membre.doc.data.code_union === ancien_code){
            membre.doc.data.code_union = code;
            this.servicePouchdb.updateDoc(membre.doc);
          }
        })

        //modification du code union dans essais
        this.servicePouchdb.getPlageDocsRapide('fuma:essai', 'fuma:essai:\uffff').then((essais) => {
          essais.forEach((essai) => {
              if(essai.doc.data.code_union === ancien_code){
                essai.doc.data.code_union = code;
                this.servicePouchdb.updateDoc(essai.doc);
              }
            });

            //modification du code union dans champs
            this.servicePouchdb.getPlageDocsRapide('fuma:champs','fuma:champs:\uffff').then((champs) => {
              champs.forEach((champ) => {
                if(champ.doc.data.code_union === ancien_code){
                  champ.doc.data.code_union = code;
                  this.servicePouchdb.updateDoc(champ.doc);
                }
              })

              loadin.dismiss();
              let toast = this.toastCtl.create({
                message: 'Union bien sauvegardée!',
                position: 'top',
                duration: 1000
              });

              this.action  = 'detail';
              toast.present();
            });
          });


        }).catch((err) => {
          console.log(err)
        //modification du code union dans essais
        this.servicePouchdb.getPlageDocsRapide('fuma:essai', 'fuma:essai:\uffff').then((essais) => {
          essais.forEach((essai) => {
              if(essai.doc.data.code_union === ancien_code){
                essai.doc.data.code_union = code;
                this.servicePouchdb.updateDoc(essai.doc);
              }
            });

            //modification du code union dans champs
            this.servicePouchdb.getPlageDocsRapide('fuma:champs','fuma:champs:\uffff').then((champs) => {
              champs.forEach((champ) => {
                if(champ.doc.data.code_union === ancien_code){
                  champ.doc.data.code_union = code;
                  this.servicePouchdb.updateDoc(champ.doc);
                }
              })

              loadin.dismiss();
              let toast = this.toastCtl.create({
                message: 'Union bien sauvegardée!',
                position: 'top',
                duration: 1000
              });

              this.action  = 'detail';
              toast.present();
            });
          }).catch((err) => {

            //modification du code union dans champs
            this.servicePouchdb.getPlageDocsRapide('fuma:champs','fuma:champs:\uffff').then((champs) => {
              champs.forEach((champ) => {
                if(champ.doc.data.code_union === ancien_code){
                  champ.doc.data.code_union = code;
                  this.servicePouchdb.updateDoc(champ.doc);
                }
              })

              loadin.dismiss();
              let toast = this.toastCtl.create({
                message: 'Union bien sauvegardée!',
                position: 'top',
                duration: 1000
              });

              this.action  = 'detail';
              toast.present();
            });
          }) ;

        });*/
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

  
  getAllUnions(){
    
    this.rechercher = true;
     // this.unions = [];
      this.servicePouchdb.getPlageDocsRapide('union','union:\uffff').then((unions) => {
        if(unions){
          if(this.id_federation && this.id_federation != ""){
            let uns: any= [];
            unions.forEach((u) => {
              if(u.doc.data.id_federation && u.doc.data.id_federation == this.id_federation){
                uns.push(u)
              }
            });
            this.unions = uns;
            this.allUnions = uns;
            this.rechercher = false;
          }else{
            this.unions = unions;
            this.allUnions = unions;
            this.rechercher = false;
          }
          
          //this.allUnions1 = unions;
         
        }
      }).catch((err) => {
        console.log(err)
        this.rechercher = false;
      }); 
  }

  pourUnion(pour_union){
    if(pour_union == 'oui'/* && this.federations.length < 0*/){
      this.getAllFederation();
    }
  }

  getAllFederation(){
      this.servicePouchdb.getPlageDocsRapide('federation','federation:\uffff').then((federations) => {
        if(federations){
          this.federations = federations;
        }
      }).catch((err) => console.log(err)); 
  }


  ionViewDidEnter() {
    this.getAllUnions();
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
    this.getAllFederation();
      //this.navCtrl.push('AjouterUnionPage', {'confLocaliteEnquete': confLocaliteEnquete});    
  }

  editer(union){
    this.chargerPays();
    this.chargerSousLocalite(union.data.pays, 'pays')
    this.chargerSousLocalite(union.data.region, 'region')
    this.chargerSousLocalite(union.data.departement, 'departement')
    this.chargerSousLocalite(union.data.commune, 'commune')
    this.editForm(union);
    if(union.data.pour_federation == 'oui'/* && this.federations.length < 0*/){
      this.getAllFederation();
    }
    this.getInfoSimEmei();
    this.action = 'modifier';
    this.copieUnion = this.clone(union);
      //this.navCtrl.push('AjouterUnionPage', {'confLocaliteEnquete': confLocaliteEnquete});    
  }

  modifier(){
    this.getInfoSimEmei();
    this.action = 'modifier';
    //this.navCtrl.push('AjouterUnionPage', {'confLocaliteEnquete': confLocaliteEnquete});    
  }

  detail(union){
    this.union = union;
    this.action = 'detail';
    //this.navCtrl.push('DetailUnionPage', {'union': union, 'selectedSource': selectedSource});
  }

  getItems(ev: any) {
    // Reset items back to all of the items
    this.unions = this.allUnions;

    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.unions = this.unions.filter((item) => {
        if(this.typeRecherche === 'nom'){
          return (item.doc.data.nom_union.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }else if(this.typeRecherche === 'code'){
          return (item.doc.data.code_union.toLowerCase().indexOf(val.toLowerCase()) > -1);
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


  
  supprimer(union){
    let e: any = {};
    let alert = this.alertCtl.create({
      title: 'Suppression union',
      message: 'Etes vous sûr de vouloir supprimer cette union ?',
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
              this.servicePouchdb.deleteReturn(union).then((res) => {
                //let e: any = {};
                //e.doc = essai;
                this.unions.forEach((es, i) => {
                  if(es.doc._id === union._id){
                    this.unions.splice(i, 1);
                  }
                  
                });
    
                this.action = 'liste';
                //this.navCtrl.pop();
              }, err => {
                console.log(err)
              }) ;
            }else{
              this.servicePouchdb.deleteDocReturn(union).then((res) => {
                //let e: any = {};
                //e.doc = essai;
                this.unions.forEach((es, i) => {
                  if(es.doc._id === union._id){
                    this.unions.splice(i, 1);
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
  supprimer(union){
    let alert = this.alertCtl.create({
      title: 'Suppression union',
      message: 'Etes vous sûr de vouloir supprimer cette union ?',
      buttons:[
        {
          text: 'Annuler',
          handler: () => console.log('suppression annulée')
 
        },
        {
          text: 'Confirmer',
          handler: () => {
            this.servicePouchdb.deleteDoc(union);
            let toast = this.toastCtl.create({
              message:'Union bien suppriée',
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
