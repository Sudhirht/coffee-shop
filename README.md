# My Coffee Shop network

> This is the "Coffee Shop" of Hyperledger Composer.

This business network defines:

**Participant**
`Customer` `Seller`

**Asset**
`Coffee` `CoffeeOrderlist`

**Transaction**
`Order` `Delivery`

**Event**
`OrderNotification`

Coffee are owned by a Seller, and the value property on a CoffeeOrderlist can be modified by submitting a Order and Delivery Transaction. The Order and Delivery Transaction emits a OrderNotificationEvent that notifies applications of the old and new values for each modified CoffeeOrderlist Asset.

To test this Business Network Definition in the **Test** tab:

Create a `Customer` participant:

```
{
  "$class": "org.acme.mynetwork.Customer",
  "balance": 1000000,
  "email": "anucha.21681@hotmail.com",
  "firstName": "Anucha",
  "lastName": "Prapphrom"
}
```
Create a `Seller` participant:

```
{
  "$class": "org.acme.mynetwork.Seller",
  "balance": 10000,
  "email": "john_snow@gmail.com",
  "firstName": "John",
  "lastName": "Snow"
}
```

Create a `Coffee` asset:

```
{
  "$class": "org.acme.mynetwork.Coffee",
  "coffeeName": "Mocha",
  "price": 100,
  "quantity": 1000,
  "seller": "resource:org.acme.mynetwork.Seller#john_snow@gmail.com"
}
```
Create a `CoffeeOrderlist` asset:

```
{
  "$class": "org.acme.mynetwork.CoffeeOrderlist",
  "listingId": "listingId:0001",
  "state": "ORDER",
  "coffee": "resource:org.acme.mynetwork.Coffee#Mocha"
}
```

Submit a `Order` transaction:

```
{
  "$class": "org.acme.mynetwork.Order",
  "quantity": 10,
  "coffeeOrderlist": "resource:org.acme.mynetwork.CoffeeOrderlist#listingId:0001",
  "customer": "resource:org.acme.mynetwork.Customer#anucha.21681@hotmail.com"
}
```
Submit a `Delivery` transaction:

```
{
  "$class": "org.acme.mynetwork.Delivery",
  "coffeeOrderlist": "resource:org.acme.mynetwork.CoffeeOrderlist#listingId:0001"
}
```


After submitting this transaction, you should now see the transaction in the Transaction Registry and that a `OrderNotification` has been emitted. As a result, the value of the `listingId:0001` should now be `new value` in the Asset Registry.

Congratulations!
# coffee-shop
