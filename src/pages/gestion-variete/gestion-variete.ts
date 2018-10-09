import { Component } from '@angular/core';
import { NavController, IonicApp, ToastController, NavParams, LoadingController, ViewController, App, AlertController, Platform, ModalController, IonicPage, MenuController, Events  } from 'ionic-angular';
import { PouchdbProvider } from '../../providers/pouchdb-provider';
import { Storage } from '@ionic/storage'; 
import { File } from '@ionic-native/file';
import { global } from '../../global-variables/variable';
import * as FileSaver from 'file-saver';
import { Printer, PrintOptions } from '@ionic-native/printer';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Device } from '@ionic-native/device';
import { Sim } from '@ionic-native/sim';
import { VariteteType } from '../../app/variete.class'

declare var cordova: any;

/**
 * Generated class for the GestionVarietePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-gestion-variete',
  templateUrl: 'gestion-variete.html',
})
export class GestionVarietePage {

  varietes: any = [];
  allVarietes: any = [];
  id: any = '';
  loading: boolean = true;
  rechercher: any = false;
  detailVariete: boolean = false;
  selectedStyle: any = 'liste';
  variete: any;
  variete1: any;
  varieteAModifier: any;
  grandVariete: any;
  varieteForm: any;
  annee_obtension: any = '';
  designation: any = '';
  culture: any;
  cultures: any;
  selectedCulture: any;
  myCulture: any;
  selectedLimit: any = 10;
  limits: any = [10, 25, 50, 100, 500, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 'Tous'];
  today: any;
  typeRecherche: any = 'dénomination';
  imei: any = '';
  phonenumber: any = '';
  user: any = global.info_user;
  global:any = global;
  estManager: boolean = false;
  estAnimataire: boolean = false;
  aProfile:boolean = false;
  modifierFrom: boolean = false;
  estInstancier: boolean = false;
  ajoutForm: boolean = false;
  Variete: VariteteType;
  dateAjout:any;
  nature_genetiques: any = ['Lignée', 'Population améliorée', 'Population sélectionnée', 'Population locale améliorée', 'Population locale', 'Variété population', 'Population locale sélectionnée', 'Hybride', 'Variété S)']


  constructor(public navCtrl: NavController, public loadtingCtl: LoadingController, public toastCtl: ToastController, public ionicApp: IonicApp, public viewCtl: ViewController, public formBuilder: FormBuilder, public sim: Sim, public device: Device, public modelCtl: ModalController, public a: App, public events: Events, public navParams: NavParams, public menuCtl: MenuController, public printer: Printer, public file: File, public platform: Platform, public storage: Storage, public servicePouchdb: PouchdbProvider, public alertCtl: AlertController) {
  
    this.menuCtl.enable(false, 'options');
      this.menuCtl.enable(false, 'connexion');
      this.menuCtl.enable(false, 'profile');
      
    
      if(navParams.data.culture){
        this.selectedCulture = navParams.data.culture;
        this.culture = navParams.data.culture.data.nom;
        this.myCulture = this.culture;
        //alert(this.culture +'  '+this.myCulture) 
      }
    events.subscribe('user:login', (user) => {
        if(user){
          this.aProfile = true;
          this.estMangerConnecter(user)
          this.estAnimataireConnecter(user)
        }else{
          this.aProfile = false;
          this.estManager = false;
          this.estAnimataire = false;
          this.user = global.info_user;
        }
        //alert(user)
        /*this.servicePouchdb.remoteSaved.getSession((err, response) => {
          if (response.userCtx.name) {
            //this.aProfile = true;
            this.user = global.info_user;
          }else{
            this.aProfile = false;
            this.user = {};
          }
        }, err => console.log(err));*/
      });
  
  }
  
    dismiss(){
      this.viewCtl.dismiss(/*this.varietes*/);
      //this.a_matricule = false;
    }
    closeToast(){
     let toast = this.ionicApp._toastPortal.getActive();
      toast.dismiss();
    }
    estMangerConnecter(user){
      if(user && user.roles){
        this.estManager = global.estManager(user.roles);
      }
    }
  
     estAnimataireConnecter(user){
      if(user && user.roles){
        this.estAnimataire = global.estAnimataire(user.roles);
      }
    }
  
     initForm(){
      let maDate = new Date();
      //this.dateAjout = maDate;
       let today = this.createDate(maDate.getDate(), maDate.getMonth(), maDate.getFullYear());
       this.varieteForm = this.formBuilder.group({
       // _id:[''],
        type:['variete'],
        culture:['', Validators.required],
        designation: ['', Validators.required],
        //today: [today],
        //id_site:['', , Validators.required],
        annee_obtension:['', Validators.required],
        //id_village:['', , Validators.required],
        cycle_semis:['', Validators.required], 
        rendement: [''],
        longueur_epi: ['', Validators.required],
        forme_epi: [''],
        foreur_tige: [''],
        //id_classe_producteur: [''],
        chenille_epi: [''],
        //id_traitement: [''],
        miidiou: [''],
        lieu_obtension: [''],
        tel: [''],
        cel: [''],
        email: [''],
        today: [today],
        deviceid: [''],
        imei: [''],
        phonenumber: [''],
        start: [maDate.toJSON()],
        end: ['']
      });
  
      //this.getAllCultures();
      
    }
  
    getAllCultures(){
      this.servicePouchdb.getPlageDocsRapide('culture:', 'culture:\uffff').then((c) => {
        if(c){
            this.cultures = c;
        }
      });
    }
  
    getInfoSimEmei(){
      this.sim.getSimInfo().then(
          (info) => {
            if(info.cards.length > 0){
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
  
  
    reinitForm(){
      /*let maDate = new Date();
      //this.dateAjout = maDate;
      this.today = this.createDate(maDate.getDate(), maDate.getMonth(), maDate.getFullYear());
  
      if(!this.selectedCulture){
        this.culture = '';
      }
      
      this.designation = '';
      //this.chargerChamps('');
      this.annee_obtension = '';
      this.cycle_semis = '';
      
      this.rendement = '';
      this.longueur_epi = '';
      this.forme_epi = '';
      this.foreur_tige = '';
      //nom producteur
      this.chenille_epi = '';
      this.miidiou = '';
      this.lieu_obtension = '';
      this.tel = '';
      this.cel = '';
      this.email = '';*/
    }
  
  generateId(){
      var chars='ABCDEFGHIJKLMNPQRSTUVWYZ'
      var numbers='0123456789'
      var randomArray=[]
      for(let i=0;i<5;i++){
        var rand = Math.floor(Math.random()*10)
        randomArray.push(numbers[rand])
      }
      randomArray.push('-')
      for(let i=0;i<5;i++){
        var rand = Math.floor(Math.random()*24)
        randomArray.push(chars[rand])
      }
      
      var randomString=randomArray.join("");
      var Id= /*+pays+'-'+region+'-'+department+'-'+commune +'-' +village+ */''+randomString 
      return Id;
    }
  
    valider(Variete: VariteteType){
      let msg = '';
      if(!Variete.culture || Variete.culture == ''){
        msg += '\nLa culture est vide !'
      }
      if(!Variete.denomination || Variete.denomination == ''){
        msg += '\nLa dénomination est vide !'
      }
  
      return msg;
    }
  
      actionForm(){
        if(this.valider(this.Variete) === ''){
          if(this.ajoutForm && !this.modifierFrom){
            let date = new Date();
            //let variete = this.varieteForm.value;
             this.Variete.deviceid = this.device.uuid;
             this.Variete.phonenumber = this.phonenumber;
             this.Variete.imei = this.imei; 
             this.Variete.update_deviceid = this.device.uuid;
             this.Variete.update_phonenumber = this.phonenumber;
             this.Variete.update_imei = this.imei;
             
             //union._id = 'fuma'+ id;
             this.Variete.end = date.toJSON();
             //variete.code_essai = id;
             //champs.id_champs = id;
           
             let varieteFinal: any = {};
             varieteFinal._id = 'variete:'/*+this.culture+':'*/+ this.id;
             varieteFinal.data = this.Variete
             let EF: any;
             this.servicePouchdb.createDocReturn(varieteFinal).then((res) => {
               /* let toast = this.toastCtl.create({
                   message: 'Essai bien enregistré!',
                   position: 'top',
                   duration: 1000
                 });*/
                 
                 
                 //alert(res.rev)
                 varieteFinal._rev = res.rev;
                 let E: any = {};
                 E.doc = varieteFinal;
                 
                 //this.viewCtl.dismiss(essaiFinal);
               // this.zone.run(() => {
                 this.varietes.push(E);
               });
   
              
               this.ajoutForm = false;
               this.reinitForm();
               
   
               //this.navCtrl.pop();
               //toast.present();
               
   
         // }
         }else if(this.modifierFrom){
           let date = new Date();
           /*let variete = this.varieteForm.value;
           this.variete1.culture = variete.culture;
           this.variete1.designation = variete.designation;
           this.variete1.annee_obtension = variete.annee_obtension;
           //today: [today],
           //id_site:['', , Validators.required],
           this.variete1.cycle_semis = variete.cycle_semis;
           //id_village:['', , Validators.required],
           this.variete1.rendement = variete.rendement; 
           this.variete1.longueur_epi = variete.longueur_epi;
           this.variete1.forme_epi = variete.forme_epi;
           this.variete1.foreur_tige = variete.foreur_tige;
           this.variete1.chenille_epi = variete.chenille_epi;
           //id_classe_producteur: [''],
           this.variete1.miidiou = variete.miidiou;
           this.variete1.lieu_obtension = this.lieu_obtension;
           //id_traitement: [''],
           this.variete1.tel = variete.tel;
           this.variete1.cel = variete.cel;
           this.variete1.email = variete.email;*/
           this.Variete.update_deviceid = this.device.uuid;
           this.Variete.update_phonenumber = this.phonenumber;
           this.Variete.update_imei = this.imei;
         
           //let essaiFinal: any = {};
           this.grandVariete.data = this.Variete;
           this.servicePouchdb.updateDocReturn(this.grandVariete).then((res) => {
             this.grandVariete._rev = res.rev;
             this.variete = this.grandVariete;
             //this.essais[this.essais.indexOf(this.essaiAModifier)] = e;
             
             
             this.reinitFormModifier();
             this.modifierFrom = false;
             this.detailVariete = true
             this.ajoutForm = false;
   
           
           let e: any = {};
             e.doc = this.variete;
             this.varietes.forEach((es, i) => {
               if(es.doc._id === this.varieteAModifier._id){
                 this.varietes[i] = e ;
               }
               
             });
           });
         }
       
        }else{
          alert(this.valider(this.Variete));
        }
        
    }
  
    annuler(){
        this.ajoutForm = false;
  
      if(this.modifierFrom){
        this.modifierFrom = false;
        this.ajoutForm = false;
        this.detailVariete = true;
        this.reinitFormModifier();
      } 
    }
  
    fermerDetail(){
        this.detailVariete = false;
        //this.essai = {};
      
    }
  
    supprimer(variete){
      let e: any = {};
      let alert = this.alertCtl.create({
        title: 'Suppression variété',
        message: 'Etes vous sûr de vouloir supprimer cette variété ?',
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
                this.servicePouchdb.deleteReturn(variete).then((res) => {
                  //let e: any = {};
                  //e.doc = essai;
                  this.varietes.forEach((es, i) => {
                    if(es.doc._id === variete._id){
                      this.varietes.splice(i, 1);
                    }
                    
                  });
    
                  this.detailVariete = false;
                  //this.navCtrl.pop();
                }, err => {
                  console.log(err)
                }) ;
              }else{
                this.servicePouchdb.deleteDocReturn(variete).then((res) => {
                  //let e: any = {};
                  //e.doc = essai;
                  this.varietes.forEach((es, i) => {
                    if(es.doc._id === variete._id){
                      this.varietes.splice(i, 1);
                    }
                    
                  });
    
                  this.detailVariete = false;
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
  
  
     sync(){
      this.servicePouchdb.syncAvecToast(this.getVarietes());
      //this.pourCreerForm();
    }
  
    exportExcel(){
  
      let date = new Date();
      //let dateHeure = date.toLocaleDateString()+ date.toLocaleTimeString();// + date.getTime().toLocaleString();
      let nom = date.getDate().toString() +'_'+ (date.getMonth() + 1).toString() +'_'+ date.getFullYear().toString() +'_'+ date.getHours().toString() +'_'+ date.getMinutes().toString() +'_'+ date.getSeconds().toString();
  
      let blob = new Blob([document.getElementById('tableau').innerHTML], {
        //type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
        type: "text/plain;charset=utf-8"
        //type: 'application/vnd.ms-excel;charset=utf-8'
        //type: "application/vnd.ms-excel;charset=utf-8"
      });
  
      if(!this.platform.is('android')){
        FileSaver.saveAs(blob, 'Varietes_'+nom+'.xls');
      }else{
  
        let fileDestiny: string = cordova.file.externalRootDirectory;
        this.file.writeFile(fileDestiny, 'Varietes_'+nom+'.xls', blob).then(()=> {
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
      let content = document.getElementById('tableau').innerHTML;
      this.printer.print(content, options);
    }
  
  
     ionViewDidEnter(){
          //this.getEssais()
      /*this.servicePouchdb.remoteSaved.getSession((err, response) => {
          if (err) {
            this.aProfile = false;
          } else if (!response.userCtx.name) {
            this.aProfile = false;
          } else {
            this.aProfile = true;
          }
        });*/
      
  
      //setInterval(this.servicePouchdb.testConnexion(), 2000)
      if(!this.estInstancier){
        //this.getVarietes();
        this.initVariable();
        this.estInstancier = true;
      }
      
      //this.pourCreerForm();
      this.getInfoSimEmei();
      this.estInstancier = true;
  
      ///this.corrigerErreur();
      //this.servicePouchdb.findByTypeData()
    }
  
    ionViewDidLoad() { 
  
      //this.initForm();
  
    }
  
  
    choixLimit(){
      this.rechercher = true;
      if(this.selectedLimit !== 'Tous'){
        this.varietes = this.allVarietes.slice(0, this.selectedLimit);
        this.rechercher = false;
      }else{
        this.varietes = this.allVarietes;
        this.rechercher = false;
      }
      
    }
  
    choixLimit1(){
      this.rechercher = true;
  
      if(this.selectedLimit === 'Tous'){
        this.servicePouchdb.getPlageDocsRapide('variete', 'variete:\uffff').then((v) => {
          if(v){
              this.varietes = v;
              this.allVarietes = v;
              this.rechercher = false;
          }else{
            this.rechercher = false;
          }
        });
  
        }else{
          this.servicePouchdb.getPlageDocsRapideAvecLimit('variete', 'variete:\uffff', this.selectedLimit).then((v) => {
            if(v){
              this.varietes = v;
              this.allVarietes = v;
              this.rechercher = false;
            }else{
              this.rechercher = false;
            }
  
          });
  
      }
    }
  
    initVariable(){
      this.servicePouchdb.getPlageDocsRapide('culture:', 'culture:\uffff').then((c) => {
        if(c && c.length > 0){
            this.cultures = c;
            if(!this.selectedCulture || !this.culture){
              this.myCulture = this.cultures[0].doc.data.nom;
              this.culture = this.myCulture;
            }else{
              this.myCulture = this.culture;
            }
            
            this.getVarietes();
        }
      });
    }
  
    chargerVariete(myCulture){
      this.culture = myCulture;
      this.getVarietes();
    }
  
     getVarietes(refresher: any = ''){
      if(refresher === ''){
        this.rechercher = true;
      }
  
  
  
      if(this.selectedLimit === 'Tous'){
        // this.servicePouchdb.getPlageDocs('essai', 'essai:\uffff').then((e) => {
          //   if(e){
              //cas ou le producteur est connu
  
                this.servicePouchdb.getPlageDocsRapide('variete', 'variete:\uffff').then((v) => {
                  if(v){
                    let cls: any = [];
                    if(this.selectedCulture || this.myCulture){
                      v.forEach((cl) => {
                        if(this.culture == cl.doc.data.culture){
                          cls.push(cl);
                        }
                      });
  
                      this.varietes = cls;
                      //this.allVarietes = v;
                      this.allVarietes = cls;
                      this.rechercher = false;
                      if(refresher !== ''){
                      refresher.complete();
                      }
  
                    }else{
                       this.varietes = v;
                        this.allVarietes = v;
                        this.rechercher = false;
                        if(refresher !== ''){
                        refresher.complete();
                        }
                    }
                  }else{
                    this.rechercher = false;
                    if(refresher !== ''){
                      refresher.complete();
                    }
                  }
                });
  
          
          //  }
          // });
        }else{
  
      
            this.servicePouchdb.getPlageDocsRapideAvecLimit('variete', 'variete:\uffff', this.selectedLimit).then((v) => {
              if(v){
  
                let cls: any = [];
                    if(this.selectedCulture || this.myCulture){
                      v.forEach((cl) => {
                        if(this.culture == cl.doc.data.culture){
                          cls.push(cl);
                        }
                      });
  
                      this.varietes = cls;
                      //this.allVarietes = v;
                      this.rechercher = false;
                      if(refresher !== ''){
                      refresher.complete();
                      }
  
                    }else{
                       this.varietes = v;
                        //this.allVarietes = v;
                        this.rechercher = false;
                        if(refresher !== ''){
                        refresher.complete();
                        }
                    }
               /* this.varietes = v;
                //this.allEssais = e;
                this.rechercher = false;
                if(refresher !== ''){
                  refresher.complete();
                }*/
              }else{
                this.rechercher = false;
                if(refresher !== ''){
                  refresher.complete();
                }
              }
  
            });
  
            this.servicePouchdb.getPlageDocsRapide('variete', 'variete:\uffff').then((v) => {
              if(v){
  
  
                let cls: any = [];
                if(this.selectedCulture || this.myCulture){
                  v.forEach((cl) => {
                    if(this.culture == cl.doc.data.culture){
                      cls.push(cl);
                    }
                  });
  
                  this.allVarietes = cls;
  
                }else{
                    this.allVarietes = v;
                    //this.allVarietes = v;
                }
  
                
                //this.allVarietes = v;
                //this.rechercher = false;
              }
            });
  
        }
    }
  
  
    editer(variete, dbclick: boolean = false){
      if(!dbclick || (dbclick && this.user && this.user.roles && global.estAnimataire(this.user.roles))){
        this.grandVariete = variete;
        this.Variete = new VariteteType();
        //this.variete1 = this.grandVariete.data;
        this.Variete = this.grandVariete.data;
        if(this.navParams.data.culture){
          this.Variete.culture = this.navParams.data.culture.data.nom;
        }
        //this.nom_producteur = this.variete1.nom_producteur;
        /*this.today = this.variete1.today;
        this.designation = this.variete1.designation;
        this.annee_obtension = this.variete1.annee_obtension;
        this.cycle_semis = this.variete1.cycle_semis;
        this.rendement = this.variete1.rendement;
        this.longueur_epi = this.variete1.longueur_epi;
        this.forme_epi = this.variete1.forme_epi;
        this.foreur_tige = this.variete1.foreur_tige;
        this.miidiou = this.variete1.miidiou;
        this.chenille_epi = this.variete1.chenille_epi;
        this.lieu_obtension = this.variete1.lieu_obtension;
        this.tel = this.variete1.tel;
        this.cel = this.variete1.cel;
        this.email = this.variete1.email;
        if(this.variete1.culture){
          this.culture = this.variete1.culture;
        }*/
        
        
        
        //this.today = this.variete1.today;
        
        
        
        //this.navCtrl.push('ModifierEssaiPage', {'essai': essai});
        this.detailVariete = false;
  
        this.ajoutForm = true;
  
        this.modifierFrom = true;
        this.varieteAModifier = variete;
     }
    }
  
    reinitFormModifier(){
      this.grandVariete = '';
      this.variete1 = '';
     /* if(!this.selectedCulture){
        this.culture = '';
      }
      this.designation = '';
      this.annee_obtension = '';
      this.cycle_semis = '';
      this.rendement = '';
      this.longueur_epi ='';
      this.miidiou ='';
      this.chenille_epi = '';
      this.foreur_tige = '';
      this.forme_epi ='';
      this.tel = "";
      this.cel = '';
      this.email = '';
      this.lieu_obtension = '';*/
    }
  
  
     ajouter(){
  
        let maDate = new Date();
        this.today = this.createDate(maDate.getDate(), maDate.getMonth(), maDate.getFullYear());
        this.id = this.generateId();
  
        this.Variete = new VariteteType();
        this.Variete.start = maDate.toJSON();
        this.Variete.today = this.today;
        if(this.navParams.data.culture){
          this.Variete.culture = this.navParams.data.culture.data.nom;
        }
        //this.getAllCultures();
        this.ajoutForm = true;
        
    }
  
  
   detail(variete){
      this.variete = variete;
  
      this.detailVariete = true;
  
    }
    
  
  
    getItems(ev: any) {
      // Reset items back to all of the items
      //this.essais = this.allEssais;
  
      // set val to the value of the searchbar
      let val = ev.target.value;
  
      // if the value is an empty string don't filter the items
      if (val && val.trim() != '') {
        this.varietes = this.allVarietes.filter((item, index) => {
          if(this.typeRecherche === 'dénomination'){
            return (item.doc.data.denomination.toLowerCase().indexOf(val.toLowerCase()) > -1);
          }else if(this.typeRecherche === 'nature_genetique'){
            return (item.doc.data.nature_genetique.toLowerCase().indexOf(val.toLowerCase()) > -1);
          }else if(this.typeRecherche === 'obtenteur'){
            return (item.doc.data.obtenteur.toLowerCase().indexOf(val.toLowerCase()) > -1);
          }else if(this.typeRecherche === 'mainteneur'){
            return (item.doc.data.mainteneur.toLowerCase().indexOf(val.toLowerCase()) > -1);
          }
        });
      }else{
        this.choixLimit();
      }
    } 
   

}
