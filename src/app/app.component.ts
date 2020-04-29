import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, ModalController, App, Events, IonicApp, MenuController, ToastController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { PouchdbProvider } from '../providers/pouchdb-provider';
import { global } from '../global-variables/variable';
import { Storage } from '@ionic/storage';

//import { TabsPage } from '../pages/tabs/tabs';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = 'TabsPage';
  @ViewChild(Nav) nav: Nav;
  pages: Array<{title: string, component: any, role: string}>;
  profiles: Array<{title: string, component: any}>; 
  connexions: Array<{title: string, component: any}>; 
  name: any;
  quiter: boolean = false;
  user: any = global.info_user;
  global:any = global;
  mon_role = '';
  infoApp: any = "Infos de l\'App";

  constructor(public platform: Platform, public toastCtl: ToastController, public ionicApp: IonicApp, public app: App, public events: Events, public modalCtl: ModalController, public storage: Storage, public gestionService: PouchdbProvider, public menuCtrl: MenuController, public statusBar: StatusBar, public splashScreen: SplashScreen) {
    
    
      //this.chergerInfoDB();
      //back button handle
      //Registration of push in Android and Windows Phone
      this. chergerInfoDB();
      var lastTimeBackPress = 0;
      var timePeriodToExit  = 2000;

      platform.registerBackButtonAction(() => {
          // get current active page
          let nav = this.app.getActiveNav()
          let activeModal = this.ionicApp._modalPortal.getActive() || 
                            this.ionicApp._loadingPortal.getActive() ||
                            this.ionicApp._overlayPortal.getActive();// ||
                            //this.ionicApp._toastPortal.getActive();
          
          if(activeModal){
            //close modal or alert or loading
            activeModal.dismiss();
          }else if (nav.canGoBack()) {
              // go to previous page
              nav.pop();
          } else {
              //Double check to exit app
              if (new Date().getTime() - lastTimeBackPress < timePeriodToExit) {
                  this.platform.exitApp(); //Exit from app
              } else {
                  this.affMsg('Appuyez sur la touche retour à nouveau pour quitter!')
                  lastTimeBackPress = new Date().getTime();
              }
          }
      });

     
      this.chargerInfo();

      
    events.subscribe('user:login', user => {
      if(user && user.roles){
        this.user = user;
        //this.setPage();
        this.quelEstMonRole(user.roles)
      }else{
        if(this.global.info_user && this.global.info_user != {}){
          this.user = this.global.info_user;
        }else{
          this.mon_role = 'user';
        }
        
        //alert('dec '+this.mon_role)
        //this.quelEstMonRole(null)
      }
    })

  //this.gestionService.testConnexion();

  //tester le status de la connexion
  function testConnexion () {
    if(global.remoteSaved){
      global.remoteSaved.getSession((err, response) => {
        if (err) {
          // network error
          events.publish('user:login');
          //alert('network')
        } else if (!response.userCtx.name) {
          // nobody's logged in
          events.publish('user:login');
          //alert('nobady')
        } else {
          // response.userCtx.name is the current user
          events.publish('user:login', response.userCtx);
          //alert(response.userCtx.name)
        }
      });
    }
  }
  //tester le status de la connexion tous les 10 minutes
  // Interval en milliseconde 600000 = 10 minutes
    setInterval(testConnexion, 600000)
/*
  this.setPage();

  this.storage.get('langue').then((langue) => {
    if(langue){
      this.rootPage = TabsPage
    }else{
      this.rootPage = HomePage;
    }
  }, err => this.rootPage = HomePage)*/

    
    
    /*platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });*/
    this.pages = [
      //{ title: 'Changer la langue', component: 'HomePage' },
      { title: 'Gestion des utilisateurs', component: 'UsersManagementPage', role: 'admin'},
      { title: 'Fédérations', component: 'GestionFederationPage', role: 'animataire' },
      { title: 'Unions', component: 'GestionUnionPage', role: 'animataire' },
      { title: 'OPs', component: 'GestionOpPage', role: 'animataire' },
      //{ title: 'Membres', component: 'MembrePage' },
      { title: 'Cultures', component: 'CulturePage', role: 'animataire' },
      { title: 'Variétés', component: 'GestionVarietePage', role: 'animataire' },
      //{ title: 'Gestion composantes', component: 'ComposantePage' },
      { title: 'Types produits', component: 'TypeProduitPage', role: 'animataire' },
      { title: 'Produits', component: 'GestionProduitPage', role: 'animataire' },
      { title: 'Evaluations produits', component: 'EvaluationPage', role: 'animataire' },
      { title: 'Inventaire', component: 'StockPage', role: 'animataire' },
      { title: 'Pertes', component: 'ProduitGatePage', role: 'animataire' },
      //{ title: 'Gestion pays', component: 'GestionPaysPage' },
      //{ title: 'Gestion régions', component: 'GestionRegionPage' },
      //{ title: 'Gestion departements', component: 'GestionDepartementPage' },
      //{ title: 'Gestion communes', component: 'GestionCommunePage' },
      //{ title: 'Gestion village', component: 'GestionVillagePage' },
      { title: 'Admin', component: 'AdminPage', role: 'any' },
    ];

    this.profiles = [
      /*{ title: 'Connexion', component: LoginPage },
      { title: 'Connexion', component: LoginPage },
      { title: 'Enregistrement', component: RegisterPage },*/
      //{ title: 'Profile', component: ProfileUserPage },
      { title: 'Profile', component: 'ProfileUserPage' },
      { title: 'Déconnexion', component: '' }
    ];

this.connexions = [
      /*{ title: 'Connexion', component: LoginPage },
      { title: 'Connexion', component: LoginPage },
      { title: 'Enregistrement', component: RegisterPage },*/
      //{ title: 'Connexion', component: LoginPage },
      { title: 'Connexion', component: 'LoginPage' },
      { title: 'Creéer un compte', component: 'RegisterPage' },
    ];
  }


  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    //this.nav.push(page.component);
   /****** let modal = this.modalCtl.create(page.component)
    modal.present();
*/
    if(page.component){
      let modal = this.modalCtl.create(page.component);
      modal.present();
      this.menuCtrl.close();
       /*modal.onDidDismiss(() => {
       EssaiPage.prototype.ionViewWillEnter();
      })*/
    }else if(page.title === 'Déconnexion'){
       this.gestionService.logout();
       global.estConnecte = false; 
       this.menuCtrl.close();
       //this.enableUnAuthenticatedMenu();
     }else{
      this.gestionService.logout();
      this.menuCtrl.close();
      global.estConnecte = false; 
      //EssaiPage.prototype.ionViewWillEnter();
    } 
  }

  
  quelEstMonRole(role){

    if(role){
      if(global.estAdmin(role)){
        this.mon_role = 'admin';
      }else if(global.estManager){
        this.mon_role = 'moderateur';
      }else if(global.estAnimataire){
        this.mon_role = 'animataire';
      }else{
        this.mon_role = 'user';
      }
    }else{
        this.mon_role = 'user';
      }
    
        
    }
           
  chergerInfoDB(){
    this.storage.get('TRAP_info_db').then((info_db) => {
      if(info_db){
        global.info_db.ip = info_db.ip;
        global.info_db.nom_db =  info_db.nom_db;
        //alert(global.info_db.ip+'   '+global.info_db.nom_db)
      }
    }).catch((err) => console.log(err));
  }
            

  close(){
    this.menuCtrl.close()
     this.menuCtrl.enable(false, 'options');
    this.menuCtrl.enable(false, 'connexion');
    this.menuCtrl.enable(false, 'profile');
  }

  affMsg(msg){
    let toast = this.toastCtl.create({
      message: msg,
      position: 'middle',
      duration: 3000
    });

    toast.present();
  }

/*
  setPage(){

    this.pages = [ 
            { title: 'Infos de l\'App', component: 'InfoAppPage', role: 'any' },
            //{ title: 'Config app', component: 'ConfigAppPage', role: 'any' },
            { title: 'Changer la langue', component: 'LanguePage', role: 'any' },
            { title: 'Gestion des utilisateurs', component: 'UsersManagementPage', role: 'admin'},
            { title: 'Formulaires ODK', component: 'CollectPage', role: 'animataire' },
            { title: 'Config Localité Enquete', component: 'ConfLocaliteEnquetePage', role: 'animataire' },
            { title: 'Gestion types soles', component: 'TypeSolePage', role: 'animataire' },
            { title: 'Gestion champs', component: 'ChampsPage', role: 'animataire' },
            { title: 'Gestion protocoles', component: 'ProtocolePage', role: 'animataire' },
            { title: 'Gestion cultures protocole', component: 'CultureProtocolePage', role: 'animataire' },
            { title: 'Gestion cultures', component: 'CulturePage', role: 'animataire' },
            { title: 'Gestion traitements', component: 'TraitementPage', role: 'animataire' },
            { title: 'Gestion typologie', component: 'TypologiePage', role: 'animataire' },
            { title: 'Gestion variétés', component: 'GestionVarietePage', role: 'animataire' },
            { title: 'Pluviométrie', component: 'PluviometriePage', role: 'animataire' },
            //{ title: 'Gestion Essais old', component: 'EssaiPage', role: 'moderateur' },
            { title: 'Admin', component: 'AdminPage', role: 'any' },           
     ];

     this.profiles = [
            /*{ title: 'Connexion', component: LoginPage },
            { title: 'Connexion', component: LoginPage },
            { title: 'Enregistrement', component: RegisterPage },*****
            //{ title: 'Profile', component: ProfileUserPage },
            { title: 'Profile', component: 'ProfileUserPage' },
            { title: 'Déconnexion', component: '' }
          ];

    this.connexions = [
            /*{ title: 'Connexion', component: LoginPage },
            { title: 'Connexion', component: LoginPage },
            { title: 'Enregistrement', component: RegisterPage },*****
            //{ title: 'Connexion', component: LoginPage },
            { title: 'Connexion', component: 'LoginPage' },
            { title: 'Creéer un compte', component: 'RegisterPage' },
          ];
    
      /*this.gestionService.remoteSaved.getSession((err, response) => {
         if (response.userCtx.name) {
          
          this.name = response.userCtx.name; 
        }
      });****
  } 

*/
  chargerInfo(){
    this.storage.get('TRAP_info_user').then((info_user) => {
      if(info_user){
        global.info_user = info_user;
        this.user = global.info_user;
        this.global = global;
        if(this.user && this.user.roles){
          this.quelEstMonRole(this.user.roles)
        }
        ///////////this.setPage();

        //this.name = 
      }else{
        //this.user = {roles: []}
        /////////this.setPage();
      }
    }).catch((err) => {
      console.log(err);
      //this.user = {roles: []}
      //////////////this.setPage();
    });
    this.storage.get('TRAP_info_connexion').then((info_connexion) => {
      if(info_connexion){
         global.info_connexion = info_connexion; 
      }
    });
  }

/*testConnexion(){
  //tester le status de la connexion
  this.gestionService.remoteSaved.getSession((err, response) => {
    if (err) {
      // network error
      this.events.publish('user:login');
    } else if (!response.userCtx.name) {
      // nobody's logged in
      this.events.publish('user:login');
    } else {
      // response.userCtx.name is the current user
      this.events.publish('user:login', response.userCtx);
    }
  });
// traitement
//alert('appel')
//setTimeout(this.testConnexion,10000); /* rappel après 2 secondes = 2000 millisecondes ****
}*/
  ok(){
    //this.pages = []
    this.user = global.info_user;
    
  }
  verifierRole(page) {
    if(page.role === 'admin' && this.user && this.user.roles){
      return global.estAmin(this.user.roles)
    }else if(page.role === 'moderateur' && this.user && this.user.roles){
      return global.estManager(this.user.roles)
    }else if(page.role === 'animataire' && this.user && this.user.roles){
      return global.estAnimataire(this.user.roles)
    }else if(page.role === 'any'){
      return true;
    }
  }
}
