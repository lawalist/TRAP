import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, Events, ActionSheetController, NavParams, LoadingController, ViewController, MenuController, AlertController, ToastController, ModalController, Platform } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { PouchdbProvider } from '../../providers/pouchdb-provider';
import { global } from '../../global-variables/variable';
import { Device } from '@ionic-native/device';
import { Sim } from '@ionic-native/sim';
import { File } from '@ionic-native/file';
import * as FileSaver from 'file-saver';
import { Printer, PrintOptions } from '@ionic-native/printer';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { ImagePicker } from '@ionic-native/image-picker';
import JsBarcode from 'jsbarcode';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
declare var cordova: any;
//import FileReader from 'filereader';
/**
 * Generated class for the MembrePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-membre',
  templateUrl: 'membre.html',
})
export class MembrePage {
 membreForm: any;
  user: any = global.info_user;
  global:any = global;
  estManager: boolean = false;
  estAnimataire: boolean = false;
  estAdmin: boolean = false;
  membres: any = [];
  allMembres: any = [];
  allMembres1: any = [];
  refresher: any = '';
  //allMembres1: any = [];
  matricule_membre: any;
  //nom_membre: string = '';
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
  //typeRecherche: any = 'nom';
  rechercher: any = false;
  action: string = 'liste';
  membre: any;
  copiemembre: any;
  centres: any = [];
  selectedCentre: any;
  code_centre: string;
  nom_centre: string;
  id_centre: string;
  date_maissance_membre: any;
  age: number;
  public base64Image: any;
  showCamera = true;
  estInitierMemebre: boolean = false;
  //instanceID: string;
  imageData: any = '';
  attachments:any;
  photo: any;
  fileName: any;
  imageBlob:any;
  selectedLimit: any = 10;

  @ViewChild('barcode') barcode: ElementRef;
  //@ViewChild('fileInput') fileInput: ElementRef;
  fileInput: any;

  fromUnion: any;
  myPlatform:boolean = false;
  photoID: any;
  photoRev: any;
  typeRecherche: any = 'matricule';
  //selectedLimit: any = 10;
  limits: any = [10, 25, 50, 100, 500, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 'Tous'];
  recherche: any;

  constructor(public navCtrl: NavController, public events: Events, private sanitizer: DomSanitizer, public imagePicker: ImagePicker, private camera: Camera, public actionSheetCtrl: ActionSheetController, public loadinCtl: LoadingController, public viewCtl: ViewController, public menuCtl: MenuController, public alertCtl: AlertController, public sim: Sim, public device: Device, public servicePouchdb: PouchdbProvider, public platform: Platform, public toastCtl: ToastController, public printer: Printer, public file: File, public modelCtl: ModalController, public navParams: NavParams, public formBuilder: FormBuilder) {
    if(navParams.data.id_centre){
      this.id_centre = this.navParams.data.id_centre;
      this.code_centre = this.navParams.data.code_centre;
      this.nom_centre = this.navParams.data.nom_centre;
      this.selectedCentre = this.id_centre;
    }

    this.myPlatform = this.platform.is('android')
    
    
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
    this.selectedPays = '';
    this.selectedRegion = '';
    this.selectedDepartement = '';
    this.selectedCommune = '';
    this.selectedVillage = '';
    this.selectedCentre = '';
    //this.nom_membre = '';
    this.matricule_membre = '';
    this.photoID = '';
    this.photoRev = '';
    this.photo = '';
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
            this.editer(this.membre)
          }
        },{
          text: 'Supprimer',
          role: 'destructive',
          icon: 'trash',
          cssClass: 'myActionSheetBtnStyle',
          handler: () => {
            this.supprimer(this.membre);
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


  getMembres(strk, endk) {
    if(this.refresher === ''){
      this.rechercher = true;
    }
    if(this.id_centre){
      this.servicePouchdb.getAll(
      {
        startkey: strk/* + ':' + this.code_centre*/,
        endkey: strk /*+ ':' + this.code_centre */+':\uffff',
        include_docs: true
      },
    ).then(
      res => {
        var membres: any = [];
        res.rows.map((row) => {
          if(!row.doc.data.deleted && row.doc.data.id_centre == this.id_centre){
            membres.push(row);
          }
        });
        //var membres = res.rows
        var promises = membres.map(function (membre) {
          return this.getPhoto(membre)
        }.bind(this))
        return Promise.all(promises).then(
          res => {
              this.membres = res
              this.allMembres=res
              this.rechercher = false;
              this.getAllMembresSansPhoto();
              if(this.refresher !== ''){
                this.refresher.complete();
              }
           
          }
        )
      }
      );
    
    }else{

      this.servicePouchdb.getAll(
      {
        startkey: strk,
        endkey: strk + ':\uffff',
        include_docs: true
      },
    ).then(
      res => {
        var membres: any = [];
        res.rows.map((row) => {
          if(!row.doc.data.deleted){
            membres.push(row);
          }
        });
        //var membres = res.rows
        var promises = membres.map(function (membre) {
          return this.getPhoto(membre)
        }.bind(this))
        return Promise.all(promises).then(
          res => {
              this.membres = res
              this.allMembres=res  
              this.rechercher = false; 
              this.allMembres1 = res
              //this.getAllMembresSansPhoto() 
              if(this.refresher !== ''){
                this.refresher.complete();
              }       
          }
        )
      }
      );
    

    }
  }

   getAllMembres(strk, endk) {
    
    if(this.refresher === ''){
      this.rechercher = true;
    }
    if(this.id_centre){
      this.servicePouchdb.getAll(
      {
        startkey: strk/* + ':' + this.code_centre*/,
        endkey: strk /*+ ':' + this.code_centre */+ ':\uffff',
        include_docs: true
      },
    ).then(
      res => {
        var membres: any = [];
        res.rows.map((row) => {
          if(!row.doc.data.deleted && row.doc.data.id_centre == this.id_centre){
            membres.push(row);
          }
        });
        //var membres = res.rows
        var promises = membres.map(function (membre) {
          return this.getPhoto(membre)
        }.bind(this))
        return Promise.all(promises).then(
          res => {
              //this.membres = res
              this.allMembres=res
              //this.rechercher = false;
           
          }
        )
      }
      );
    
    }else{

      this.servicePouchdb.getAll(
      {
        startkey: strk,
        endkey: strk + ':\uffff',
        include_docs: true
      },
    ).then(
      res => {
        var membres: any = [];
        res.rows.map((row) => {
          if(!row.doc.data.deleted){
            membres.push(row);
          }
        });
        //var membres = res.rows
        var promises = membres.map(function (membre) {
          return this.getPhoto(membre)
        }.bind(this))
        return Promise.all(promises).then(
          res => {
              //this.membres = res
              this.allMembres=res  
              //this.rechercher = false;         
          }
        )
      }
      );
    }
  }

  getMembresAvecLimite(strk, endk, limit) {
    
    if(this.refresher === ''){
      this.rechercher = true;
    }
    if(this.id_centre){
      this.servicePouchdb.getAll(
      {
        startkey: strk/*+ ':'+this.code_centre*/,
        endkey: strk/* + ':' +this.code_centre*/ + ':\uffff',
        include_docs: true,
        limit: limit,
      },
    ).then(
      res => {
        var membres: any = [];
        res.rows.map((row) => {
          if(!row.doc.data.deleted && row.doc.data.id_centre == this.id_centre){
            membres.push(row);
          }
        });
        //var membres = res.rows
        var promises = membres.map(function (membre) {
          return this.getPhoto(membre)
        }.bind(this))
        return Promise.all(promises).then(
          res => {
              this.membres = res
              this.allMembres=res
              this.rechercher = false; 
              this.getAllMembresSansPhoto() 
              if(this.refresher !== ''){
                this.refresher.complete();
              }        
          }
        );
      }
      );
    
    }else{
      this.servicePouchdb.getAll(
      {
        startkey: strk,
        endkey: strk + ':\uffff',
        include_docs: true,
        limit: limit,
      },
    ).then(
      res => {
        var membres: any = [];
        res.rows.map((row) => {
          if(!row.doc.data.deleted){
            membres.push(row);
          }
        });
        //var membres = res.rows
        var promises = membres.map(function (membre) {
          return this.getPhoto(membre)
        }.bind(this))
        return Promise.all(promises).then(
          res => {
              this.membres = res
              this.allMembres=res
              this.rechercher = false;
              this.getAllMembresSansPhoto()
              if(this.refresher !== ''){
                this.refresher.complete();
              }
          }
        );
      }
      );
    }
  }


  choixLimit(){
    this.rechercher = true;
    if(this.selectedLimit !== 'Tous'){
      this.membres = this.allMembres.slice(0, this.selectedLimit);
      this.rechercher = false;
    }else{
      this.membres = this.allMembres;
      this.rechercher = false;
    }
    
  }


  getPhoto(membre) {
    return new Promise((resolve, reject) => {
      //var v = true;
      var photoDocId = '';
      var filename = '';
      //alert(membre.doc.data.photoID)
      if(!membre.doc.data.photoID){
        //alert('1')
        var profilePhotoId = membre.doc.data["meta/deprecatedID"];
        photoDocId = 'photos_fuma-op-membre/' + profilePhotoId;
        filename = profilePhotoId + '.jpeg';
        //v = false;
      }else{
        photoDocId = membre.doc.data.photoID;
        filename = photoDocId + '.jpeg';
        //v = true;
        //alert(v)
      }

      //var profilePhotoId = membre.doc.data["meta/deprecatedID"]
      // return 'assets/images/no photo.jpg'
      //this.servicePouchdb.getAttachment('photos_fuma-op-membre/' + profilePhotoId, filename).then(url => {
      this.servicePouchdb.getAttachment(photoDocId, filename).then(url => {
         //membre.photo = this.sanitizer.bypassSecurityTrustUrl(url)
         if(url){
           if(!membre.doc.data.photoID){
            membre.photo = this.sanitizer.bypassSecurityTrustUrl(url);
            
            if (url != "assets/images/no-photo.png") {
              membre.photoDocId = photoDocId;
              //membre.url = url;
            } 

            this.servicePouchdb.getDocById(photoDocId).then((doc) => {
              if(doc){
                membre.photoDocRev = doc._rev;
              }
              resolve(membre)
            }, err => resolve(membre)).catch(() => resolve(membre))
            
          }else{
            //var blobURL = blobUtil.createObjectURL(url);
            //URL.createObjectURL()
            
            membre.photo = this.sanitizer.bypassSecurityTrustUrl(url);
            
            if (url != "assets/images/no-photo.png") {
              membre.photoDocId = photoDocId;
              //membre.url = url;

            } 

            this.servicePouchdb.getDocById(photoDocId).then((doc) => {
              if(doc){
                membre.photoDocRev = doc._rev;
              }
              resolve(membre)
            }, err => resolve(membre)).catch(() => resolve(membre))
            //resolve(membre)
          }
        
         }
      }).catch(err => {
        //alert(err)
        console.log('err', err)
        // profile.photo = 
        // resolve(profile)
      })
    })
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

  setDate(age){
    if(age >= 15){
      let now: Date = new Date();
      let annee = now.getFullYear() - age;
      //this.createDate(1,1, annee)
      this.date_maissance_membre = this.createDate(1,0, annee);
      //alert(this.date_naissance)
    }else{
      this.date_maissance_membre = '';
    }
    
  }

  setAge(){
    let now: Date = new Date();
    let date = new Date(this.date_maissance_membre)
    this.age = now.getFullYear() - date.getFullYear();
    //alert(this.age);
    //this.date_naissance = ev;
  }



  autreActionDate(){

      let alert = this.alertCtl.create({
        title: 'Autres actions',
        message: 'Voulez vous supprimer la date de naissance ?',
        buttons: [
          {
            text: 'Oui',
            handler: () => {
              this.date_maissance_membre = '';
              this.age = null;
            }
          },
           {
            text: 'Non',
            handler: () => console.log('non')
          }
        ]
      });

      alert.present();
  }

  takePhoto() {
    
    let option = {
      sourceType: this.camera.PictureSourceType.CAMERA,
      //destinationType: this.camera.DestinationType.NATIVE_URI,
      destinationType: this.camera.DestinationType.DATA_URL,
      quality: 50,
      targetWidth: 500,
      //targetWidth: 100,
      targetHeight: 500,
      correctOrientation: true,
      saveToPhotoAlbum: true
    };

    this.camera.getPicture(option).then((imageData) => {
      // imageData is a base64 encoded string
      //this.photo = this.sanitizer.bypassSecurityTrustUrl(imageData);
      this.imageData = imageData;
      this.base64Image = "data:image/jpeg;base64," + imageData;
      this.photo = this.base64Image ;
    }, (err) => {
      this.photo = this.sanitizer.bypassSecurityTrustUrl('assets/images/no-photo.png');
      console.log(err);
    });
  }

  chooseImage(){


    let option = {
      maximumImagesCount: 1,
      quality: 50,
      width: 500,
      height: 500,
      outputType: 1
    };

    this.imagePicker.getPictures(option).then((imageData) => {
      //this.photo = this.sanitizer.bypassSecurityTrustUrl(imageData[0]);
      this.imageData = imageData[0];
      this.base64Image = "data:image/jpeg;base64," + imageData[0];
      this.photo = this.base64Image ;
    }, (err) => {
      this.photo = this.sanitizer.bypassSecurityTrustUrl('assets/images/no-photo.png');
      console.log(err)
    } );
  }



  onFileChange(event) {
    let reader = new FileReader();
    if(event.target.files && event.target.files.length > 0) {
      let file = event.target.files[0];
      reader.readAsDataURL(file);
      reader.onload = () => {
        if(file.type !='image/jpeg' && file.type != 'image/png'){
          alert('Erreur! \n\nSeule les images de type jpeg et png sont autorisées!')
          this.clearFile();
        }else{
          this.imageData = reader.result.toString().split(',')[1];
          this.base64Image = reader.result;//.split(',')[1];
          this.photo = this.base64Image ;
        }
      };
    }
  }
  clearFile() {
    //this.form.get('avatar').setValue(null);
    //this.fileInput.nativeElement.value = '';
    this.fileInput = '';
    this.imageData = null //.slice(',')[1];
    this.base64Image = null//.split(',')[1];
    this.photo = this.sanitizer.bypassSecurityTrustUrl('assets/images/no-photo.png') ;
  }



  initForm(){
    let maDate = new Date();
    let today = this.createDate(maDate.getDate(), maDate.getMonth(), maDate.getFullYear());

    this.date_maissance_membre = '';
 
    this.membreForm = this.formBuilder.group({
      //_id:[''],
      type:['membre'],
      matricule_membre: ['', Validators.required],
      nom_membre: ['', Validators.required], 
      prenom_membre: ['', Validators.required], 
      sexe_membre: ['', Validators.required], 
      date_maissance_membre: [''], 
      id_centre: ['', Validators.required],
      nom_centre: [''],
      code_centre: [''],
      code_union: [''],
      pays: [''],
      pays_nom: [''],
      region: [''],
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

  editForm(membre){
    this.membreForm = null;
    this.membreForm = this.formBuilder.group({
      //_id:[''],
      type:['membre'],
      matricule_membre: [membre.data.matricule_membre, Validators.required],
      nom_membre: [membre.data.nom_membre, Validators.required], 
      prenom_membre: [membre.data.prenom_membre, Validators.required], 
      sexe_membre: [membre.data.sexe_membre, Validators.required], 
      date_maissance_membre: [membre.data.date_maissance_membre], 
      id_centre: [membre.data.id_centre, Validators.required],
      nom_centre: [membre.data.nom_centre],
      code_centre: [membre.data.code_centre],
      code_union: [membre.data.code_union],
      pays: [membre.data.pays],
      pays_nom: [membre.data.pays_nom],
      region: [membre.data.region],
      region_nom: [membre.data.region_nom],
      departement: [membre.data.departement],
      departement_nom: [membre.data.departement_nom],
      commune: [membre.data.commune],
      commune_nom: [membre.data.commune_nom],
      village: [membre.data.village],
      village_nom: [membre.data.village_nom],
      today: [membre.data.today, Validators.required],
    });

    this.selectedPays = membre.data.pays;
    this.selectedRegion = membre.data.region
    this.selectedDepartement = membre.data.departement;
    this.selectedCommune = membre.data.commune;
    this.selectedVillage = membre.data.village;
    this.selectedCentre = membre.data.id_centre;
    if(this.date_maissance_membre && this.date_maissance_membre != ''){
      this.date_maissance_membre = membre.data.date_maissance_membre;
      //this.nom_membre = membre.data.nom_membre;
      let date1: any = new Date().getFullYear();
      let date2 : any = new Date(this.date_maissance_membre).getFullYear();
      this.age = date1 - date2;
    }else{
      this.age = null;
      this.date_maissance_membre = '';
    }
    
    this.matricule_membre = membre.data.matricule_membre;
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
     // this.membres = [];
      this.servicePouchdb.getPlageDocsRapide('membre','membre:\uffff').then((membres) => {
        if(membres){
          if(this.id_centre && this.id_centre != ""){
            let uns: any= [];
            membres.forEach((u) => {
              if(u.doc.data.id_centre && u.doc.data.id_centre == this.id_centre){
                uns.push(u)
              }
            });
            this.membres = uns;
            this.allMembres = uns;
            refresher.complete();
          }else{
            this.membres = membres;
            this.allMembres = membres;
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

  estAnimataireConnecter(user){
    if(user && user.roles){
      this.estAnimataire = global.estAnimataire(user.roles);
    }
  }
  estAdminConnecter(user){
    if(user && user.roles){
      this.estManager = global.estAdmin(user.roles);
    }
  }

    typeRechercheChange(){
    //this.membres = this.allMembres;
  }


  exportExcel(){

    let date = new Date();
    //let dateHeure = date.toLocaleDateString()+ date.toLocaleTimeString();// + date.getTime().toLocaleString();
    let nom = date.getDate().toString() +'_'+ (date.getMonth() + 1).toString() +'_'+ date.getFullYear().toString() +'_'+ date.getHours().toString() +'_'+ date.getMinutes().toString() +'_'+ date.getSeconds().toString();

    let blob = new Blob([document.getElementById('membre_tableau').innerHTML], {
      //type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
      type: "text/plain;charset=utf-8"
      //type: 'application/vnd.ms-excel;charset=utf-8'
      //type: "application/vnd.ms-excel;charset=utf-8"
    });

    if(!this.platform.is('android')){
      FileSaver.saveAs(blob, 'membres_'+nom+'.xls');
    }else{

      let fileDestiny: string = cordova.file.externalRootDirectory;
      this.file.writeFile(fileDestiny, 'membres_'+nom+'.xls', blob).then(()=> {
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
    let content = document.getElementById('membre_tableau').innerHTML;
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

  verifierUniqueNon(membre){

    let res = 1;
    if(this.action == 'ajouter'){
        this.allMembres1.forEach((u, index) => {
          if(/*(membre.nom_membre === u.data.nom_membre) || */(membre.matricule_membre === u.doc.data.matricule_membre)){
            res = 0;
          }
        });
      
    }else{
        this.allMembres.forEach((u, index) => {
          if((u.doc._id !== this.membre.doc._id) && (/*(membre.nom_membre === u.data.nom_membre) || */(membre.matricule_membre === u.doc.data.matricule_membre))){
            res = 0;
          }
        });
      }

    return res;
  }


  generateIdPhoto(){
    var numbers='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    var randomArray=[]
    for(let i=0;i<30;i++){
      var rand = Math.floor(Math.random()*62)
      randomArray.push(numbers[rand])
    }
    
    var randomString=randomArray.join("");
    var Id= /*+pays+'-'+region+'-'+department+'-'+commune +'-' +village+ */''+randomString 
    return Id;
  }

  getMatriculeMembre(selectedCentre){
    
    let Id: any;
    for(let i = 0; i < this.centres.length; i++){
      if(this.centres[i].doc._id == selectedCentre){
        var numbers='0123456789ABCDEFGHIJKLMNPQRSTUVWYZ'
        var randomArray=[]
        for(let i=0;i<5;i++){
          var rand = Math.floor(Math.random()*34)
          randomArray.push(numbers[rand])
        }
        var randomString=randomArray.join("");
         Id= this.centres[i].doc.data.code_centre+'-'+randomString 
      }
    }

    this.matricule_membre = Id;
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

  validAction(){
    let date = new Date();
    let membre = this.membreForm.value;

    membre.matricule_membre = this.matricule_membre;
    if(this.verifierUniqueNon(membre) === 0){
      alert('Le matricule doit être unique!');
      this.getMatriculeMembre(this.selectedCentre)
    }else if(this.verifierUniqueNon(membre) === 2){
      alert('L\'centre est obligatoir!');
    }else{
      //membre.pays = this.selectedPays;
      for(let i = 0; i < this.pays.length; i++){
        if(this.pays[i].id == this.selectedPays){
          membre.pays_nom = this.pays[i].nom;
          break;
        }
      }
      
      //membre.region = this.selectedRegion.id;
      for(let i = 0; i < this.regions.length; i++){
        if(this.regions[i].id == this.selectedRegion){
          membre.region_nom = this.regions[i].nom;
          break;
        }
      }
      //membre.departement = this.selectedDepartement.id;
      for(let i = 0; i < this.departements.length; i++){
        if(this.departements[i].id == this.selectedDepartement){
          membre.departement_nom = this.departements[i].nom;
          break;
        }
      }
      //membre.commune = this.selectedCommune.id;
      for(let i = 0; i < this.communes.length; i++){
        if(this.communes[i].id == this.selectedCommune){
          membre.commune_nom = this.communes[i].nom;
          break;
        }
      }
      //membre.village = this.selectedVillage.id;
      for(let i = 0; i < this.villages.length; i++){
        if(this.villages[i].id == this.selectedVillage){
          membre.village_nom = this.villages[i].nom;
          break;
        }
      }

      for(let i = 0; i < this.centres.length; i++){
        if(this.centres[i].doc._id == this.selectedCentre){
          membre.nom_centre = this.centres[i].doc.data.nom_centre;
          membre.code_centre = this.centres[i].doc.data.code_centre;
          membre.code_union = this.centres[i].doc.data.code_union;
          break;
        }
      }
     
      membre.deviceid = this.device.uuid;
      membre.phonenumber = this.phonenumber;
      membre.imei = this.imei;

      if(this.action == 'ajouter'){
        let id = 'membre:'+this.generateId();
        membre.end = date.toJSON();

        
        let ida = 'photo:'+ this.generateIdPhoto()//this.matricule + ' AT'+;
        //alert()
        if(this.base64Image && this.base64Image != ''){
          membre.photoID = ida; 
        }else{
          membre.photoID = null
        }

        let membreFinal: any = {};
        membreFinal._id =  id;
        membreFinal.data = membre

        this.servicePouchdb.createDocReturn(membreFinal).then((res) => {
          membreFinal._rev = res.rev;
          //let u: any = {}
          //u.doc = membreFinal;

            let m: any = {}
            m.doc = membreFinal;
            if(this.base64Image && this.base64Image != ''){
                var doc = {
                // _id: ida,
                  _attachments: {},
                  photoID: ida,
                  timestamp: new Date().toString(),
                  type: 'photo',
                  code_union: membre.code_union,
                  code_centre: membre.code_centre
                }

                //this.imageBlob = this.getBase64Image(document.getElementById("imageid"));

                this.fileName = ida + '.jpeg';
                doc._attachments[this.fileName] = {
                  content_type: 'image/jpeg', 
                  data: this.imageData
                }

                
                //this.servicePouchdb.createDoc(doc)
                this.servicePouchdb.put(doc, ida).then((res) => {
                  m.photo = this.photo;
                  m.photoDocId = ida;
                  m.photoDocRev = res.rev

                  this.membres.push(m);
                  //this.allMembres.push(m);
                  this.allMembres = this.membres;
                  this.photo = null;
                  this.allMembres1.push(m)
                  this.action = 'liste';
                  //this.ressetChampsForm();
                  let toast = this.toastCtl.create({
                    message: 'membre bien enregistré!',
                    position: 'top',
                    duration: 1000
                  });
                  toast.present();

                  this.centres = [];
                  this.reinitVar()

                  
                  //this.membre = m;
                  //this.detailMembre = true;
                  //this.viewCtrl.dismiss(m)
                })
                
          
              }else{
                m.photo = 'assets/images/no-photo.png';
                this.membres.push(m);
                //this.allMembres.push(m);
                this.allMembres = this.membres;
                this.photo = null;
                //this.allMembres1.push(u)
                this.action = 'liste';
                //this.ressetChampsForm();
                let toast = this.toastCtl.create({
                  message: 'membre bien enregistré!',
                  position: 'top',
                  duration: 1000
                });
                toast.present();

                this.centres = [];
                this.reinitVar()
                this.photo = null;
                //this.detailMembre = true;
                //this.viewCtrl.dismiss(m)
              }
          
        /*let E: any = this.essais;
        E = E.concat(essais);
         
        this.essais = E;
        this.allEssais = this.essais;*/
          
      }).catch((err) => alert('une erreur est survenue lors de l\'enregistrement: '+err) );
    
      }else{


        this.membre.doc.data.nom_membre = membre.nom_membre;
        this.membre.doc.data.prenom_membre = membre.prenom_membre;
        this.membre.doc.data.sexe_membre = membre.sexe_membre;
        this.membre.doc.data.date_maissance_membre = membre.date_maissance_membre;
        this.membre.doc.data.matricule_membre = membre.matricule_membre;
        this.membre.doc.data.id_centre = membre.id_centre;
        this.membre.doc.data.nom_centre = membre.nom_centre;
        this.membre.doc.data.code_centre = membre.code_centre;
        this.membre.doc.data.code_union = membre.code_union;
        this.membre.doc.data.pays = membre.pays;
        this.membre.doc.data.pays_nom = membre.pays_nom;
        this.membre.doc.data.region = membre.region;
        this.membre.doc.data.region_nom = membre.region_nom;
        this.membre.doc.data.departement = membre.departement;
        this.membre.doc.data.departement_nom = membre.departement_nom;
        this.membre.doc.data.commune = membre.commune;
        this.membre.doc.data.commune_nom = membre.commune_nom;
        this.membre.doc.data.village = membre.village;
        this.membre.doc.data.village_nom = membre.village_nom;
        this.membre.doc.data.update_deviceid = this.device.uuid;
        this.membre.doc.data.update_phonenumber = this.phonenumber;
        this.membre.doc.data.update_imei = this.imei;

        let ida: any;
        if(!this.photoID && this.imageData && this.imageData != ''){
          ida = 'photo:'+ this.generateIdPhoto()//membre.matricule_Membre;
          this.membre.doc.data.photoID = ida;
        }

        //this.membre

        this.servicePouchdb.updateDocReturn(this.membre.doc).then((res) => {
          this.membre.doc._rev = res.rev;


          //let grandMembre: any = {}
          //grandMembre.doc = this.membre;
          //mise à jour de la photo

          if(this.photoID && this.imageData  && this.imageData != ''){
              this.servicePouchdb.updateAtachementReturn(this.photoID, this.photoID + '.jpeg', this.photoRev, this.imageData , 'image/jpeg').then((res) => {
                this.membre.photo = this.photo;
                this.membre.photoDocId = this.photoID;
                this.membre.photoDocRev = res.rev
                this.detail(this.membre)
                //this.membre = grandMembre;
  
                //this.action = 'detail';
                //this.detailMembre = true;
                /*if(actu_ch_es){
                  this.detail(this.grandMembre, true);
                  actu_ch_es = false;
                }else{
                  this.detail(this.grandMembre, false)
                }*/
              this.membres.forEach((m, i) => {
                if(m.doc._id === this.membre.doc._id){
                  this.membres[i] = this.membre;
                  //this.allMembres = this.membres;
                }
              });
  
              this.allMembres.forEach((m, i) => {
                if(m.doc._id === this.membre.doc._id){
                  this.allMembres[i] = this.membre;
                  //this.allMembres = this.membres;
                }
              });
  
              this.allMembres1.forEach((m, i) => {
                if(m.doc._id === this.membre.doc._id){
                  this.allMembres1[i] = this.membre;
                  //this.allMembres = this.membres;
                }
              });
  
              let toast = this.toastCtl.create({
                message: 'membre bien sauvegardée!',
                position: 'top',
                duration: 1000
              });
              this.action  = 'detail';
              toast.present();
              this.centres = [];
              this.reinitVar()
              //toast.present();
              }).catch((err) => alert('erreur mise à jour photo: '+err));
  
              /*if(actu_ch_es){
                this.chargerMesChamps(this.membre.doc.data.matricule_Membre);
                this.chargerMesEssai(this.membre.doc.data.matricule_Membre);
                actu_ch_es = false;
              }*/
              
            // this.reinitForm();
            }else if(!this.photoID && this.imageData  && this.imageData != ''){
             
              //creation
              //let ida = 'fuma:photo:membre:'+ membre.matricule_Membre;
              this.membre.photoID = ida;
              var doc = {
              // _id: ida,
                _attachments: {},
                photoID: ida,
                timestamp: new Date().toString(),
                type: 'photo',
                code_union: this.membre.doc.data.code_union,
                code_centre: this.membre.doc.data.code_centre
              }
  
              //this.imageBlob = this.getBase64Image(document.getElementById("imageid"));
  
            this.fileName = ida + '.jpeg';
              doc._attachments[this.fileName] = {
                content_type: 'image/jpeg', 
                data: this.imageData
              }
  
              //this.servicePouchdb.createDoc(doc)
            this.servicePouchdb.put(doc, ida).then((res) => {
              this.membre.photo = this.photo;
              this.membre.photoDocId = ida;
              this.membre.photoDocRev = res.rev;
              //this.membre = grandMembre;
  
              //this.detailMembre = true;
              //this.detail(this.grandMembre, this.selectedSource)
              let toast = this.toastCtl.create({
                message: 'membre bien sauvegardée!',
                position: 'top',
                duration: 1000
              });
              //this.action  = 'detail';
              
              toast.present();
              this.detail(this.membre)
              this.centres = [];
              this.reinitVar()
          
              this.membres.forEach((m, i) => {
                if(m.doc._id === this.membre.doc._id){
                  this.membres[i] = this.membre;
                  //this.allMembres = this.membres;
                }
              });
  
              this.allMembres.forEach((m, i) => {
                if(m.doc._id === this.membre.doc._id){
                  this.allMembres[i] = this.membre;
                  //this.allMembres = this.membres;
                }
              });
  
              this.allMembres1.forEach((m, i) => {
                if(m.doc._id === this.membre.doc._id){
                  this.allMembres1[i] = this.membre;
                  //this.allMembres = this.membres;
                }
              });
              //toast.present();
              //this.reinitForm();
            });
  
  
            }else{
             
              //this.membre = grandMembre;
  
              //this.modifierForm = false;
              //this.ajoutForm = false;
              //this.detailMembre = true;
              //this.detail(this.grandMembre, this.selectedSource)
              /*if(actu_ch_es){
                  this.detail(this.grandMembre, true);
                  actu_ch_es = false;
                }else{
                  this.detail(this.grandMembre, false)
                }*/

                let toast = this.toastCtl.create({
                  message: 'membre bien sauvegardée!',
                  position: 'top',
                  duration: 1000
                });
                //this.action  = 'detail';

                toast.present();
                //this.detail(this.membre)
                this.detail(this.membre)
                this.centres = [];
                this.reinitVar()
              
              this.membres.forEach((m, i) => {
                if(m.doc._id === this.membre.doc._id){
                  this.membres[i] = this.membre;
                  //this.allMembres = this.membres;
                }
              });
  
              this.allMembres.forEach((m, i) => {
                if(m.doc._id === this.membre.doc._id){
                  this.allMembres[i] = this.membre;
                  //this.allMembres = this.membres;
                }
              });
  
              this.allMembres1.forEach((m, i) => {
                if(m.doc._id === this.membre.doc._id){
                  this.allMembres1[i] = this.membre;
                  //this.allMembres = this.membres;
                }
              });
  
            /* if(actu_ch_es){
                this.chargerMesChamps(this.membre.doc.data.matricule_Membre);
                this.chargerMesEssai(this.membre.doc.data.matricule_Membre);
                actu_ch_es = false;
              }*/
  
              //this.reinitForm();
  
              
              //toast.present();
            }





          //this.membre = this.grandemembre
          /*let toast = this.toastCtl.create({
            message: 'membre bien sauvegardée!',
            position: 'top',
            duration: 1000
          });
          this.action  = 'detail';
          toast.present();
          this.centres = [];
          this.reinitVar()*/
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

  
  getAllMembresSansPhoto(){
    
    //this.rechercher = true;
     // this.membres = [];
      this.servicePouchdb.getPlageDocsRapide('membre','membre:\uffff').then((membres) => {
        if(membres){
          this.allMembres1 = membres;
          /*if(this.id_centre && this.id_centre != ""){
            let uns: any= [];
            membres.forEach((u) => {
              if(u.doc.data.id_centre && u.doc.data.id_centre == this.id_centre){
                uns.push(u)
              }
            });
            //this.membres = uns;
            this.allMembres = uns;
            this.rechercher = false;
          }else{
            this.membres = membres;
            this.allMembres = membres;
            this.rechercher = false;
          }*/
          
          //this.allMembres1 = membres;
         
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
          if(this.action == 'ajouter' && this.id_centre){
            this.getMatriculeMembre(this.id_centre)
            //alert(this.matricule_membre)
          }else if(this.action == 'ajouter'){
            this.matricule_membre = '';
          }
        }
      }).catch((err) => console.log(err)); 
  }


  ionViewDidEnter() {

    if(!this.estInitierMemebre){
      this.getInitMemebre();
      this.getInfoSimEmei();
      this.estInitierMemebre = true;
    }
    //this.getAllMembres();
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


  getInitMemebre(refresher: any = ''){
    //this.rechercher = true;
    this.refresher = refresher;
      if(this.selectedLimit === 'Tous'){
        this.getMembres('membre', 'membre:\uffff');
        //this.getAllMembresSansPhoto()
        }else{
           this.getMembresAvecLimite('membre', 'membre:\uffff', this.selectedLimit);
           //this.getAllMembresSansPhoto()
           //this.getAllMembres('fuma:op:membre', 'fuma:op:membre:\uffff');
        }

    /*this.servicePouchdb.getPlageDocsRapide('fuma:op:membre','fuma:op:membre:\uffff').then((mbrsA) => {
          this.allMembres1 = mbrsA.concat(mbrsK);
      }, err => console.log(err)); */  
    
    //this.chargerOp();

  }

  collect(){
    this.navCtrl.push('CollectPage')
  }


  ajouter(){

    this.clearFile();
    this.photoID = '';
    this.photoRev = '';
    this.imageData = '';
    this.imageBlob = '';
    this.date_maissance_membre = '';
    this.age = null;
    /*if(this.id_centre){
      this.matricule_membre = this.getMatriculeMembre(this.id_centre)
    }else{
      this.matricule_membre = '';
    }*/
    this.chargerPays();
    this.initForm();
    this.getInfoSimEmei();
    this.action = 'ajouter';
    this.getAllCentre();
      //this.navCtrl.push('AjoutermembrePage', {'confLocaliteEnquete': confLocaliteEnquete});    
  }

  editer(membre){

    this.photoID = membre.photoDocId;
    this.photoRev = membre.photoDocRev;
    if(membre.photo && membre.photo != ''){
      this.photo = membre.photo;
    }else
      this.photo = this.sanitizer.bypassSecurityTrustUrl('assets/images/no-photo.png');
    this.chargerPays();
    this.chargerSousLocalite(membre.doc.data.pays, 'pays')
    this.chargerSousLocalite(membre.doc.data.region, 'region')
    this.chargerSousLocalite(membre.doc.data.departement, 'departement')
    this.chargerSousLocalite(membre.doc.data.commune, 'commune')
    this.editForm(membre.doc);
    this.getAllCentre();
    this.getInfoSimEmei();
    this.action = 'modifier';
    this.copiemembre = this.clone(membre);
      //this.navCtrl.push('AjoutermembrePage', {'confLocaliteEnquete': confLocaliteEnquete});    
  }

  /*modifier(){
    this.getInfoSimEmei();
    this.action = 'modifier';
    //this.navCtrl.push('AjoutermembrePage', {'confLocaliteEnquete': confLocaliteEnquete});    
  }*/

 

  detail(membre){
    this.membre = membre;
    if(this.membre.doc.data.matricule_membre && this.membre.doc.data.matricule_membre != ''){
      var membreID=this.membre.doc.data.matricule_membre; //|| 'chargement...'
      JsBarcode(this.barcode.nativeElement, membreID,{
        width: 1,
        height:35
      });
    }
    
    if(this.membre.doc.data.date_maissance_membre && this.membre.doc.data.date_maissance_membre != ''){
      let date1: any = new Date().getFullYear();
      let date2 : any = new Date(this.membre.doc.data.date_maissance_membre).getFullYear();
      this.age = date1 - date2;
    }else{
      this.age = null;
    }
    this.action = 'detail';
    //this.navCtrl.push('DetailmembrePage', {'membre': membre, 'selectedSource': selectedSource});
  }

  getItems(ev: any) {
    // Reset items back to all of the items
    this.membres = this.allMembres;

    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.membres = this.membres.filter((item) => {
        if(this.typeRecherche === 'nom'){
          return (item.doc.data.nom_membre.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }else if(this.typeRecherche === 'prenom'){
          return (item.doc.data.prenom_membre.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }else if(this.typeRecherche === 'matricule'){
           return (item.doc.data.matricule_membre.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }else if(this.typeRecherche === 'code_centre'){
          return (item.doc.data.code_centre.toLowerCase().indexOf(val.toLowerCase()) > -1);
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


  supprimer(membre){
    let alert = this.alertCtl.create({
      title: 'Suppression membre',
      message: 'Etes vous sûr de vouloir supprimer cette membre ?',
      buttons:[
        {
          text: 'Annuler',
          handler: () => console.log('suppression annulée')
 
        },
        {
          text: 'Confirmer',
          handler: () => {
            this.servicePouchdb.deleteDoc(membre);
            let toast = this.toastCtl.create({
              message:'membre bien suppriée',
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

}
