import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, ModalController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

//import { TabsPage } from '../pages/tabs/tabs';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = 'TabsPage';
  @ViewChild(Nav) nav: Nav;
  pages: Array<{title: string, component: any}>;

  constructor(public platform: Platform, public modalCtl: ModalController, public statusBar: StatusBar, public splashScreen: SplashScreen) {
    /*platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });*/
    this.pages = [
      //{ title: 'Changer la langue', component: 'HomePage' },
      { title: 'Gestion cultures', component: 'CulturePage' },
      { title: 'Gestion variétés', component: 'GestionVarietePage' },
      { title: 'Gestion composantes', component: 'ComposantePage' },
      { title: 'Gestion Produits', component: 'GestionProduitPage' },
      { title: 'Gestion fédérations', component: 'GestionFederationPage' },
      { title: 'Gestion unions', component: 'GestionUnionPage' },
      //{ title: 'Gestion pays', component: 'GestionPaysPage' },
      //{ title: 'Gestion régions', component: 'GestionRegionPage' },
      //{ title: 'Gestion departements', component: 'GestionDepartementPage' },
      //{ title: 'Gestion communes', component: 'GestionCommunePage' },
      //{ title: 'Gestion village', component: 'GestionVillagePage' },
      { title: 'Admin', component: 'AdminPage' },
    ];
  }
742

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
    let modal = this.modalCtl.create(page.component)
    modal.present();
  }
}
