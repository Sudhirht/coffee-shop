# My Coffee Shop network

> This is the "Coffee Shop" of Hyperledger Composer.

This business network defines:

**Participant**
`Customer` `Seller` `DeliveryMan`

**Asset**
`Coffee` `Order`

**Transaction**
`AddOrder` `Waitting` `Done` `Delivery` `Delivered` `RemoveDeliveredCoffeeOrder`

**Event**
`OrderNotification` `RemoveOrderNotification`

**Enum**
`OrderState`

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
Create a `DeliveryMan` participant:

```
{
  "$class": "org.acme.mynetwork.DeliveryMan",
  "balance": 100,
  "email": "rogan_crack@gmail.com",
  "firstName": "Rogan",
  "lastName": "Crack"
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
Create a `Order` asset:

```
{
  "$class": "org.acme.mynetwork.Order",
  "id": "id:0001",
  "state": "ORDER",
  "items": [{
  "$class": "org.acme.mynetwork.Item",
  "quantity": 10,
  "coffee": "resource:org.acme.mynetwork.Coffee#Mocha"
  }],
  "customer": "resource:org.acme.mynetwork.Customer#anucha.21681@hotmail.com"
}
```

Submit a `AddOrder` transaction:

```
{
  "$class": "org.acme.mynetwork.AddOrder",
  "id": "id:0001",
  "items": [{
  "$class": "org.acme.mynetwork.Item",
  "quantity": 10,
  "coffee": "resource:org.acme.mynetwork.Coffee#Mocha"
  }],
  "customer": "resource:org.acme.mynetwork.Customer#anucha.21681@hotmail.com"
}
```
Submit a `Waitting` transaction:

```
{
  "$class": "org.acme.mynetwork.Waitting",
  "order": "resource:org.acme.mynetwork.Order#id:0001"
}
```
Submit a `Done` transaction:

```
{
  "$class": "org.acme.mynetwork.Delivery",
  "order": "resource:org.acme.mynetwork.Order#id:0001"
}
```
Submit a `Delivery` transaction:

```
{
  "$class": "org.acme.mynetwork.Delivery",
  "order": "resource:org.acme.mynetwork.Order#id:0001"
}
```
Submit a `Delivered` transaction:

```
{
  "$class": "org.acme.mynetwork.Delivered",
  "order": "resource:org.acme.mynetwork.Order#id:0001"
}
```
Submit a `removeDeliveredCoffeeOrder` transaction:

```
{
  "$class": "org.acme.mynetwork.removeDeliveredCoffeeOrder"
}
```

After submitting this transaction, you should now see the transaction in the Transaction Registry and that a `OrderNotification` has been emitted. As a result, the value of the `id:0001` should now be `new value` in the Asset Registry.

`removeDeliveredCoffeeOrder` use to delete `Order` state status is DELIVERED.

`RemoveOrderNotification` has been emit when summit transaction `removeDeliveredCoffeeOrder`.

Enum `OrderState` -> ORDER, WAIT, DONE, DELIVERY, DELIVERED

Congratulations!
# coffee-shop
