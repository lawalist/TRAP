import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, AlertController, ModalController, IonicPage } from 'ionic-angular';
import { Validators, FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { PouchdbProvider } from '../../../providers/pouchdb-provider';
/**
 * Generated class for the ingredientPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-ingredient',
  templateUrl: 'ingredient.html',
})
export class IngredientPage {

  ingredientForm: FormGroup;
  ingredient: any = null;
  ingredients: any = [];
  cultures: any = [];
  varietes: any = [];
  detail: any;
  index: number = -1;
  constructor(public navCtrl: NavController, public viewCtl: ViewController, public servicePouchdb: PouchdbProvider, public formBuilder: FormBuilder, public modelCtl: ModalController, public navParams: NavParams) {
    
    this.ingredients = this.navParams.data.ingredients;
    if(this.navParams.data.detail){
      this.detail = this.navParams.data.detail;
    }
    if(this.navParams.data.ingredient && this.navParams.data.ingredient != ''){
      this.ingredient = this.navParams.data.ingredient;
      this.index = this.navParams.data.index;
      this.editForm(this.ingredient)
    }else{
      this.initForm();
    }
  }

  initForm(){

    this.ingredientForm = this.formBuilder.group({
      code: ['', [Validators.required, Validators.pattern('[A-Za-z0-9_-]{1,50}')]],
      type:['', Validators.required],
      nom: ['', Validators.required],
      variete: [''],
      quantite: [''],
      unite: [''],
      cout: [0],
      //montant_total: [0],
      choix: [''],
      est_obligatoire:['non'],
      description: [''],
  });
}

editForm(ingredient){

  this.ingredientForm = this.formBuilder.group({
    code:[ingredient.code , [Validators.required, Validators.pattern('[A-Za-z0-9_-]{1,50}')]],
    type:[ingredient.type, Validators.required],
    nom: [ingredient.nom, Validators.required],
    variete: [ingredient.variete],
    quantite: [ingredient.quantite],
    unite: [ingredient.unite],
    cout: [ingredient.cout],
    montant_total: [ingredient.montant_total],
    choix: [ingredient.choix],
    est_obligatoire:[ingredient.est_obligatoire],
    description: [ingredient.description],
  });

  if(ingredient.type == 'culture'){
    this.getCulturesForEdit(ingredient.nom);
  }
}

getTypeCultyre(type){
  if(type && type == 'culture'){
    this.getAllCultures();
  }else{
    this.ingredientForm.controls.variete.setValue('');
  }
}


getVariete(nomCulture){
  let cls: any = [];
  this.servicePouchdb.getPlageDocsRapide('variete', 'variete:\uffff').then((v) => {
    if(v){
      v.forEach((vl) => {
        if(nomCulture == vl.doc.data.culture){
          cls.push(vl);
        }
      });
    }
    this.varietes = cls
  });
}

getAllCultures(){
  this.servicePouchdb.getPlageDocsRapide('culture:', 'culture:\uffff').then((c) => {
    if(c){
        this.cultures = c;
    }
  });
}

getCulturesForEdit(culture){
  this.servicePouchdb.getPlageDocsRapide('culture:', 'culture:\uffff').then((c) => {
    if(c){
        this.cultures = c;
        this.getVariete(culture);
    }
  });
}

valider(ingredient){
  let res: number = 1;
  for(let i = 0; i < this.ingredients.length; i++){
    if((this.index == -1 && ingredient.code == this.ingredients[i].code) || (this.index != -1 && this.index != i && ingredient.code == this.ingredients[i].code) || (this.index == -1 && ingredient.nom == this.ingredients[i].nom) || (this.index != 1 && this.index != i && ingredient.nom == this.ingredients[i].nom)){
      res = 0;
      break;
    }
  }

  return res;
}

actionForm(){
  let ingredient = this.ingredientForm.value;
  //this.ingredients.push(ingredient)
  if(this.valider(ingredient) == 1){
    this.viewCtl.dismiss(ingredient);
  }else{
    alert('Erreur: Les ingrédients doivent avoir des code et des nom uniques!!')
  }
  
}

annuler(){
  this.viewCtl.dismiss();
}

  //ionViewDidLoad() {
    //this.initForm()
  //}

}
