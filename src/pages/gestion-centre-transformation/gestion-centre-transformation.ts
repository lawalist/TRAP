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
import { RelationCentreComponent } from '../../components/relation-centre/relation-centre';
declare var cordova: any;
 
/**
 * Generated class for the GestionCentreTransformationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-gestion-centre-transformation',
  templateUrl: 'gestion-centre-transformation.html',
})
export class GestionCentreTransformationPage {

  centreForm: any;
  user: any = global.info_user;
  global:any = global;
  //estManager: boolean = false;
  estAdmin: boolean = false;
  estManager: boolean = false;
  estAnimataire: boolean = false;
  centres: any = [];
  allCentres: any = [];
  //allCentres1: any = [];
  code_centre: any;
  nom_centre: string = '';
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
  centre: any;
  copiecentre: any;
  groupements: any = [];
  selectedGroupement: any;
  niveau_centre: string;
  code_groupement_mere: string;
  nom_groupement_mere: string;
  id_groupement_mere: string;
/*
  selectedOP: any;
  pour_op: string = 'oui';
  code_op: string;
  nom_op: string;
  id_op: string;*/

  constructor(public navCtrl: NavController, public popoverController: PopoverController, public events: Events, public actionSheetCtrl: ActionSheetController, public loadinCtl: LoadingController, public viewCtl: ViewController, public menuCtl: MenuController, public alertCtl: AlertController, public sim: Sim, public device: Device, public servicePouchdb: PouchdbProvider, public platform: Platform, public toastCtl: ToastController, public printer: Printer, public file: File, public modelCtl: ModalController, public navParams: NavParams, public formBuilder: FormBuilder) {
    if(navParams.data.id_union){
      this.id_groupement_mere = this.navParams.data.id_union;
      this.code_groupement_mere = this.navParams.data.code_union;
      this.nom_groupement_mere = this.navParams.data.nom_union;
      this.selectedGroupement = this.id_groupement_mere;
      this.niveau_centre = 'Rattaché à une Union';
    }else if(navParams.data.id_op){
      this.id_groupement_mere = this.navParams.data.id_op
      this.code_groupement_mere = this.navParams.data.code_op;
      this.nom_groupement_mere = this.navParams.data.nom_op;
      this.selectedGroupement = this.id_groupement_mere;
      this.niveau_centre = 'Rattaché à une OP';
    }else if(navParams.data.id_federation){
        this.id_groupement_mere = this.navParams.data.id_federation
        this.code_groupement_mere = this.navParams.data.code_federation;
        this.nom_groupement_mere = this.navParams.data.nom_federation;
        this.selectedGroupement = this.id_groupement_mere;
        this.niveau_centre = 'Rattaché à une Fédération';
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

  reinitVar(){
    this.selectedPays = null;
    this.selectedRegion = null;
    this.selectedDepartement = null;
    this.selectedCommune = null;
    this.selectedVillage = null;
    this.selectedGroupement = null;
    this.nom_centre = null;
    this.code_centre = null;
    this.niveau_centre = null;
  }

  
openRelationCentre(ev: any) {
  let popover = this.popoverController.create(RelationCentreComponent);
  popover.present({ev: ev});

  popover.onWillDismiss((res) => {
    if(res == 'Membres'){
      this.membresCentre(this.centre._id, this.centre.data.nom_centre, this.centre.data.code_centre);
    }else if(res == 'Produits'){
      this.produitsCentre(this.centre._id, this.centre.data.nom_centre, this.centre.data.code_centre);
    }else if(res == 'Evaluations'){
      this.EvaluationsCentre(this.centre._id, this.centre.data.nom_centre, this.centre.data.code_centre);
    }else if(res == 'Productions'){
      this.productionCentre(this.centre._id, this.centre.data.nom_centre, this.centre.data.code_centre);
    }else if(res == 'Etat du stock'){
      this.inventaireProduitsCentre(this.centre._id, this.centre.data.nom_centre, this.centre.data.code_centre);
    }else if(res == 'Ventes'){
      this.ventesCentre(this.centre._id, this.centre.data.nom_centre, this.centre.data.code_centre);
    }else if(res == 'Pertes'){
      this.pertesProduitsCentre(this.centre._id, this.centre.data.nom_centre, this.centre.data.code_centre);
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
            this.editer(this.centre)
          }
        },/*{
          text: 'Membres',
          //role: 'destructive',
          icon: 'redo',
          handler: () => {
            this.membresCentre(this.centre._id, this.centre.data.nom_centre, this.centre.data.code_centre);
          }
        },{
          text: 'Produits',
          role: 'destructive',
          icon: 'redo',
          cssClass: 'myActionSheetBtnStyle',
          handler: () => {
            this.produitsCentre(this.centre._id, this.centre.data.nom_centre, this.centre.data.code_centre);
          }
        },{
          text: 'Productions',
          role: 'destructive',
          icon: 'redo',
          cssClass: 'myActionSheetBtnStyle',
          handler: () => {
            this.productionCentre(this.centre._id, this.centre.data.nom_centre, this.centre.data.code_centre);
          }
        },
        {
          text: 'Etat du stock',
          role: 'destructive',
          icon: 'redo',
          cssClass: 'myActionSheetBtnStyle',
          handler: () => {
            this.inventaireProduitsCentre(this.centre._id, this.centre.data.nom_centre, this.centre.data.code_centre);
          }
        },
        {
          text: 'Ventes',
          role: 'destructive',
          icon: 'redo',
          cssClass: 'myActionSheetBtnStyle',
          handler: () => {
            this.ventesCentre(this.centre._id, this.centre.data.nom_centre, this.centre.data.code_centre);
          }
        },
        {
          text: 'Pertes',
          role: 'destructive',
          icon: 'redo',
          cssClass: 'myActionSheetBtnStyle',
          handler: () => {
            this.pertesProduitsCentre(this.centre._id, this.centre.data.nom_centre, this.centre.data.code_centre);
          }
        },*/
        {
          text: 'Supprimer',
          role: 'destructive',
          icon: 'trash',
          cssClass: 'myActionSheetBtnStyle',
          handler: () => {
            this.supprimer(this.centre);
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

  membresCentre(id_centre, nom_centre, code_centre){
    let model = this.modelCtl.create('MembrePage', {'id_centre': id_centre, "nom_centre": nom_centre, "code_centre": code_centre}, {enableBackdropDismiss: false});
    model.present();
  }

  produitsCentre(id_centre, nom_centre, code_centre){
    let model = this.modelCtl.create('GestionProduitPage', {'id_centre': id_centre, "nom_centre": nom_centre, "code_centre": code_centre}, {enableBackdropDismiss: false});
    model.present();
  }

  productionCentre(id_centre, nom_centre, code_centre){
    let model = this.modelCtl.create('GestionProductionPage', {'id_centre': id_centre, "nom_centre": nom_centre, "code_centre": code_centre}, {enableBackdropDismiss: false});
    model.present();
  }

  inventaireProduitsCentre(id_centre, nom_centre, code_centre){
    let model = this.modelCtl.create('StockPage', {'id_centre': id_centre, "nom_centre": nom_centre, "code_centre": code_centre}, {enableBackdropDismiss: false});
    model.present();
  }

  pertesProduitsCentre(id_centre, nom_centre, code_centre){
    let model = this.modelCtl.create('ProduitGatePage', {'id_centre': id_centre, "nom_centre": nom_centre, "code_centre": code_centre}, {enableBackdropDismiss: false});
    model.present();
  }

  ventesCentre(id_centre, nom_centre, code_centre){
    let model = this.modelCtl.create('GestionVentePage', {'id_centre': id_centre, "nom_centre": nom_centre, "code_centre": code_centre}, {enableBackdropDismiss: false});
    model.present();
  }

  EvaluationsCentre(id_centre, nom_centre, code_centre){
    let model = this.modelCtl.create('EvaluationPage', {'id_centre': id_centre, "nom_centre": nom_centre, "code_centre": code_centre}, {enableBackdropDismiss: false});
    model.present();
  }

  initForm(){
    let maDate = new Date();
    let today = this.createDate(maDate.getDate(), maDate.getMonth(), maDate.getFullYear());

 
    this.centreForm = this.formBuilder.group({
      //_id:[''],
      type:['centre'],
      nom_centre: ['', Validators.required], 
      code_centre: ['', Validators.required], 
      type_centre: ['Centre d\'innovation', Validators.required],
      num_aggrement: ['', Validators.required],
      niveau_centre: [this.niveau_centre, Validators.required],
      
      /*id_groupement_mere: [''],
      nom_groupement_mere: [''],
      code_groupement_mere: [''],*/

      id_federation: [null],
      nom_federation: [null],
      code_federation: [null],

      id_union: [null],
      nom_union: [null],
      code_union: [null],

      id_op: [null],
      nom_op: [null],
      code_op: [null],

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

  editForm(centre){
    this.centreForm = null;
    this.centreForm = this.formBuilder.group({
      //_id:[''],
      type:['centre'],
      nom_centre: [centre.data.nom_centre, Validators.required], 
      code_centre: [centre.data.code_centre, Validators.required], 
      num_aggrement: [centre.data.num_aggrement, Validators.required],
      type_centre: [centre.data.type_centre, Validators.required],
      niveau_centre: [centre.data.niveau_centre, Validators.required],
      
      /*id_groupement_mere: [centre.data.id_groupement_mere],
      nom_groupement_mere: [centre.data.nom_groupement_mere],
      code_groupement_mere: [centre.data.code_groupement_mere],*/

      id_federation: [centre.data.id_federation],
      nom_federation: [centre.data.nom_federation],
      code_federation: [centre.data.code_federation],

      id_union: [centre.data.id_union],
      nom_union: [centre.data.nom_union],
      code_union: [centre.data.code_union],

      id_op: [centre.data.id_op],
      nom_op: [centre.data.nom_op],
      code_op: [centre.data.code_op],

      pays: [centre.data.pays, Validators.required],
      pays_nom: [centre.data.pays_nom],
      region: [centre.data.region, Validators.required],
      region_nom: [centre.data.region_nom],
      departement: [centre.data.departement],
      departement_nom: [centre.data.departement_nom],
      commune: [centre.data.commune],
      commune_nom: [centre.data.commune_nom],
      village: [centre.data.village],
      village_nom: [centre.data.village_nom],
      today: [centre.data.today, Validators.required],
    });

    this.selectedPays = centre.data.pays;
    this.selectedRegion = centre.data.region
    this.selectedDepartement = centre.data.departement;
    this.selectedCommune = centre.data.commune;
    this.selectedVillage = centre.data.village;
    this.niveau_centre = centre.data.niveau_centre;
    //this.selectedGroupement = centre.data.id_groupement_mere;

    if(centre.data.niveau_centre == 'Rattaché à une Fédération'){
      this.selectedGroupement = centre.data.id_federation;
    }else if(centre.data.niveau_centre == 'Rattaché à une Union'){
      this.selectedGroupement = centre.data.id_union;
    }else if(centre.data.niveau_centre == 'Rattaché à une OP'){
      this.selectedGroupement = centre.data.id_op;
    }else{
      this.selectedGroupement = null;
    }

    this.nom_centre = centre.data.nom_centre;
    this.code_centre = centre.data.code_centre;
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
     // this.centres = [];
      this.servicePouchdb.getDocByType('centre').then((res) => {
        if(res){
          let centres = res.docs;
          if(this.navParams.data.id_union){
            let uns: any= [];
            centres.forEach((u) => {
              if(u.data.id_union && u.data.id_union == this.id_groupement_mere){
                uns.push(u)
              }
            });
            this.centres = uns;
            this.allCentres = uns;
            this.rechercher = false;
          }else if(this.navParams.data.id_op){
            let uns: any= [];
            centres.forEach((u) => {
              if(u.data.id_op && u.data.id_op == this.id_groupement_mere){
                uns.push(u)
              }
            });
            this.centres = uns;
            this.allCentres = uns;
            this.rechercher = false;
          }else if(this.navParams.data.id_federation){
            let uns: any= [];
            centres.forEach((u) => {
              if(u.data.id_federation && u.data.id_federation == this.id_groupement_mere){
                uns.push(u)
              }
            });
            this.centres = uns;
            this.allCentres = uns;
            this.rechercher = false;
              
          }else{
            this.centres = centres;
            this.allCentres = centres;
            this.rechercher = false;
          }

          refresher.complete();

          /*if(this.id_groupement_mere && this.id_groupement_mere != ""){
            let uns: any= [];
            centres.forEach((u) => {
              if(u.data.id_groupement_mere && u.data.id_groupement_mere == this.id_groupement_mere){
                uns.push(u)
              }
            });
            this.centres = uns;
            this.allCentres = uns;
            refresher.complete();
          }else{
            this.centres = centres;
            this.allCentres = centres;
            refresher.complete();
          }*/
          
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
    this.centres = this.allCentres;
  }


  exportExcel(){

    let date = new Date();
    //let dateHeure = date.toLocaleDateString()+ date.toLocaleTimeString();// + date.getTime().toLocaleString();
    let nom = date.getDate().toString() +'_'+ (date.getMonth() + 1).toString() +'_'+ date.getFullYear().toString() +'_'+ date.getHours().toString() +'_'+ date.getMinutes().toString() +'_'+ date.getSeconds().toString();

    let blob = new Blob([document.getElementById('centre_tableau').innerHTML], {
      //type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
      type: "text/plain;charset=utf-8"
      //type: 'application/vnd.ms-excel;charset=utf-8'
      //type: "application/vnd.ms-excel;charset=utf-8"
    });

    if(!this.platform.is('android')){
      FileSaver.saveAs(blob, 'centres_'+nom+'.xls');
    }else{

      let fileDestiny: string = cordova.file.externalRootDirectory;
      this.file.writeFile(fileDestiny, 'centres_'+nom+'.xls', blob).then(()=> {
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
    let content = document.getElementById('centre_tableau').innerHTML;
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
  genererCodecentre(){
    if(this.action == 'ajouter'){
      //let taille_nom = this.nom_centre.length;
      let exclut: any = [' ', ',', '!', ';','/', '-', '_', '.', '"','\'', 'é', 'ê', 'û', 'ë', 'ü', 'î', 'ï', 'ô', 'ö'];
      let nom = this.nom_centre;
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
      this.code_centre = code.toUpperCase();

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
              for(let pos=0; pos < this.allCentres.length; pos++){
                let u = this.allCentres[pos];
                if(u.data.code_centre === code.toUpperCase()){
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
                this.code_centre = code.toUpperCase();
                break;
              
            }
        }
        
      }else{
        this.code_centre = '';
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

  verifierUniqueNon(centre){

    let res = 1;
    if(this.action == 'ajouter'){
      if((centre.niveau_centre != 'Indépendant' && !this.selectedGroupement) || (centre.niveau_centre != 'Indépendant' && this.selectedGroupement == '')){
        res = 2;
      }else{
        this.allCentres.forEach((u, index) => {
          if(/*(centre.nom_centre === u.data.nom_centre) || */(centre.num_aggrement === u.data.num_aggrement)){
            res = 0;
          }
        });
      }
      
    }else{
      if((centre.niveau_centre != 'Indépendant' && !this.selectedGroupement) || (centre.niveau_centre != 'Indépendant' && this.selectedGroupement == '')){
        res = 2;
      }else{
        this.allCentres.forEach((u, index) => {
          if((u._id !== this.centre._id) && (/*(centre.nom_centre === u.data.nom_centre) || */(centre.num_aggrement === u.data.num_aggrement))){
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
    for(let i=0;i<32;i++){
      var rand = Math.floor(Math.random()*62)
      randomArray.push(numbers[rand])
    }
    
    var randomString=randomArray.join("");
    var Id= /*+pays+'-'+region+'-'+department+'-'+commune +'-' +village+ */''+randomString 
    return Id;
  }

  validAction(){
    let date = new Date();
    let centre = this.centreForm.value;

    if(this.verifierUniqueNon(centre) === 0){
      alert('Le numéro d\'aggrement doit être unique!');
    }else if(this.verifierUniqueNon(centre) === 2){
      alert('Le groupement mère est obligatoir!');
    }else{
      //centre.pays = this.selectedPays;
      for(let i = 0; i < this.pays.length; i++){
        if(this.pays[i].id == this.selectedPays){
          centre.pays_nom = this.pays[i].nom;
          break;
        }
      }
      
      //centre.region = this.selectedRegion.id;
      for(let i = 0; i < this.regions.length; i++){
        if(this.regions[i].id == this.selectedRegion){
          centre.region_nom = this.regions[i].nom;
          break;
        }
      }
      //centre.departement = this.selectedDepartement.id;
      for(let i = 0; i < this.departements.length; i++){
        if(this.departements[i].id == this.selectedDepartement){
          centre.departement_nom = this.departements[i].nom;
          break;
        }
      }
      //centre.commune = this.selectedCommune.id;
      for(let i = 0; i < this.communes.length; i++){
        if(this.communes[i].id == this.selectedCommune){
          centre.commune_nom = this.communes[i].nom;
          break;
        }
      }
      //centre.village = this.selectedVillage.id;
      for(let i = 0; i < this.villages.length; i++){
        if(this.villages[i].id == this.selectedVillage){
          centre.village_nom = this.villages[i].nom;
          break;
        }
      }

      if(centre.niveau_centre != 'Indépendant'){
        for(let i = 0; i < this.groupements.length; i++){
          if(this.groupements[i]._id == this.selectedGroupement){
            //cas d'un niveau fédération
            if(centre.niveau_centre == 'Rattaché à une Fédération'){
              centre.id_federation = this.groupements[i]._id;
              centre.nom_federation = this.groupements[i].data.nom_federation;
              centre.code_federation = this.groupements[i].data.code_federation;
                /*centre.nom_groupement_mere = this.groupements[i].data.nom_federation;
                centre.code_groupement_mere = this.groupements[i].data.code_federation;*/

            }else if(centre.niveau_centre == 'Rattaché à une Union'){
                centre.id_union = this.groupements[i]._id;
                centre.code_union = this.groupements[i].data.code_union;
                centre.nom_union = this.groupements[i].data.nom_union;

                centre.id_federation = this.groupements[i].data.id_federation;
                centre.code_federation = this.groupements[i].data.code_federation;
                centre.nom_federation = this.groupements[i].data.nom_federation;
            }else if(centre.niveau_centre == 'Rattaché à une OP'){
                centre.id_op = this.groupements[i]._id;
                centre.code_op = this.groupements[i].data.code_op;
                centre.nom_op = this.groupements[i].data.nom_op;
                centre.id_union = this.groupements[i].data.id_union;
                centre.code_union = this.groupements[i].data.code_union;
                centre.nom_union = this.groupements[i].data.nom_union;
                centre.id_federation = this.groupements[i].data.id_federation;
                centre.code_federation = this.groupements[i].data.code_federation;
                centre.nom_federation = this.groupements[i].data.nom_federation;
            }
            break;
          }
        }
      }else{
        centre.id_federation = null;
        centre.nom_federation = null;
        centre.code_federation = null;
        centre.id_union = null;
        centre.nom_union = null;
        centre.code_union = null;
        centre.id_op = null;
        centre.nom_op = null;
        centre.code_op = null;
      }
      centre.deviceid = this.device.uuid;
      centre.phonenumber = this.phonenumber;
      centre.imei = this.imei;

      if(this.action == 'ajouter'){
        let id = 'centre:'+this.generateId();
        centre.end = date.toJSON();

        let centreFinal: any = {};
        centreFinal._id =  id;
        centreFinal.data = centre
        this.servicePouchdb.createDocReturn(centreFinal).then((res) => {
          centreFinal._rev = res.rev;
          let u: any = {}
          u = centreFinal;
          this.centres.push(u)
          this.allCentres = this.centres;
          //this.allCentres1.push(u)
          this.action = 'liste';
          //this.ressetChampsForm();
          let toast = this.toastCtl.create({
            message: 'centre bien enregistré!',
            position: 'top',
            duration: 1000
          });
          toast.present();

          this.groupements = [];
          this.reinitVar()
        /*let E: any = this.essais;
        E = E.concat(essais);
         
        this.essais = E;
        this.allEssais = this.essais;*/
          
      }).catch((err) => alert('une erreur est survenue lors de l\'enregistrement: '+err) );
    
      }else{


        this.centre.data.nom_centre = centre.nom_centre;
        this.centre.data.code_centre = centre.code_centre;
        this.centre.data.num_aggrement = centre.num_aggrement;
        this.centre.data.type_centre = centre.type_centre;
        this.centre.data.niveau_centre = centre.niveau_centre;

        /*this.centre.data.id_groupement_mere = centre.id_groupement_mere;
        this.centre.data.nom_groupement_mere = centre.nom_groupement_mere;
        this.centre.data.code_groupement_mere = centre.code_groupement_mere;*/

        this.centre.data.id_federation = centre.id_federation;
        this.centre.data.nom_federation = centre.nom_federation;
        this.centre.data.code_federation = centre.code_federation;

        this.centre.data.id_union = centre.id_union;
        this.centre.data.nom_union = centre.nom_union;
        this.centre.data.code_union = centre.code_union;

        this.centre.data.id_op = centre.id_op;
        this.centre.data.nom_op = centre.nom_op;
        this.centre.data.code_op = centre.code_op;

        this.centre.data.pays = centre.pays;
        this.centre.data.pays_nom = centre.pays_nom;
        this.centre.data.region = centre.region;
        this.centre.data.region_nom = centre.region_nom;
        this.centre.data.departement = centre.departement;
        this.centre.data.departement_nom = centre.departement_nom;
        this.centre.data.commune = centre.commune;
        this.centre.data.commune_nom = centre.commune_nom;
        this.centre.data.village = centre.village;
        this.centre.data.village_nom = centre.village_nom;
        this.centre.data.update_deviceid = this.device.uuid;
        this.centre.data.update_phonenumber = this.phonenumber;
        this.centre.data.update_imei = this.imei;

        this.centre
        this.servicePouchdb.updateDocReturn(this.centre).then((res) => {
          this.centre._rev = res.rev;
          //this.centre = this.grandecentre

          if(this.centre.data.code_centre !== this.copiecentre.data.code_centre || this.centre.data.nom_centre !== this.copiecentre.data.nom_centre){
            this.updateCentreAssocies(this.centre._id, this.centre.data.nom_union, this.centre.data.code_union);
          }else{

          let toast = this.toastCtl.create({
            message: 'centre bien sauvegardée!',
            position: 'top',
            duration: 1000
          });
          this.action  = 'detail';
          toast.present();
          this.groupements = [];
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



updateCentreAssocies(id_centre, nom_centre, code_centre) {
  let loadin = this.loadinCtl.create({
    content: 'Modification des centre associés en cours....'
  });

  loadin.present();
  //modification du code centre dans centre
  this.servicePouchdb.getDocByType('centre').then((res) => {
    res.docs.forEach((c) => {
        //return this.getPhoto(membre)
        if(c.data.niveau_centre != 'Indépendant' && c.data.id_centre === id_centre){
              c.data.nom_centre = nom_centre;
              c.data.code_centre = code_centre;
              this.servicePouchdb.updateDoc(c);
              //mbrs.push(mbr);
            }
      });
      
      loadin.dismiss();
      let toast = this.toastCtl.create({
        message: 'centre bien sauvegardée!',
        position: 'top',
        duration: 1000
      });

      this.action  = 'detail';
      toast.present();
  }).catch((err) => {
       console.log(err)
  })
  
        
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

  
  getAllCentres(){
    
    this.rechercher = true;
     // this.centres = [];
      this.servicePouchdb.getDocByType('centre', false).then((res) => {
        //console.log(res.docs)
        if(res.docs){
          let centres = res.docs;
          if(this.navParams.data.id_union){
            let uns: any= [];
            centres.forEach((u) => {
              if(u.data.id_union && u.data.id_union == this.id_groupement_mere){
                uns.push(u)
              }
            });
            this.centres = uns;
            this.allCentres = uns;
            this.rechercher = false;
          }else if(this.navParams.data.id_op){
            let uns: any= [];
            centres.forEach((u) => {
              if(u.data.id_op && u.data.id_op == this.id_groupement_mere){
                uns.push(u)
              }
            });
            this.centres = uns;
            this.allCentres = uns;
            this.rechercher = false;
          }else if(this.navParams.data.id_federation){
            let uns: any= [];
            centres.forEach((u) => {
              if(u.data.id_federation && u.data.id_federation == this.id_groupement_mere){
                uns.push(u)
              }
            });
            this.centres = uns;
            this.allCentres = uns;
            this.rechercher = false;
              
          }else{
            this.centres = centres;
            this.allCentres = centres;
            this.rechercher = false;
          }

          /*if(this.id_groupement_mere && this.id_groupement_mere != ""){
            let uns: any= [];
            centres.forEach((u) => {
              if(u.data.id_groupement_mere && u.data.id_groupement_mere == this.id_groupement_mere){
                uns.push(u)
              }
            });
            this.centres = uns;
            this.allCentres = uns;
            this.rechercher = false;
          }else{
            this.centres = centres;
            this.allCentres = centres;
            this.rechercher = false;
          }*/
          
          //this.allCentres1 = centres;
         
        }
      }).catch((err) => {
        console.log(err)
        this.rechercher = false;
      }); 
  }

  getNiveauCentre(niveau_centre){
    if(niveau_centre == 'Rattaché à une Fédération'/* && this.groupements.length < 0*/){
        this.getAllFederation();
    }else if(niveau_centre == 'Rattaché à une Union'){
        this.getAllUnion();
    }else if(niveau_centre == 'Rattaché à une OP'){
        this.getAllOP();
    }else {

    }
  }

  getAllUnion(){
      this.servicePouchdb.getDocByType('union').then((res) => {
        if(res){
          this.groupements = res.docs;
        }
      }).catch((err) => console.log(err)); 
  }

    getAllOP(){
        this.servicePouchdb.getDocByType('op').then((res) => {
            if(res){
                this.groupements = res.docs;
            }
        }).catch((err) => console.log(err));
    }

    getAllFederation(){
        this.servicePouchdb.getDocByType('federation').then((res) => {
            if(res){
                this.groupements = res.docs;
            }
        }).catch((err) => console.log(err));
    }


  ionViewDidEnter() {
    this.getAllCentres();
    if(this.servicePouchdb.remoteSaved){
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
    }else{
      setTimeout( () => { 
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
      }, 500 );
    }
      
        
  }

  collect(){
    this.navCtrl.push('CollectPage')
  }


  ajouter(){
    this.chargerPays();
    this.initForm();
    this.getInfoSimEmei();
    this.action = 'ajouter';
    //this.getAllUnion();
      //this.navCtrl.push('AjoutercentrePage', {'confLocaliteEnquete': confLocaliteEnquete});
    if(this.niveau_centre == 'Rattaché à une Fédération'/* && this.groupements.length < 0*/){
        this.getAllFederation();
    }else if(this.niveau_centre == 'Rattaché à une Union'){
        this.getAllUnion();
    }else if(this.niveau_centre == 'Rattaché à une OP'){
        this.getAllOP();
    }
  }

  editer(centre, dbclick: boolean = false){
    if(!dbclick || (dbclick && this.user && this.user.roles && global.estManager(this.user.roles))){
      this.chargerPays();
      this.chargerSousLocalite(centre.data.pays, 'pays')
      this.chargerSousLocalite(centre.data.region, 'region')
      this.chargerSousLocalite(centre.data.departement, 'departement')
      this.chargerSousLocalite(centre.data.commune, 'commune')
      this.editForm(centre);
      /*if(centre.data.pour_union == 'oui'){
        this.getAllUnion();
      }*/
      if(centre.data.niveau_centre == 'Rattaché à une Fédération'/* && this.groupements.length < 0*/){
          this.getAllFederation();
      }else if(centre.data.niveau_centre == 'Rattaché à une Union'){
          this.getAllUnion();
      }else if(centre.data.niveau_centre == 'Rattaché à une OP'){
          this.getAllOP();
      }
      this.getInfoSimEmei();
      this.action = 'modifier';
      this.copiecentre = this.clone(centre);
        
    }//this.navCtrl.push('AjoutercentrePage', {'confLocaliteEnquete': confLocaliteEnquete});    
  }

  modifier(){
    this.getInfoSimEmei();
    this.action = 'modifier';
    //this.navCtrl.push('AjoutercentrePage', {'confLocaliteEnquete': confLocaliteEnquete});    
  }

  detail(centre){
    this.centre = centre;
    this.action = 'detail';
    //this.navCtrl.push('DetailcentrePage', {'centre': centre, 'selectedSource': selectedSource});
  }

  getItems(ev: any) {
    // Reset items back to all of the items
    this.centres = this.allCentres;

    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.centres = this.centres.filter((item) => {
        if(this.typeRecherche === 'nom'){
          return (item.data.nom_centre.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }else if(this.typeRecherche === 'code'){
          return (item.data.code_centre.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }else if(this.typeRecherche === 'aggrement'){
           return (item.data.num_aggrement.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }if(this.typeRecherche === 'site'){
          if(item.data.commune_nom){
            return (item.data.commune_nom.toLowerCase().indexOf(val.toLowerCase()) > -1);
          }
        }if(this.typeRecherche === 'village'){
          if(item.data.village_nom){
            return (item.data.village_nom.toLowerCase().indexOf(val.toLowerCase()) > -1);
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
      this.groupements = [];
      this.reinitVar();
    }else if (this.action == 'modifier'){
      this.action = 'detail';
      this.groupements = [];
      this.reinitVar();
    }
  }

  
  fermerDetail(){
    this.action = 'liste';
    //this.essai = {};

  }


  supprimer(centre){
    let e: any = {};
    let alert = this.alertCtl.create({
      title: 'Suppression centre',
      message: 'Etes vous sûr de vouloir supprimer ce centre ?',
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
              this.servicePouchdb.deleteReturn(centre).then((res) => {
                //let e: any = {};
                //e = essai;
                this.centres.forEach((es, i) => {
                  if(es._id === centre._id){
                    this.centres.splice(i, 1);
                  }
                  
                });
    
                this.action = 'liste';
                //this.navCtrl.pop();
              }, err => {
                console.log(err)
              }) ;
            }else{
              this.servicePouchdb.deleteDocReturn(centre).then((res) => {
                //let e: any = {};
                //e = essai;
                this.centres.forEach((es, i) => {
                  if(es._id === centre._id){
                    this.centres.splice(i, 1);
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
  supprimer(centre){
    let alert = this.alertCtl.create({
      title: 'Suppression centre',
      message: 'Etes vous sûr de vouloir supprimer cette centre ?',
      buttons:[
        {
          text: 'Annuler',
          handler: () => console.log('suppression annulée')
 
        },
        {
          text: 'Confirmer',
          handler: () => {
            this.servicePouchdb.deleteDoc(centre);
            let toast = this.toastCtl.create({
              message:'centre bien suppriée',
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
