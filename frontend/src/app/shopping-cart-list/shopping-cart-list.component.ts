import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';

import { ShoppingCartItem, ProductModel } from '../_shared/app.models';


/**
 * The list showing all the unique items in the cart and their quantity
 */
@Component({
  selector: 'app-shopping-cart-list',
  templateUrl: './shopping-cart-list.component.html',
  styleUrls: ['./shopping-cart-list.component.css']
})
export class ShoppingCartListComponent implements OnChanges {

  private products : Map<number, ProductModel> = new Map<number, ProductModel>();

  @Input("items")
  public cartList : Array<ShoppingCartItem> = [];

  @Output("totalPriceChange")
  public totalPriceEmitter = new EventEmitter<number>();

  @Output("itemChange")
  public itemQtyEmitter = new EventEmitter<ShoppingCartItem>();

  @Output("itemDelete")
  public itemDelEmitter = new EventEmitter<ShoppingCartItem>();
  public loadedCount = 0;

  constructor() { }

  ngOnChanges() {
    this.fillProducts()
  }

  /**
   * Fill the cart with product details
   */
  private fillProducts() {
    this.loadedCount = 0;
    this.cartList
      .filter(item => {
        if(item.productId in this.products){
          this.loadedCount++;
          return false;
        }
        return true;
      })
      .forEach(item => {
        item.product.subscribe(
          (product : ProductModel) => {
            this.loadedCount++;
            this.products[item.productId] = product;
            if(this.loadedCount >= this.cartList.length) {
              // Once all products are loaded update the price
              console.log("Emit", this.totalPrice());
              this.totalPriceEmitter.emit(this.totalPrice());
            }
          }
        );
      });
  }

  /**
   * Update the quantity of a cart item
   */
  public updateQty(event, item : ShoppingCartItem, diff : number) {
    item.quantity += diff;
    this.itemQtyEmitter.emit(item);
    this.totalPriceEmitter.emit(this.totalPrice());
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Delete an item from the list
   */
  public deleteItem(event, item : ShoppingCartItem) {
    this.itemDelEmitter.emit(item);
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Check if a product item is loaded from the server
   */
  public productLoaded(item : ShoppingCartItem) {
    return item.productId in this.products;
  }

  /**
   * Get product details for a cart item
   */
  public product(item : ShoppingCartItem) {
    return this.products[item.productId];
  }

  /**
   * Total number of unique items in cart
   */
  public totalCount() : number{
    let count = 0;
    this.cartList.forEach((item) => {
      count += item.quantity
    });
    return count;
  }

  /**
   * Calculate total price for the cart
   */
  public totalPrice() : number{
    let totalPrice = 0;
    this.cartList.forEach((item) => {
      totalPrice += this.getSubtoal(item);
    });
    return totalPrice;
  }

  /**
   * Get sum for a single item
   */
  public getSubtoal(item : ShoppingCartItem){
    const product = this.products[item.productId];
    if(product){
      return this.calculatePrice[product.on_sale](item.quantity, product);
    }
    return 0;
  }

  /**
   * Calculate price based on sale type
   */
  private calculatePrice = {
    NO_SALE: (quantity, product) => {
      return quantity * product.price;
    },

    PRICE_MOD: (quantity, product) => {
      return quantity * parseFloat((product.price * product.price_mod).toFixed(2));
    },

    PACKAGE: (quantity, product) => {
      const { package_get_count, package_pay_count, price } = product;
      const discounted = Math.floor(quantity / package_get_count) * package_pay_count * price;
      const remainder = (quantity % package_get_count) * price;
      return discounted + remainder;
    },
  };

}
