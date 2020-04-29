import { Component } from '@angular/core';
import { NavController, IonicPage } from 'ionic-angular';
import { global } from '../../global-variables/variable';
import { PouchdbProvider } from '../../providers/pouchdb-provider';

@IonicPage()
@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = 'GestionCentreTransformationPage';
  tab2Root = 'GestionProductionPage';
  tab3Root = 'GestionVentePage';

  constructor(public database: PouchdbProvider) {

  }

  public ionViewDidEnter() {
    //this.translate.use(global.langue)
    //console.log('syncing database')
    //this.database.sync();
    this.initFilter();
    this.initLocaliteData();
    //this.getConfig();
    /*this.database.getChangeListener().subscribe(data => {
      this.zone.run(() => {
        //this.items.push(data.doc);
      });
    });*/
  }

  
  initFilter(){
    this.database.getDocById('_design/filtrerDocByCodeCentre').then((c) => {
      if(!c){
          this.ajouterLoalDesignDoc()
        }
    }).catch((err) => this.ajouterLoalDesignDoc());
  }

  ajouterLoalDesignDoc(){
    let filter_doc: any = {
      //Prend en parametre un tableau contenant la liste des code des union
          _id: '_design/filtrerDocByCodeCentreByCodeCentre',
          filters: {
            myfilter: function (doc, req) {
            var localite_doc = ['pays', 'region', 'commune', 'departement', 'village'/*, 'variete', 'culture'*/];
              var doc_pour_centre = [/*'federation', 'union', 'op', */'membre', 'centre', 'production', 'produit', 'vente', 'produit-gate', 'stock'];
              //seul l'admin à accès à la totalité des inforamtions de la base de donnée
              if(doc._id == '_design/filtrerDocByCodeCentreByCodeCentre' || (req.query.roles && req.query.roles.length && (req.query.roles.indexOf('admin') != -1) || (req.query.roles.indexOf('_admin') != -1))){
                return 1
              }else {
              //si pas moderateur
              //if(req.query.roles.indexOf('moderateur') === -1){

                
                //localité et photos
                if(doc.type){
                  //acceder aux localités
                  if(localite_doc.indexOf(doc.type) !== -1){
                    return 1;
                  }
                  //acceder aux photo des membres des centres autorisés
                  else if(doc.type == 'photo'){
                    if(req.query.codes_centres && req.query.codes_centres.length > 0 && doc.code_centre){
                      return req.query.codes_centres.indexOf(doc.code_centre) !== -1;
                    }
                  }else{
                    //return 'doc type probleme => '+doc._id
                    throw({forbidden: 'doc sans data probleme => '+doc._id})
                  }
                }//fin doc.type
                
                else if(doc.data && doc.data.type){
                  //culture, variete et type-produit sont publiques
                  if(doc.data.type == 'culture' || doc.data.type == 'variete' || doc.data.type == 'type-produit'){
                    return 1;
                  }else 
                  //filtrer les fédérations par code_federation
                  if(doc.data.type == 'federation' && req.query.codes_federations && req.query.codes_federations.length > 0){
                    return req.query.codes_federations.indexOf(doc.data.code_federation) !== -1;
                  }else 
                  //filtrer les unions par code_union
                  if(doc.data.type == 'union' && req.query.codes_unions && req.query.codes_unions.length > 0){
                    return req.query.codes_unions.indexOf(doc.data.code_union) !== -1;
                  }else 
                  //filtrer les ops par code_op
                  if(doc.data.type == 'op' && req.query.codes_ops && req.query.codes_ops.length > 0){
                    return req.query.codes_ops.indexOf(doc.data.code_op) !== -1;
                  }else
                  //fitrer les autres document par code_centre
                  if(doc_pour_centre.indexOf(doc.data.type) !== -1){
                    //si filtre défini
                    if(req.query.codes_centres && req.query.codes_centres.length > 0){
                      //cas du protocole
                      return req.query.codes_centress.indexOf(doc.data.code_centre) !== -1;
                    }
                  }
                 else{
                  //throw({forbidden: 'erreur incomprise => '+doc._id})
                }
              }//fin  doc.data.type
            }//fin user filter
            }.toString()
          }
        }

        this.database.getDocById('_design/filtrerDocByCodeCentre').then((doc) => {
          if(doc && doc._id){
            //doc existe
            //this.database.remote(doc)
            filter_doc._id = '_design/filtrerDocByCodeCentre';
            filter_doc._rev = doc._rev;
            this.database.createSimpleDocReturn(filter_doc);//.then((res) => alert('Filter mise à jour avec succes')).catch((err) => alert('erreur mise à jour du filter du filter => '+err));
          }else{
            //créer le filtre de base
            //this.ajouterDesignDoc();
            filter_doc._id = '_design/filtrerDocByCodeCentre';
            this.database.createSimpleDocReturn(filter_doc);//.then((res) => alert('Filter ajouté avec succes')).catch((err) => alert('erreur ajout du filter => '+err));
          }
          
        }).catch((err) => {
          //alert(err)
          //this.ajouterDesignDoc();
          filter_doc._id = '_design/filtrerDocByCodeCentre';
          this.database.createSimpleDocReturn(filter_doc);//.then((res) => alert('Filter ajouté avec succes')).catch((err) => alert('erreur ajout du filter '+err));
        });
    

        //global.remoteSaved.put(filter_doc).catch((err) => alert('erreur vers server '+err));
        //this.database.put(doc, doc._id).catch((err) => alert('erreur vers local '+err));
      }

  initLocaliteData(){
    //ajouter pays
    this.database.getDocById('pays').then((c) => {
      if(!c){
        let pays = {
          "_id": "pays",
          "type": "pays",
          "data": [
            {
              "id": "NG",
              "nom": "Niger"
            }
          ]
        }
        this.database.createSimpleDocReturn(pays)
        }
    }).catch((err) => {
      let pays = {
        "_id": "pays",
        "type": "pays",
        "data": [
          {
            "id": "NG",
            "nom": "Niger"
          }
        ]
      }
      this.database.createSimpleDocReturn(pays)
    });
    
    //ajouter region
    this.database.checkExists('region').then((c) => {
      if(!c){
        let region = {
          "_id": "region",
          "type": "region",
          "data": [
            {
              "id": "MDI",
              "nom": "Maradi",
              "id_pays": "NG"
            }
          ]
        }
        this.database.createSimpleDocReturn(region)
        }
    }).catch((err) => {
      let region = {
        "_id": "region",
        "type": "region",
        "data": [
          {
            "id": "MDI",
            "nom": "Maradi",
            "id_pays": "NG"
          }
        ]
      }
      this.database.createSimpleDocReturn(region)
    });
    
    //ajouter departement
    this.database.checkExists('departement').then((c) => {
      if(!c){
        let departement = {
          "_id": "departement",
          "type": "departement",
          "data": [
            {
              "id": "MD",
              "nom": "Madarounfa",
              "id_region": "MDI"
            },
            {
              "id": "MY",
              "nom": "Mayahi",
              "id_region": "MDI"
            },
            {
              "id": "GR",
              "nom": "Guidan_Roumji",
              "id_region": "MDI"
            },
            {
              "id": "AG",
              "nom": "Aguie",
              "id_region": "MDI"
            },
            {
              "id": "TS",
              "nom": "Tessaoua",
              "id_region": "MDI"
            },
            {
              "id": "DK",
              "nom": "Dakoro",
              "id_region": "MDI"
            }
          ]
        }
        this.database.createSimpleDocReturn(departement)
        }
    }).catch((err) => {
      let departement = {
        "_id": "departement",
        "type": "departement",
        "data": [
          {
            "id": "MD",
            "nom": "Madarounfa",
            "id_region": "MDI"
          },
          {
            "id": "MY",
            "nom": "Mayahi",
            "id_region": "MDI"
          },
          {
            "id": "GR",
            "nom": "Guidan_Roumji",
            "id_region": "MDI"
          },
          {
            "id": "AG",
            "nom": "Aguie",
            "id_region": "MDI"
          },
          {
            "id": "TS",
            "nom": "Tessaoua",
            "id_region": "MDI"
          },
          {
            "id": "DK",
            "nom": "Dakoro",
            "id_region": "MDI"
          }
        ]
      }
      this.database.createSimpleDocReturn(departement)
    });
    
    //ajouter commune
    this.database.checkExists('commune').then((c) => {
      if(!c){
        let commune = {
          "_id": "commune",
          "type": "commune",
          "data": [
            {
              "id": "GB",
              "nom": "GABI",
              "id_departement": "MD"
            },
            {
              "id": "SF",
              "nom": "Safo",
              "id_departement": "MD"
            },
            {
              "id": "MD",
              "nom": "Madarounfa",
              "id_departement": "MD"
            },
            {
              "id": "DJ",
              "nom": "Djirataoua",
              "id_departement": "MD"
            },
            {
              "id": "SH",
              "nom": "Serkin_Haoussa",
              "id_departement": "MY"
            },
            {
              "id": "MY",
              "nom": "Mayahi",
              "id_departement": "MY"
            },
            {
              "id": "AT",
              "nom": "Atantane",
              "id_departement": "MY"
            },
            {
              "id": "TK",
              "nom": "Tchake",
              "id_departement": "MY"
            },
            {
              "id": "SS",
              "nom": "Sae_Saboua",
              "id_departement": "GR"
            },
            {
              "id": "GR",
              "nom": "Guidan_roumdji",
              "id_departement": "GR"
            },
            {
              "id": "CD",
              "nom": "Chadakori",
              "id_departement": "GR"
            },
            {
              "id": "TD",
              "nom": "Tachdoua",
              "id_departement": "AG"
            },
            {
              "id": "TS",
              "nom": "Tessaoua",
              "id_departement": "TS"
            },
            {
              "id": "TB",
              "nom": "Tibiri",
              "id_departement": "GR"
            },
            {
              "id": "GS",
              "nom": "Guidan_Sori",
              "id_departement": "GR"
            },
            {
              "id": "SM",
              "nom": "Sabon_Machi",
              "id_departement": "DK"
            },
            {
              "id": "MA",
              "nom": "MAIJIRGUI",
              "id_departement": "TS",
              "nom_departement": "Tessaoua"
            },
            {
              "id": "TC",
              "nom": "Tchadoua",
              "id_departement": "AG",
              "nom_departement": "Aguie"
            }
          ]
        }
        this.database.createSimpleDocReturn(commune)
        }
    }).catch((err) => {
      let commune = {
        "_id": "commune",
        "type": "commune",
        "data": [
          {
            "id": "GB",
            "nom": "GABI",
            "id_departement": "MD"
          },
          {
            "id": "SF",
            "nom": "Safo",
            "id_departement": "MD"
          },
          {
            "id": "MD",
            "nom": "Madarounfa",
            "id_departement": "MD"
          },
          {
            "id": "DJ",
            "nom": "Djirataoua",
            "id_departement": "MD"
          },
          {
            "id": "SH",
            "nom": "Serkin_Haoussa",
            "id_departement": "MY"
          },
          {
            "id": "MY",
            "nom": "Mayahi",
            "id_departement": "MY"
          },
          {
            "id": "AT",
            "nom": "Atantane",
            "id_departement": "MY"
          },
          {
            "id": "TK",
            "nom": "Tchake",
            "id_departement": "MY"
          },
          {
            "id": "SS",
            "nom": "Sae_Saboua",
            "id_departement": "GR"
          },
          {
            "id": "GR",
            "nom": "Guidan_roumdji",
            "id_departement": "GR"
          },
          {
            "id": "CD",
            "nom": "Chadakori",
            "id_departement": "GR"
          },
          {
            "id": "TD",
            "nom": "Tachdoua",
            "id_departement": "AG"
          },
          {
            "id": "TS",
            "nom": "Tessaoua",
            "id_departement": "TS"
          },
          {
            "id": "TB",
            "nom": "Tibiri",
            "id_departement": "GR"
          },
          {
            "id": "GS",
            "nom": "Guidan_Sori",
            "id_departement": "GR"
          },
          {
            "id": "SM",
            "nom": "Sabon_Machi",
            "id_departement": "DK"
          },
          {
            "id": "MA",
            "nom": "MAIJIRGUI",
            "id_departement": "TS",
            "nom_departement": "Tessaoua"
          },
          {
            "id": "TC",
            "nom": "Tchadoua",
            "id_departement": "AG",
            "nom_departement": "Aguie"
          }
        ]
      }
      this.database.createSimpleDocReturn(commune)
    });
    
    //ajouter village
    this.database.checkExists('village').then((c) => {
      if(!c){
        let village = {
          "_id": "village",
          "type": "village",
          "data": [
            {
              "id": "GD",
              "nom": "Garin_dadi",
              "id_commune": "GB"
            },
            {
              "id": "GJ",
              "nom": "Garin_jido",
              "id_commune": "GB"
            },
            {
              "id": "SB",
              "nom": "Serkin_Bindiga",
              "id_commune": "GB"
            },
            {
              "id": "GB",
              "nom": "Gabi",
              "id_commune": "GB"
            },
            {
              "id": "GT",
              "nom": "Gabi_tajaye",
              "id_commune": "GB"
            },
            {
              "id": "MR",
              "nom": "Maraka",
              "id_commune": "GB"
            },
            {
              "id": "DK",
              "nom": "Dan_takobo",
              "id_commune": "GB"
            },
            {
              "id": "GN",
              "nom": "Garatchin_Narai",
              "id_commune": "GB"
            },
            {
              "id": "MD",
              "nom": "Madeini",
              "id_commune": "GB"
            },
            {
              "id": "BN",
              "nom": "Boka_Najiko",
              "id_commune": "GB"
            },
            {
              "id": "BG",
              "nom": "Baguegua",
              "id_commune": "GB"
            },
            {
              "id": "KD",
              "nom": "Kabobi_doroyi",
              "id_commune": "GB"
            },
            {
              "id": "MT",
              "nom": "Madeini_toullouwa",
              "id_commune": "GB"
            },
            {
              "id": "BG",
              "nom": "Baguegua",
              "id_commune": "SF"
            },
            {
              "id": "TR",
              "nom": "Tokaraoua",
              "id_commune": "GB"
            },
            {
              "id": "GJ",
              "nom": "Garin_jido",
              "id_commune": "SF"
            },
            {
              "id": "BR",
              "nom": "Bargaja",
              "id_commune": "GB"
            },
            {
              "id": "TK",
              "nom": "Takude",
              "id_commune": "GB"
            },
            {
              "id": "TS",
              "nom": "Taka_saba_saboua",
              "id_commune": "GB"
            },
            {
              "id": "IK",
              "nom": "Inkouregaoua",
              "id_commune": "GB"
            },
            {
              "id": "DT",
              "nom": "Dan_taro",
              "id_commune": "GB"
            },
            {
              "id": "BD",
              "nom": "Badaria",
              "id_commune": "GB"
            },
            {
              "id": "DA",
              "nom": "Dan_aro",
              "id_commune": "GB"
            },
            {
              "id": "DG",
              "nom": "Douman_gada",
              "id_commune": "GB"
            },
            {
              "id": "MG",
              "nom": "Maigero",
              "id_commune": "GB"
            },
            {
              "id": "RR",
              "nom": "Rourouka",
              "id_commune": "GB"
            },
            {
              "id": "HR",
              "nom": "Harounawa",
              "id_commune": "GB"
            },
            {
              "id": "GL",
              "nom": "Galadi",
              "id_commune": "GB"
            },
            {
              "id": "MK",
              "nom": "MAIDOKOKI",
              "id_commune": "GB"
            },
            {
              "id": "GM",
              "nom": "Garin_mai_gari",
              "id_commune": "SF"
            },
            {
              "id": "GI",
              "nom": "Gade_d_iyya",
              "id_commune": "SF"
            },
            {
              "id": "SF",
              "nom": "Safo",
              "id_commune": "SF"
            },
            {
              "id": "GL",
              "nom": "Garin_labo",
              "id_commune": "SF"
            },
            {
              "id": "GD",
              "nom": "Gadi",
              "id_commune": "SF"
            },
            {
              "id": "DH",
              "nom": "Dan_Hadjara",
              "id_commune": "SF"
            },
            {
              "id": "DT",
              "nom": "Dan_tambara",
              "id_commune": "MD"
            },
            {
              "id": "RK",
              "nom": "Raka",
              "id_commune": "MD"
            },
            {
              "id": "SM",
              "nom": "Sammai",
              "id_commune": "MD"
            },
            {
              "id": "HD",
              "nom": "hadamna",
              "id_commune": "MD"
            },
            {
              "id": "ED",
              "nom": "Eldagi",
              "id_commune": "MD"
            },
            {
              "id": "GG",
              "nom": "Garin_gonao",
              "id_commune": "MD"
            },
            {
              "id": "AR",
              "nom": "AngouwalRoumdji",
              "id_commune": "MD"
            },
            {
              "id": "KT",
              "nom": "kontagora",
              "id_commune": "DJ"
            },
            {
              "id": "DK",
              "nom": "Dan_kashi_bako",
              "id_commune": "DJ"
            },
            {
              "id": "HT",
              "nom": "Hilanin_Tajaye",
              "id_commune": "DJ"
            },
            {
              "id": "HJ",
              "nom": "Hilanin_Janare",
              "id_commune": "DJ"
            },
            {
              "id": "WD",
              "nom": "wadatou",
              "id_commune": "DJ"
            },
            {
              "id": "AM",
              "nom": "Angouwal_Mata",
              "id_commune": "MD"
            },
            {
              "id": "MU",
              "nom": "Maya_Uku",
              "id_commune": "MD"
            },
            {
              "id": "DB",
              "nom": "Dan_banga",
              "id_commune": "SH"
            },
            {
              "id": "RR",
              "nom": "Roura",
              "id_commune": "SH"
            },
            {
              "id": "AZ",
              "nom": "Azazala",
              "id_commune": "SH"
            },
            {
              "id": "GS",
              "nom": "Guidan_sadaou",
              "id_commune": "SH"
            },
            {
              "id": "GB",
              "nom": "Guidan_Bako_Maiganga",
              "id_commune": "SH"
            },
            {
              "id": "WR",
              "nom": "Warzou",
              "id_commune": "SH"
            },
            {
              "id": "GL",
              "nom": "Guidan_lali",
              "id_commune": "SH"
            },
            {
              "id": "SH",
              "nom": "Serkin_haoussa",
              "id_commune": "SH"
            },
            {
              "id": "ID",
              "nom": "In_doubba",
              "id_commune": "SH"
            },
            {
              "id": "KD",
              "nom": "koudatawa",
              "id_commune": "SH"
            },
            {
              "id": "FG",
              "nom": "Fagamniya",
              "id_commune": "SH"
            },
            {
              "id": "DJ",
              "nom": "Dajin_bawa",
              "id_commune": "SH"
            },
            {
              "id": "SK",
              "nom": "Sakope",
              "id_commune": "SH"
            },
            {
              "id": "KT",
              "nom": "Kotare",
              "id_commune": "MY"
            },
            {
              "id": "DK",
              "nom": "Dan_Kibiya",
              "id_commune": "AT"
            },
            {
              "id": "JT",
              "nom": "Jantoudou",
              "id_commune": "SH"
            },
            {
              "id": "GA",
              "nom": "Guidan_Ango",
              "id_commune": "SH"
            },
            {
              "id": "MR",
              "nom": "Makeraoua",
              "id_commune": "SH"
            },
            {
              "id": "SB",
              "nom": "Serkin_Bougaje",
              "id_commune": "MY"
            },
            {
              "id": "OL",
              "nom": "Ola",
              "id_commune": "MY"
            },
            {
              "id": "MK",
              "nom": "Malamaoua_Kaka",
              "id_commune": "SH"
            },
            {
              "id": "KG",
              "nom": "Kagadama",
              "id_commune": "SH"
            },
            {
              "id": "DS",
              "nom": "Dan_Sara",
              "id_commune": "SH"
            },
            {
              "id": "DT",
              "nom": "Dan_Tsuntsu",
              "id_commune": "SH"
            },
            {
              "id": "AW",
              "nom": "Arawraye",
              "id_commune": "SH"
            },
            {
              "id": "JG",
              "nom": "jigo",
              "id_commune": "TK"
            },
            {
              "id": "DT",
              "nom": "Dan_toudou",
              "id_commune": "TK"
            },
            {
              "id": "GT",
              "nom": "Guidan_tanko",
              "id_commune": "TK"
            },
            {
              "id": "BT",
              "nom": "Batchiri",
              "id_commune": "TK"
            },
            {
              "id": "TK",
              "nom": "Tchake",
              "id_commune": "TK"
            },
            {
              "id": "KD",
              "nom": "kandili",
              "id_commune": "TK"
            },
            {
              "id": "ZD",
              "nom": "zodi",
              "id_commune": "TK"
            },
            {
              "id": "BS",
              "nom": "Buzu_sugune",
              "id_commune": "TK"
            },
            {
              "id": "SS",
              "nom": "Sae_Saboua",
              "id_commune": "SS"
            },
            {
              "id": "ST",
              "nom": "Sae_saouni",
              "id_commune": "SS"
            },
            {
              "id": "BT",
              "nom": "Batata",
              "id_commune": "SS"
            },
            {
              "id": "KN",
              "nom": "Kounkouraye",
              "id_commune": "SS"
            },
            {
              "id": "KK",
              "nom": "Kakourou",
              "id_commune": "SS"
            },
            {
              "id": "AK",
              "nom": "Alkali",
              "id_commune": "SS"
            },
            {
              "id": "KD",
              "nom": "Kouka_Dan_Wada",
              "id_commune": "SS"
            },
            {
              "id": "KT",
              "nom": "Katchinawa",
              "id_commune": "SS"
            },
            {
              "id": "GS",
              "nom": "Guidan_salao",
              "id_commune": "SS"
            },
            {
              "id": "WD",
              "nom": "Wandarma",
              "id_commune": "SS"
            },
            {
              "id": "KM",
              "nom": "Kakouma",
              "id_commune": "SS"
            },
            {
              "id": "DD",
              "nom": "Dan_Dabo",
              "id_commune": "SS"
            },
            {
              "id": "DB",
              "nom": "Dan_Bako",
              "id_commune": "SS"
            },
            {
              "id": "MS",
              "nom": "Malamaye_salihou",
              "id_commune": "SS"
            },
            {
              "id": "SG",
              "nom": "Sae_Gawni",
              "id_commune": "SS"
            },
            {
              "id": "DG",
              "nom": "Dan_Gado",
              "id_commune": "SS"
            },
            {
              "id": "DT",
              "nom": "Dan_Bako_Tsarakawa",
              "id_commune": "SS"
            },
            {
              "id": "KY",
              "nom": "Kounyago",
              "id_commune": "SS"
            },
            {
              "id": "TT",
              "nom": "Tagaza_taji_wuka",
              "id_commune": "SS"
            },
            {
              "id": "MB",
              "nom": "Malamaye_sabouwa",
              "id_commune": "SS"
            },
            {
              "id": "TK",
              "nom": "Tchakire",
              "id_commune": "SS"
            },
            {
              "id": "EK",
              "nom": "Elkolta",
              "id_commune": "GR"
            },
            {
              "id": "KY",
              "nom": "Keylounbawa",
              "id_commune": "CD"
            },
            {
              "id": "DR",
              "nom": "Dargue",
              "id_commune": "CD"
            },
            {
              "id": "KW",
              "nom": "Kawaye_2",
              "id_commune": "CD"
            },
            {
              "id": "SB",
              "nom": "Sabonguero",
              "id_commune": "CD"
            },
            {
              "id": "BR",
              "nom": "Baradesaboua",
              "id_commune": "CD"
            },
            {
              "id": "K1",
              "nom": "Kata_kata_1",
              "id_commune": "CD"
            },
            {
              "id": "BS",
              "nom": "Boussaragui",
              "id_commune": "CD"
            },
            {
              "id": "KL",
              "nom": "Kollorouga",
              "id_commune": "CD"
            },
            {
              "id": "K2",
              "nom": "Kata_kata_2",
              "id_commune": "CD"
            },
            {
              "id": "GA",
              "nom": "Garin_Agada",
              "id_commune": "CD"
            },
            {
              "id": "YW",
              "nom": "Yan_gawana",
              "id_commune": "CD"
            },
            {
              "id": "DD",
              "nom": "Dan_Daniya",
              "id_commune": "CD"
            },
            {
              "id": "RY",
              "nom": "RugarYakaou",
              "id_commune": "CD"
            },
            {
              "id": "GB",
              "nom": "Garin_Bilo",
              "id_commune": "CD"
            },
            {
              "id": "GR",
              "nom": "Garin_Kasso",
              "id_commune": "CD"
            },
            {
              "id": "TT",
              "nom": "Totsa",
              "id_commune": "CD"
            },
            {
              "id": "KT",
              "nom": "Katomma",
              "id_commune": "CD"
            },
            {
              "id": "GK",
              "nom": "GuidanKalla",
              "id_commune": "CD"
            },
            {
              "id": "TD",
              "nom": "Tachdoua",
              "id_commune": "TD"
            },
            {
              "id": "TS",
              "nom": "Tessaoua",
              "id_commune": "TS"
            },
            {
              "id": "GR",
              "nom": "Gorga",
              "id_commune": "TS"
            },
            {
              "id": "TK",
              "nom": "Tssamiyal_koura",
              "id_commune": "TS"
            },
            {
              "id": "ZK",
              "nom": "Zangounan_Kolta",
              "id_commune": "TS"
            },
            {
              "id": "MK",
              "nom": "Maiki",
              "id_commune": "CD"
            },
            {
              "id": "ID",
              "nom": "laduwa",
              "id_commune": "CD"
            },
            {
              "id": "KM",
              "nom": "Kalgon_Mahamadou",
              "id_commune": "CD"
            },
            {
              "id": "GT",
              "nom": "Guidan_Tawaye",
              "id_commune": "CD"
            },
            {
              "id": "KB",
              "nom": "kutumbi",
              "id_commune": "CD"
            },
            {
              "id": "DS",
              "nom": "Dan_Farou_Sofoua",
              "id_commune": "CD"
            },
            {
              "id": "DM",
              "nom": "Dan_Malam_Inbougage",
              "id_commune": "CD"
            },
            {
              "id": "E2",
              "nom": "Eloum_II",
              "id_commune": "CD"
            },
            {
              "id": "AB",
              "nom": "Achabissa",
              "id_commune": "CD"
            },
            {
              "id": "MM",
              "nom": "Makeraoua_majidadi",
              "id_commune": "CD"
            },
            {
              "id": "EL",
              "nom": "Eloum_Lake",
              "id_commune": "CD"
            },
            {
              "id": "GD",
              "nom": "Guidan_dambou",
              "id_commune": "CD"
            },
            {
              "id": "AL",
              "nom": "Alalaba",
              "id_commune": "CD"
            },
            {
              "id": "SO",
              "nom": "Sabo_Garin_Oumaru",
              "id_commune": "CD"
            },
            {
              "id": "YG",
              "nom": "Yan_Gobirawa",
              "id_commune": "CD"
            },
            {
              "id": "DF",
              "nom": "Dan_Farou",
              "id_commune": "CD"
            },
            {
              "id": "SG",
              "nom": "Sarkin_Gardi",
              "id_commune": "CD"
            },
            {
              "id": "BK",
              "nom": "Baka_shanta",
              "id_commune": "CD"
            },
            {
              "id": "GZ",
              "nom": "Garin_Zagui",
              "id_commune": "CD"
            },
            {
              "id": "GN",
              "nom": "Gangara",
              "id_commune": "CD"
            },
            {
              "id": "BZ",
              "nom": "Bazai",
              "id_commune": "CD"
            },
            {
              "id": "SD",
              "nom": "Sirdawa",
              "id_commune": "CD"
            },
            {
              "id": "MN",
              "nom": "Mallamawa_Nari",
              "id_commune": "CD"
            },
            {
              "id": "TD",
              "nom": "Tchiadi",
              "id_commune": "TB"
            },
            {
              "id": "ZN",
              "nom": "Zanfarawa",
              "id_commune": "TB"
            },
            {
              "id": "DD",
              "nom": "Dan_dague",
              "id_commune": "TB"
            },
            {
              "id": "GG",
              "nom": "Garin_Gado",
              "id_commune": "TB"
            },
            {
              "id": "SL",
              "nom": "Souloulou",
              "id_commune": "GR"
            },
            {
              "id": "ND",
              "nom": "Nwalla_Dan_Sofoua",
              "id_commune": "GS"
            },
            {
              "id": "DA",
              "nom": "Dara_Amadou",
              "id_commune": "SM"
            },
            {
              "id": "BA",
              "nom": "Bamo",
              "id_commune": "DJ",
              "nom_commune": "Djirataoua"
            },
            {
              "id": "OU",
              "nom": "Oubandawaki Wadataou",
              "id_commune": "DJ",
              "nom_commune": "Djirataoua"
            },
            {
              "id": "RO",
              "nom": "Rougga Elh Bara",
              "id_commune": "DJ",
              "nom_commune": "Djirataoua"
            },
            {
              "id": "MA",
              "nom": "Magali Bara",
              "id_commune": "TK",
              "nom_commune": "Tchake"
            },
            {
              "id": "MI",
              "nom": "Magagi Bara",
              "id_commune": "TK",
              "nom_commune": "Tchake"
            },
            {
              "id": "ET",
              "nom": "El Tsamiya",
              "id_commune": "TK",
              "nom_commune": "Tchake"
            },
            {
              "id": "DN",
              "nom": "Dan Malan",
              "id_commune": "TD",
              "nom_commune": "Tachdoua"
            },
            {
              "id": "MÏ",
              "nom": "Maï jan guéro",
              "id_commune": "TD",
              "nom_commune": "Tachdoua"
            },
            {
              "id": "GU",
              "nom": "GUIDAN MOUSSA",
              "id_commune": "TD",
              "nom_commune": "Tachdoua"
            },
            {
              "id": "ZA",
              "nom": "Zangounan kolta",
              "id_commune": "MA",
              "nom_commune": "MAIJIRGUI"
            },
            {
              "id": "ME",
              "nom": "Mageni",
              "id_commune": "TS",
              "nom_commune": "Tessaoua"
            },
            {
              "id": "JA",
              "nom": "Janarou",
              "id_commune": "DJ",
              "nom_commune": "Djirataoua"
            },
            {
              "id": "KA",
              "nom": "Karate 1",
              "id_commune": "CD",
              "nom_commune": "Chadakori"
            },
            {
              "id": "KE",
              "nom": "Kawaye ",
              "id_commune": "CD",
              "nom_commune": "Chadakori"
            },
            {
              "id": "K ",
              "nom": "Kawaye 1 ",
              "id_commune": "CD",
              "nom_commune": "Chadakori"
            },
            {
              "id": "MAG",
              "nom": "Magga",
              "id_commune": "SS",
              "nom_commune": "Sae_Saboua"
            },
            {
              "id": "DL",
              "nom": "Dan Malam Wagé",
              "id_commune": "SS",
              "nom_commune": "Sae_Saboua"
            },
            {
              "id": "TC",
              "nom": "Tchakire Elh Maida",
              "id_commune": "SS",
              "nom_commune": "Sae_Saboua"
            },
            {
              "id": "MP",
              "nom": "Magga Peulh",
              "id_commune": "SS",
              "nom_commune": "Sae_Saboua"
            },
            {
              "id": "KAG",
              "nom": "Kagadama",
              "id_commune": "SS",
              "nom_commune": "Sae_Saboua"
            },
            {
              "id": "KO",
              "nom": "Kakouma Bara",
              "id_commune": "SS",
              "nom_commune": "Sae_Saboua"
            },
            {
              "id": "KS",
              "nom": "Katsinawa Guidan Kané",
              "id_commune": "SS",
              "nom_commune": "Sae_Saboua"
            },
            {
              "id": "SA",
              "nom": "Sarkin Anna Jika",
              "id_commune": "SS",
              "nom_commune": "Sae_Saboua"
            },
            {
              "id": "ZG",
              "nom": "Zangon Bawalé",
              "id_commune": "SS",
              "nom_commune": "Sae_Saboua"
            },
            {
              "id": "DI",
              "nom": "Dajin Arzika",
              "id_commune": "TC",
              "nom_commune": "Tchadoua"
            },
            {
              "id": "GO",
              "nom": "Guidan MOUSSA",
              "id_commune": "TC",
              "nom_commune": "Tchadoua"
            },
            {
              "id": "KR",
              "nom": "Koré",
              "id_commune": "TS",
              "nom_commune": "Tessaoua"
            },
            {
              "id": "DO",
              "nom": "Dossana",
              "id_commune": "TK",
              "nom_commune": "Tchake"
            },
            {
              "id": "MAA",
              "nom": "Magaria",
              "id_commune": "TK",
              "nom_commune": "Tchake"
            },
            {
              "id": "DE",
              "nom": "Dan kibia arewa",
              "id_commune": "SH",
              "nom_commune": "Serkin_Haoussa"
            },
            {
              "id": "GÉ",
              "nom": "Guidan Nadolé",
              "id_commune": "SH",
              "nom_commune": "Serkin_Haoussa"
            },
            {
              "id": "BC",
              "nom": "Bakachanta",
              "id_commune": "SH",
              "nom_commune": "Serkin_Haoussa"
            },
            {
              "id": "GC",
              "nom": "Guidan atchali",
              "id_commune": "CD",
              "nom_commune": "Chadakori"
            },
            {
              "id": "EO",
              "nom": "Eloum",
              "id_commune": "CD",
              "nom_commune": "Chadakori"
            },
            {
              "id": "RU",
              "nom": "Rougar kangue",
              "id_commune": "CD",
              "nom_commune": "Chadakori"
            },
            {
              "id": "DW",
              "nom": "Doggon Dawa",
              "id_commune": "CD",
              "nom_commune": "Chadakori"
            },
            {
              "id": "DAN",
              "nom": "Dan Bako",
              "id_commune": "CD",
              "nom_commune": "Chadakori"
            },
            {
              "id": "GUI",
              "nom": "Guidan Djibi",
              "id_commune": "CD",
              "nom_commune": "Chadakori"
            },
            {
              "id": "OB",
              "nom": "Ouban jada",
              "id_commune": "CD",
              "nom_commune": "Chadakori"
            },
            {
              "id": "KU",
              "nom": "Katouma",
              "id_commune": "CD",
              "nom_commune": "Chadakori"
            },
            {
              "id": "KAY",
              "nom": "Kayara",
              "id_commune": "CD",
              "nom_commune": "Chadakori"
            },
            {
              "id": "KOU",
              "nom": "koudoumouss",
              "id_commune": "CD",
              "nom_commune": "Chadakori"
            }
          ]
        }
        this.database.createSimpleDocReturn(village)
        }
    }).catch((err) => {
      let village = {
        "_id": "village",
        "type": "village",
        "data": [
          {
            "id": "GD",
            "nom": "Garin_dadi",
            "id_commune": "GB"
          },
          {
            "id": "GJ",
            "nom": "Garin_jido",
            "id_commune": "GB"
          },
          {
            "id": "SB",
            "nom": "Serkin_Bindiga",
            "id_commune": "GB"
          },
          {
            "id": "GB",
            "nom": "Gabi",
            "id_commune": "GB"
          },
          {
            "id": "GT",
            "nom": "Gabi_tajaye",
            "id_commune": "GB"
          },
          {
            "id": "MR",
            "nom": "Maraka",
            "id_commune": "GB"
          },
          {
            "id": "DK",
            "nom": "Dan_takobo",
            "id_commune": "GB"
          },
          {
            "id": "GN",
            "nom": "Garatchin_Narai",
            "id_commune": "GB"
          },
          {
            "id": "MD",
            "nom": "Madeini",
            "id_commune": "GB"
          },
          {
            "id": "BN",
            "nom": "Boka_Najiko",
            "id_commune": "GB"
          },
          {
            "id": "BG",
            "nom": "Baguegua",
            "id_commune": "GB"
          },
          {
            "id": "KD",
            "nom": "Kabobi_doroyi",
            "id_commune": "GB"
          },
          {
            "id": "MT",
            "nom": "Madeini_toullouwa",
            "id_commune": "GB"
          },
          {
            "id": "BG",
            "nom": "Baguegua",
            "id_commune": "SF"
          },
          {
            "id": "TR",
            "nom": "Tokaraoua",
            "id_commune": "GB"
          },
          {
            "id": "GJ",
            "nom": "Garin_jido",
            "id_commune": "SF"
          },
          {
            "id": "BR",
            "nom": "Bargaja",
            "id_commune": "GB"
          },
          {
            "id": "TK",
            "nom": "Takude",
            "id_commune": "GB"
          },
          {
            "id": "TS",
            "nom": "Taka_saba_saboua",
            "id_commune": "GB"
          },
          {
            "id": "IK",
            "nom": "Inkouregaoua",
            "id_commune": "GB"
          },
          {
            "id": "DT",
            "nom": "Dan_taro",
            "id_commune": "GB"
          },
          {
            "id": "BD",
            "nom": "Badaria",
            "id_commune": "GB"
          },
          {
            "id": "DA",
            "nom": "Dan_aro",
            "id_commune": "GB"
          },
          {
            "id": "DG",
            "nom": "Douman_gada",
            "id_commune": "GB"
          },
          {
            "id": "MG",
            "nom": "Maigero",
            "id_commune": "GB"
          },
          {
            "id": "RR",
            "nom": "Rourouka",
            "id_commune": "GB"
          },
          {
            "id": "HR",
            "nom": "Harounawa",
            "id_commune": "GB"
          },
          {
            "id": "GL",
            "nom": "Galadi",
            "id_commune": "GB"
          },
          {
            "id": "MK",
            "nom": "MAIDOKOKI",
            "id_commune": "GB"
          },
          {
            "id": "GM",
            "nom": "Garin_mai_gari",
            "id_commune": "SF"
          },
          {
            "id": "GI",
            "nom": "Gade_d_iyya",
            "id_commune": "SF"
          },
          {
            "id": "SF",
            "nom": "Safo",
            "id_commune": "SF"
          },
          {
            "id": "GL",
            "nom": "Garin_labo",
            "id_commune": "SF"
          },
          {
            "id": "GD",
            "nom": "Gadi",
            "id_commune": "SF"
          },
          {
            "id": "DH",
            "nom": "Dan_Hadjara",
            "id_commune": "SF"
          },
          {
            "id": "DT",
            "nom": "Dan_tambara",
            "id_commune": "MD"
          },
          {
            "id": "RK",
            "nom": "Raka",
            "id_commune": "MD"
          },
          {
            "id": "SM",
            "nom": "Sammai",
            "id_commune": "MD"
          },
          {
            "id": "HD",
            "nom": "hadamna",
            "id_commune": "MD"
          },
          {
            "id": "ED",
            "nom": "Eldagi",
            "id_commune": "MD"
          },
          {
            "id": "GG",
            "nom": "Garin_gonao",
            "id_commune": "MD"
          },
          {
            "id": "AR",
            "nom": "AngouwalRoumdji",
            "id_commune": "MD"
          },
          {
            "id": "KT",
            "nom": "kontagora",
            "id_commune": "DJ"
          },
          {
            "id": "DK",
            "nom": "Dan_kashi_bako",
            "id_commune": "DJ"
          },
          {
            "id": "HT",
            "nom": "Hilanin_Tajaye",
            "id_commune": "DJ"
          },
          {
            "id": "HJ",
            "nom": "Hilanin_Janare",
            "id_commune": "DJ"
          },
          {
            "id": "WD",
            "nom": "wadatou",
            "id_commune": "DJ"
          },
          {
            "id": "AM",
            "nom": "Angouwal_Mata",
            "id_commune": "MD"
          },
          {
            "id": "MU",
            "nom": "Maya_Uku",
            "id_commune": "MD"
          },
          {
            "id": "DB",
            "nom": "Dan_banga",
            "id_commune": "SH"
          },
          {
            "id": "RR",
            "nom": "Roura",
            "id_commune": "SH"
          },
          {
            "id": "AZ",
            "nom": "Azazala",
            "id_commune": "SH"
          },
          {
            "id": "GS",
            "nom": "Guidan_sadaou",
            "id_commune": "SH"
          },
          {
            "id": "GB",
            "nom": "Guidan_Bako_Maiganga",
            "id_commune": "SH"
          },
          {
            "id": "WR",
            "nom": "Warzou",
            "id_commune": "SH"
          },
          {
            "id": "GL",
            "nom": "Guidan_lali",
            "id_commune": "SH"
          },
          {
            "id": "SH",
            "nom": "Serkin_haoussa",
            "id_commune": "SH"
          },
          {
            "id": "ID",
            "nom": "In_doubba",
            "id_commune": "SH"
          },
          {
            "id": "KD",
            "nom": "koudatawa",
            "id_commune": "SH"
          },
          {
            "id": "FG",
            "nom": "Fagamniya",
            "id_commune": "SH"
          },
          {
            "id": "DJ",
            "nom": "Dajin_bawa",
            "id_commune": "SH"
          },
          {
            "id": "SK",
            "nom": "Sakope",
            "id_commune": "SH"
          },
          {
            "id": "KT",
            "nom": "Kotare",
            "id_commune": "MY"
          },
          {
            "id": "DK",
            "nom": "Dan_Kibiya",
            "id_commune": "AT"
          },
          {
            "id": "JT",
            "nom": "Jantoudou",
            "id_commune": "SH"
          },
          {
            "id": "GA",
            "nom": "Guidan_Ango",
            "id_commune": "SH"
          },
          {
            "id": "MR",
            "nom": "Makeraoua",
            "id_commune": "SH"
          },
          {
            "id": "SB",
            "nom": "Serkin_Bougaje",
            "id_commune": "MY"
          },
          {
            "id": "OL",
            "nom": "Ola",
            "id_commune": "MY"
          },
          {
            "id": "MK",
            "nom": "Malamaoua_Kaka",
            "id_commune": "SH"
          },
          {
            "id": "KG",
            "nom": "Kagadama",
            "id_commune": "SH"
          },
          {
            "id": "DS",
            "nom": "Dan_Sara",
            "id_commune": "SH"
          },
          {
            "id": "DT",
            "nom": "Dan_Tsuntsu",
            "id_commune": "SH"
          },
          {
            "id": "AW",
            "nom": "Arawraye",
            "id_commune": "SH"
          },
          {
            "id": "JG",
            "nom": "jigo",
            "id_commune": "TK"
          },
          {
            "id": "DT",
            "nom": "Dan_toudou",
            "id_commune": "TK"
          },
          {
            "id": "GT",
            "nom": "Guidan_tanko",
            "id_commune": "TK"
          },
          {
            "id": "BT",
            "nom": "Batchiri",
            "id_commune": "TK"
          },
          {
            "id": "TK",
            "nom": "Tchake",
            "id_commune": "TK"
          },
          {
            "id": "KD",
            "nom": "kandili",
            "id_commune": "TK"
          },
          {
            "id": "ZD",
            "nom": "zodi",
            "id_commune": "TK"
          },
          {
            "id": "BS",
            "nom": "Buzu_sugune",
            "id_commune": "TK"
          },
          {
            "id": "SS",
            "nom": "Sae_Saboua",
            "id_commune": "SS"
          },
          {
            "id": "ST",
            "nom": "Sae_saouni",
            "id_commune": "SS"
          },
          {
            "id": "BT",
            "nom": "Batata",
            "id_commune": "SS"
          },
          {
            "id": "KN",
            "nom": "Kounkouraye",
            "id_commune": "SS"
          },
          {
            "id": "KK",
            "nom": "Kakourou",
            "id_commune": "SS"
          },
          {
            "id": "AK",
            "nom": "Alkali",
            "id_commune": "SS"
          },
          {
            "id": "KD",
            "nom": "Kouka_Dan_Wada",
            "id_commune": "SS"
          },
          {
            "id": "KT",
            "nom": "Katchinawa",
            "id_commune": "SS"
          },
          {
            "id": "GS",
            "nom": "Guidan_salao",
            "id_commune": "SS"
          },
          {
            "id": "WD",
            "nom": "Wandarma",
            "id_commune": "SS"
          },
          {
            "id": "KM",
            "nom": "Kakouma",
            "id_commune": "SS"
          },
          {
            "id": "DD",
            "nom": "Dan_Dabo",
            "id_commune": "SS"
          },
          {
            "id": "DB",
            "nom": "Dan_Bako",
            "id_commune": "SS"
          },
          {
            "id": "MS",
            "nom": "Malamaye_salihou",
            "id_commune": "SS"
          },
          {
            "id": "SG",
            "nom": "Sae_Gawni",
            "id_commune": "SS"
          },
          {
            "id": "DG",
            "nom": "Dan_Gado",
            "id_commune": "SS"
          },
          {
            "id": "DT",
            "nom": "Dan_Bako_Tsarakawa",
            "id_commune": "SS"
          },
          {
            "id": "KY",
            "nom": "Kounyago",
            "id_commune": "SS"
          },
          {
            "id": "TT",
            "nom": "Tagaza_taji_wuka",
            "id_commune": "SS"
          },
          {
            "id": "MB",
            "nom": "Malamaye_sabouwa",
            "id_commune": "SS"
          },
          {
            "id": "TK",
            "nom": "Tchakire",
            "id_commune": "SS"
          },
          {
            "id": "EK",
            "nom": "Elkolta",
            "id_commune": "GR"
          },
          {
            "id": "KY",
            "nom": "Keylounbawa",
            "id_commune": "CD"
          },
          {
            "id": "DR",
            "nom": "Dargue",
            "id_commune": "CD"
          },
          {
            "id": "KW",
            "nom": "Kawaye_2",
            "id_commune": "CD"
          },
          {
            "id": "SB",
            "nom": "Sabonguero",
            "id_commune": "CD"
          },
          {
            "id": "BR",
            "nom": "Baradesaboua",
            "id_commune": "CD"
          },
          {
            "id": "K1",
            "nom": "Kata_kata_1",
            "id_commune": "CD"
          },
          {
            "id": "BS",
            "nom": "Boussaragui",
            "id_commune": "CD"
          },
          {
            "id": "KL",
            "nom": "Kollorouga",
            "id_commune": "CD"
          },
          {
            "id": "K2",
            "nom": "Kata_kata_2",
            "id_commune": "CD"
          },
          {
            "id": "GA",
            "nom": "Garin_Agada",
            "id_commune": "CD"
          },
          {
            "id": "YW",
            "nom": "Yan_gawana",
            "id_commune": "CD"
          },
          {
            "id": "DD",
            "nom": "Dan_Daniya",
            "id_commune": "CD"
          },
          {
            "id": "RY",
            "nom": "RugarYakaou",
            "id_commune": "CD"
          },
          {
            "id": "GB",
            "nom": "Garin_Bilo",
            "id_commune": "CD"
          },
          {
            "id": "GR",
            "nom": "Garin_Kasso",
            "id_commune": "CD"
          },
          {
            "id": "TT",
            "nom": "Totsa",
            "id_commune": "CD"
          },
          {
            "id": "KT",
            "nom": "Katomma",
            "id_commune": "CD"
          },
          {
            "id": "GK",
            "nom": "GuidanKalla",
            "id_commune": "CD"
          },
          {
            "id": "TD",
            "nom": "Tachdoua",
            "id_commune": "TD"
          },
          {
            "id": "TS",
            "nom": "Tessaoua",
            "id_commune": "TS"
          },
          {
            "id": "GR",
            "nom": "Gorga",
            "id_commune": "TS"
          },
          {
            "id": "TK",
            "nom": "Tssamiyal_koura",
            "id_commune": "TS"
          },
          {
            "id": "ZK",
            "nom": "Zangounan_Kolta",
            "id_commune": "TS"
          },
          {
            "id": "MK",
            "nom": "Maiki",
            "id_commune": "CD"
          },
          {
            "id": "ID",
            "nom": "laduwa",
            "id_commune": "CD"
          },
          {
            "id": "KM",
            "nom": "Kalgon_Mahamadou",
            "id_commune": "CD"
          },
          {
            "id": "GT",
            "nom": "Guidan_Tawaye",
            "id_commune": "CD"
          },
          {
            "id": "KB",
            "nom": "kutumbi",
            "id_commune": "CD"
          },
          {
            "id": "DS",
            "nom": "Dan_Farou_Sofoua",
            "id_commune": "CD"
          },
          {
            "id": "DM",
            "nom": "Dan_Malam_Inbougage",
            "id_commune": "CD"
          },
          {
            "id": "E2",
            "nom": "Eloum_II",
            "id_commune": "CD"
          },
          {
            "id": "AB",
            "nom": "Achabissa",
            "id_commune": "CD"
          },
          {
            "id": "MM",
            "nom": "Makeraoua_majidadi",
            "id_commune": "CD"
          },
          {
            "id": "EL",
            "nom": "Eloum_Lake",
            "id_commune": "CD"
          },
          {
            "id": "GD",
            "nom": "Guidan_dambou",
            "id_commune": "CD"
          },
          {
            "id": "AL",
            "nom": "Alalaba",
            "id_commune": "CD"
          },
          {
            "id": "SO",
            "nom": "Sabo_Garin_Oumaru",
            "id_commune": "CD"
          },
          {
            "id": "YG",
            "nom": "Yan_Gobirawa",
            "id_commune": "CD"
          },
          {
            "id": "DF",
            "nom": "Dan_Farou",
            "id_commune": "CD"
          },
          {
            "id": "SG",
            "nom": "Sarkin_Gardi",
            "id_commune": "CD"
          },
          {
            "id": "BK",
            "nom": "Baka_shanta",
            "id_commune": "CD"
          },
          {
            "id": "GZ",
            "nom": "Garin_Zagui",
            "id_commune": "CD"
          },
          {
            "id": "GN",
            "nom": "Gangara",
            "id_commune": "CD"
          },
          {
            "id": "BZ",
            "nom": "Bazai",
            "id_commune": "CD"
          },
          {
            "id": "SD",
            "nom": "Sirdawa",
            "id_commune": "CD"
          },
          {
            "id": "MN",
            "nom": "Mallamawa_Nari",
            "id_commune": "CD"
          },
          {
            "id": "TD",
            "nom": "Tchiadi",
            "id_commune": "TB"
          },
          {
            "id": "ZN",
            "nom": "Zanfarawa",
            "id_commune": "TB"
          },
          {
            "id": "DD",
            "nom": "Dan_dague",
            "id_commune": "TB"
          },
          {
            "id": "GG",
            "nom": "Garin_Gado",
            "id_commune": "TB"
          },
          {
            "id": "SL",
            "nom": "Souloulou",
            "id_commune": "GR"
          },
          {
            "id": "ND",
            "nom": "Nwalla_Dan_Sofoua",
            "id_commune": "GS"
          },
          {
            "id": "DA",
            "nom": "Dara_Amadou",
            "id_commune": "SM"
          },
          {
            "id": "BA",
            "nom": "Bamo",
            "id_commune": "DJ",
            "nom_commune": "Djirataoua"
          },
          {
            "id": "OU",
            "nom": "Oubandawaki Wadataou",
            "id_commune": "DJ",
            "nom_commune": "Djirataoua"
          },
          {
            "id": "RO",
            "nom": "Rougga Elh Bara",
            "id_commune": "DJ",
            "nom_commune": "Djirataoua"
          },
          {
            "id": "MA",
            "nom": "Magali Bara",
            "id_commune": "TK",
            "nom_commune": "Tchake"
          },
          {
            "id": "MI",
            "nom": "Magagi Bara",
            "id_commune": "TK",
            "nom_commune": "Tchake"
          },
          {
            "id": "ET",
            "nom": "El Tsamiya",
            "id_commune": "TK",
            "nom_commune": "Tchake"
          },
          {
            "id": "DN",
            "nom": "Dan Malan",
            "id_commune": "TD",
            "nom_commune": "Tachdoua"
          },
          {
            "id": "MÏ",
            "nom": "Maï jan guéro",
            "id_commune": "TD",
            "nom_commune": "Tachdoua"
          },
          {
            "id": "GU",
            "nom": "GUIDAN MOUSSA",
            "id_commune": "TD",
            "nom_commune": "Tachdoua"
          },
          {
            "id": "ZA",
            "nom": "Zangounan kolta",
            "id_commune": "MA",
            "nom_commune": "MAIJIRGUI"
          },
          {
            "id": "ME",
            "nom": "Mageni",
            "id_commune": "TS",
            "nom_commune": "Tessaoua"
          },
          {
            "id": "JA",
            "nom": "Janarou",
            "id_commune": "DJ",
            "nom_commune": "Djirataoua"
          },
          {
            "id": "KA",
            "nom": "Karate 1",
            "id_commune": "CD",
            "nom_commune": "Chadakori"
          },
          {
            "id": "KE",
            "nom": "Kawaye ",
            "id_commune": "CD",
            "nom_commune": "Chadakori"
          },
          {
            "id": "K ",
            "nom": "Kawaye 1 ",
            "id_commune": "CD",
            "nom_commune": "Chadakori"
          },
          {
            "id": "MAG",
            "nom": "Magga",
            "id_commune": "SS",
            "nom_commune": "Sae_Saboua"
          },
          {
            "id": "DL",
            "nom": "Dan Malam Wagé",
            "id_commune": "SS",
            "nom_commune": "Sae_Saboua"
          },
          {
            "id": "TC",
            "nom": "Tchakire Elh Maida",
            "id_commune": "SS",
            "nom_commune": "Sae_Saboua"
          },
          {
            "id": "MP",
            "nom": "Magga Peulh",
            "id_commune": "SS",
            "nom_commune": "Sae_Saboua"
          },
          {
            "id": "KAG",
            "nom": "Kagadama",
            "id_commune": "SS",
            "nom_commune": "Sae_Saboua"
          },
          {
            "id": "KO",
            "nom": "Kakouma Bara",
            "id_commune": "SS",
            "nom_commune": "Sae_Saboua"
          },
          {
            "id": "KS",
            "nom": "Katsinawa Guidan Kané",
            "id_commune": "SS",
            "nom_commune": "Sae_Saboua"
          },
          {
            "id": "SA",
            "nom": "Sarkin Anna Jika",
            "id_commune": "SS",
            "nom_commune": "Sae_Saboua"
          },
          {
            "id": "ZG",
            "nom": "Zangon Bawalé",
            "id_commune": "SS",
            "nom_commune": "Sae_Saboua"
          },
          {
            "id": "DI",
            "nom": "Dajin Arzika",
            "id_commune": "TC",
            "nom_commune": "Tchadoua"
          },
          {
            "id": "GO",
            "nom": "Guidan MOUSSA",
            "id_commune": "TC",
            "nom_commune": "Tchadoua"
          },
          {
            "id": "KR",
            "nom": "Koré",
            "id_commune": "TS",
            "nom_commune": "Tessaoua"
          },
          {
            "id": "DO",
            "nom": "Dossana",
            "id_commune": "TK",
            "nom_commune": "Tchake"
          },
          {
            "id": "MAA",
            "nom": "Magaria",
            "id_commune": "TK",
            "nom_commune": "Tchake"
          },
          {
            "id": "DE",
            "nom": "Dan kibia arewa",
            "id_commune": "SH",
            "nom_commune": "Serkin_Haoussa"
          },
          {
            "id": "GÉ",
            "nom": "Guidan Nadolé",
            "id_commune": "SH",
            "nom_commune": "Serkin_Haoussa"
          },
          {
            "id": "BC",
            "nom": "Bakachanta",
            "id_commune": "SH",
            "nom_commune": "Serkin_Haoussa"
          },
          {
            "id": "GC",
            "nom": "Guidan atchali",
            "id_commune": "CD",
            "nom_commune": "Chadakori"
          },
          {
            "id": "EO",
            "nom": "Eloum",
            "id_commune": "CD",
            "nom_commune": "Chadakori"
          },
          {
            "id": "RU",
            "nom": "Rougar kangue",
            "id_commune": "CD",
            "nom_commune": "Chadakori"
          },
          {
            "id": "DW",
            "nom": "Doggon Dawa",
            "id_commune": "CD",
            "nom_commune": "Chadakori"
          },
          {
            "id": "DAN",
            "nom": "Dan Bako",
            "id_commune": "CD",
            "nom_commune": "Chadakori"
          },
          {
            "id": "GUI",
            "nom": "Guidan Djibi",
            "id_commune": "CD",
            "nom_commune": "Chadakori"
          },
          {
            "id": "OB",
            "nom": "Ouban jada",
            "id_commune": "CD",
            "nom_commune": "Chadakori"
          },
          {
            "id": "KU",
            "nom": "Katouma",
            "id_commune": "CD",
            "nom_commune": "Chadakori"
          },
          {
            "id": "KAY",
            "nom": "Kayara",
            "id_commune": "CD",
            "nom_commune": "Chadakori"
          },
          {
            "id": "KOU",
            "nom": "koudoumouss",
            "id_commune": "CD",
            "nom_commune": "Chadakori"
          }
        ]
      }
      this.database.createSimpleDocReturn(village)
    });
  }


}
