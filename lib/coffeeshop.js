/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Track the order of a coffee from customer to seller
 * @param {org.acme.mynetwork.Order} order - the order to be processed
 * @transaction
 */
function Order(order) {
    var coffeeOrderlist = order.coffeeOrderlist;
    if (coffeeOrderlist.state !== 'ORDER') {
        throw new Error('Listing is not for order');
    }
    if (coffeeOrderlist.orders == null) {
        coffeeOrderlist.orders = [];
    }
    coffeeOrderlist.orders.push(order);
    return getAssetRegistry('org.acme.mynetwork.CoffeeOrderlist')
        .then(function (assetRegistry) {

            // emit a notification that a order has occurred
            var orderNotification = getFactory().newEvent('org.acme.mynetwork', 'OrderNotification');
            orderNotification.coffeeOrderlist = coffeeOrderlist;
            emit(orderNotification);

            return assetRegistry.update(coffeeOrderlist);
        });
}

/**
 * Track the delivery of a coffee from seller to customer
 * @param {org.acme.mynetwork.Delivery} Delivery - the delivery to be processed
 * @transaction
 */
function Delivery(delivery) {
    var coffeeOrderlist = delivery.coffeeOrderlist;
    if (coffeeOrderlist.state !== 'ORDER') {
        throw new Error('Listing is not for delivery');
    }
    if (coffeeOrderlist.orders == null) {
        coffeeOrderlist.orders = [];
    }
    var price = 0;
    var orders = coffeeOrderlist.orders;
    var coffee = coffeeOrderlist.coffee;
    
    for (var index = 0; index < orders.length; index++) {
        var order = orders[index];
                if(coffee.quantity < order.quantity){
                    throw new Error('Coffee not enough for delivary');
                }     
                var totalPrice = coffee.price*order.quantity;
                if(order.customer.balance < totalPrice){
                    throw new Error('Cutomer not enough balance');
                }
                coffee.seller.balance += totalPrice;
                order.customer.balance -= totalPrice;
                coffee.quantity -= order.quantity;
                getParticipantRegistry('org.acme.mynetwork.Customer')
                .then(function (customerRegistry) {
                    return customerRegistry.update(order.customer);
                })
                .then(function() {
                    return getParticipantRegistry('org.acme.mynetwork.Seller')
                })
                .then(function(sellerRegistry) {                  
                    return sellerRegistry.update(coffee.seller);
                });          
    }
    coffeeOrderlist.state = 'DELIVERED';
    
    return getAssetRegistry('org.acme.mynetwork.CoffeeOrderlist')
        .then(function (assetRegistry) {
            
            // emit a notification that a order has occurred
            var orderNotification = getFactory().newEvent('org.acme.mynetwork', 'OrderNotification');
            orderNotification.coffeeOrderlist = coffeeOrderlist;
            emit(orderNotification);

            return assetRegistry.update(coffeeOrderlist);
        })
        .then(function() {
            return getAssetRegistry('org.acme.mynetwork.Coffee')
        })
        .then(function(assetCoffeeRegistry) {
            return assetCoffeeRegistry.update(coffee);
        });
        
}

/**
 * Remove all high volume commodities
 * @param {org.acme.mynetwork.removeDeliveredCoffeeOrderList} remove - the remove to be processed
 * @transaction
 */
function removeDeliveredCoffeeOrderList(remove) {
    
        return getAssetRegistry('org.acme.mynetwork.CoffeeOrderlist')
            .then(function (assetRegistry) {
                return query('selectCoffeeOrderListWithDelivered')
                        .then(function (results) {
    
                            var promises = [];
    
                            for (var n = 0; n < results.length; n++) {
                                var orderList = results[n];
    
                                // emit a notification that a trade was removed
                                var removeNotification = getFactory().newEvent('org.acme.mynetwork', 'RemoveOrderNotification');
                                removeNotification.coffeeOrderlist = orderList;
                                emit(removeNotification);
    
                                // remove the coffeeOrderlist
                                promises.push(assetRegistry.remove(orderList));
                            }
    
                            // we have to return all the promises
                            return Promise.all(promises);
                        });
            });
    }