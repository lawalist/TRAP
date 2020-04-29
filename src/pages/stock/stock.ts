import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ActionSheetController, Platform, ViewController } from 'ionic-angular';
import { global } from '../../global-variables/variable';
import { File } from '@ionic-native/file';
import * as FileSaver from 'file-saver';
import { Printer, PrintOptions } from '@ionic-native/printer';
import { PouchdbProvider } from '../../providers/pouchdb-provider';
declare var cordova: any;
/**
 * Generated class for the StockPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-stock',
  templateUrl: 'stock.html',
})
export class StockPage {

  user: any = global.info_user;
  global:any = global;
  estManager: boolean = false;
  estAdmin: boolean = false;
  stocks: any = [];
  allStocks: any = [];
  selectedStyle: any = 'liste';
  typeRecherche: any = 'nom';
  rechercher: any = false;
  action: string = 'liste';
  stock: any;
  nom_centre: string;
  id_centre: string;

  nom_produit: string;
  id_stock: string;

  constructor(public navCtrl: NavController, public alertCtl: AlertController, public actionSheetCtrl: ActionSheetController, public navParams: NavParams, public printer: Printer, public file: File, public viewCtl: ViewController, public servicePouchdb: PouchdbProvider, public platform: Platform,) {
    if(navParams.data.id_centre){
      this.id_centre = this.navParams.data.id_centre;
      this.nom_centre = this.navParams.data.nom_centre;
    }else if(navParams.data.id_stock){
      this.id_stock = this.navParams.data.id_stock;
      this.nom_produit = this.navParams.data.nom_produit;
    }
  }
  
  options() {
    const actionSheet = this.actionSheetCtrl.create({
      title: 'Actions',
      buttons: [
        {
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
 
  
  
supprimer(stock){
  let e: any = {};
  let alert = this.alertCtl.create({
    title: 'Suppression stock',
    message: 'Etes vous sûr de vouloir supprimer ce stock ?',
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
            this.servicePouchdb.deleteReturn(stock).then((res) => {
              //let e: any = {};
              //e.doc = essai;
              this.updateProduit(stock.data.id_produit);
              this.stocks.forEach((es, i) => {
                if(es.doc._id === stock._id){
                  this.stocks.splice(i, 1);
                }
                
              });
  
              this.action = 'liste';
              //this.navCtrl.pop();
            }, err => {
              console.log(err)
            }) ;
          }else{
            this.servicePouchdb.deleteDocReturn(stock).then((res) => {
              //let e: any = {};
              //e.doc = essai;
              this.updateProduit(stock.data.id_produit);
              this.stocks.forEach((es, i) => {
                if(es.doc._id === stock._id){
                  this.stocks.splice(i, 1);
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


updateProduit(id){
  this.servicePouchdb.getDocById(id).then((produit) => {
    delete produit.data["id_stock"];
    this.servicePouchdb.updateDoc(produit);
  })
}
  
  doRefresh(refresher) {
    // this.stocks = [];
     this.servicePouchdb.getPlageDocsRapide('stock','stock:\uffff').then((stocks) => {
       if(stocks){
         if(this.id_centre && this.id_centre != ""){
           let uns: any= [];
           stocks.forEach((u) => {
             if(u.doc.data.id_centre && u.doc.data.id_centre == this.id_centre){
               uns.push(u)
             }
           });
           this.stocks = uns;
           this.allStocks = uns;
           refresher.complete();
         }else{
           this.stocks = stocks;
           this.allStocks = stocks;
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
   this.stocks = this.allStocks;
 }


 exportExcel(){

   let date = new Date();
   //let dateHeure = date.toLocaleDateString()+ date.toLocaleTimeString();// + date.getTime().toLocaleString();
   let nom = date.getDate().toString() +'_'+ (date.getMonth() + 1).toString() +'_'+ date.getFullYear().toString() +'_'+ date.getHours().toString() +'_'+ date.getMinutes().toString() +'_'+ date.getSeconds().toString();

   let blob = new Blob([document.getElementById('stock_tableau').innerHTML], {
     //type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
     type: "text/plain;charset=utf-8"
     //type: 'application/vnd.ms-excel;charset=utf-8'
     //type: "application/vnd.ms-excel;charset=utf-8"
   });

   if(!this.platform.is('android')){
     FileSaver.saveAs(blob, 'stocks_'+nom+'.xls');
   }else{

     let fileDestiny: string = cordova.file.externalRootDirectory;
     this.file.writeFile(fileDestiny, 'stocks_'+nom+'.xls', blob).then(()=> {
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
   let content = document.getElementById('stock_tableau').innerHTML;
   this.printer.print(content, options);
 }

 sync(){
  this.servicePouchdb.syncAvecToast();
}

/*option(){
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
}*/


getAllStocks(){
  
  this.rechercher = true;
   // this.stocks = [];
    this.servicePouchdb.getPlageDocsRapide('stock','stock:\uffff').then((stocks) => {
      if(stocks){
        if(this.id_centre && this.id_centre != ""){
          let uns: any= [];
          stocks.forEach((u) => {
            if(u.doc.data.id_centre && u.doc.data.id_centre == this.id_centre){
              uns.push(u)
            }
          });
          this.stocks = uns;
          this.allStocks = uns;
          this.rechercher = false;
        }else{
          this.stocks = stocks;
          this.allStocks = stocks;
          this.rechercher = false;
        }
        
        //this.allStocks1 = stocks;
       
      }
    }).catch((err) => {
      console.log(err)
      this.rechercher = false;
    }); 
}


ionViewDidEnter() {
  if(!this.id_stock){
    this.getAllStocks();
  }else{
    this.servicePouchdb.getDocById(this.id_stock).then((stock) => {
      //let doc: any = {};
      //doc.doc = stock
      this.stock = stock;
      this.action = 'detail';
    })

  }
   
}



detail(stock){
  this.stock = stock;
  this.action = 'detail';
  //this.navCtrl.push('DetailstockPage', {'stock': stock, 'selectedSource': selectedSource});
}

getItems(ev: any) {
  // Reset items back to all of the items
  this.stocks = this.allStocks;

  // set val to the value of the searchbar
  let val = ev.target.value;

  // if the value is an empty string don't filter the items
  if (val && val.trim() != '') {
    this.stocks = this.stocks.filter((item) => {
      if(this.typeRecherche === 'nom'){
        return (item.doc.data.nom_centre.toLowerCase().indexOf(val.toLowerCase()) > -1);
      }else if(this.typeRecherche === 'code'){
        return (item.doc.data.code_centre.toLowerCase().indexOf(val.toLowerCase()) > -1);
      }else if(this.typeRecherche === 'type-produit'){
         return (item.doc.data.type_produit.toLowerCase().indexOf(val.toLowerCase()) > -1);
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
}
