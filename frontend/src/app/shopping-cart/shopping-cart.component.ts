import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { ShoppingCartService } from '../_shared/services/shopping-cart.service';
import { ShoppingCartItem } from '../_shared/app.models';


@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.css']
})
export class ShoppingCartComponent implements OnInit {

  items : Array<ShoppingCartItem> = [];
  private shoppingCartSub : Subscription;
  constructor(private shoppingCart : ShoppingCartService) { }

  ngOnInit() {
    this.shoppingCartSub = this.shoppingCart.getShoppingCart().subscribe((items : Array<ShoppingCartItem>) => {
      this.items = items;
    })
  }

  ngOnDestroy(){
    this.shoppingCartSub.unsubscribe();
  }

  private deleteItem(item : ShoppingCartItem){
    this.shoppingCart.removeItem(item.productId);
  }

  private changeItem(item : ShoppingCartItem){
    this.shoppingCart.updateItem(item);
  }

  private totalPrice(): number {
    return 0; // todo
  }

  private checkout() {
    return; // todo
  }

  private clearCart() {
    this.shoppingCart.clearCart();
  }

}
