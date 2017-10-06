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
 * @param {org.acme.mynetwork.AddOrder} item - the order to be processed
 * @transaction
 */
function AddOrder(item) {
    var NS = 'org.acme.mynetwork';
    var order = getFactory().newResource(NS, 'Order','' + item.id);
    order.state = 'ORDER';
    if (item.items == null) {
        item.items = [];
    }
    order.id = item.id;
    order.items = item.items;
    order.customer = item.customer;
    return getAssetRegistry(NS + '.Order')
        .then(function (assetRegistry) {

            // emit a notification that a order has occurred
            var orderNotification = getFactory().newEvent(NS, 'OrderNotification');
            orderNotification.order = order;
            emit(orderNotification);

            return assetRegistry.add(order);
        });
}

/**
 * Track the order of a coffee from customer to seller and status to wait
 * @param {org.acme.mynetwork.Waitting} order - the order to be processed
 * @transaction
 */
function Waitting(order) {
    var NS = 'org.acme.mynetwork';
    var order = order.order;
    if(order.state !== 'ORDER'){
        throw new Error('Order not for to wait');
    }
    order.state = 'WAIT';
    return getAssetRegistry(NS + '.Order')
        .then(function (assetRegistry) {

            // emit a notification that a order has occurred
            var orderNotification = getFactory().newEvent(NS, 'OrderNotification');
            orderNotification.order = order;
            emit(orderNotification);

            return assetRegistry.update(order);
        });
}

/**
 * Track the order of a coffee from customer to seller and status to Done
 * @param {org.acme.mynetwork.Done} order - the order to be processed
 * @transaction
 */
function Done(order) {
    var NS = 'org.acme.mynetwork';
  	var order = order.order;
    if(order.state !== 'WAIT'){
        throw new Error('Order not for to done');
    }   
    order.state = 'DONE';
    return getAssetRegistry(NS + '.Order')
        .then(function (assetRegistry) {

            // emit a notification that a order has occurred
            var orderNotification = getFactory().newEvent(NS, 'OrderNotification');
            orderNotification.order = order;
            emit(orderNotification);

            return assetRegistry.update(order);
        });
}

/**
 * Track the order of a coffee from customer to seller and status to delivery
 * @param {org.acme.mynetwork.Delivery} order - the order to be processed
 * @transaction
 */
function Delivery(order) {
    var NS = 'org.acme.mynetwork';
    var order = order.order;
    if(order.state !== 'DONE'){
        throw new Error('Order not for to deliver');
    }   
    order.state = 'DELIVERY';
    return getAssetRegistry(NS + '.Order')
        .then(function (assetRegistry) {

            // emit a notification that a order has occurred
            var orderNotification = getFactory().newEvent(NS, 'OrderNotification');
            orderNotification.order = order;
            emit(orderNotification);

            return assetRegistry.update(order);
        });
}

/**
 * Track the delivered of a coffee from seller to customer
 * @param {org.acme.mynetwork.Delivered} Delivered - the delivered to be processed
 * @transaction
 */
function Delivered(delivered) {
    var NS = 'org.acme.mynetwork';
    var order = delivered.order;
    if (order.state !== 'DELIVERY') {
        throw new Error('Order is not for delivery');
    }
    if (order.items == null) {
        order.items = [];
    }
    var items = order.items;
    
    for (var index = 0; index < items.length; index++) {
        var item = items[index];
        var coffee = item.coffee;
                if(coffee.quantity < item.quantity){
                    throw new Error('Coffee not enough for delivary');
                }     
                var totalPrice = coffee.price*item.quantity;
                if(order.customer.balance < totalPrice){
                    throw new Error('Cutomer not enough balance');
                }
                coffee.seller.balance += totalPrice;
                order.customer.balance -= totalPrice;
                coffee.quantity -= item.quantity;
                getParticipantRegistry(NS + '.Customer')
                .then(function (customerRegistry) {
                    return customerRegistry.update(order.customer);
                })
                .then(function() {
                    return getParticipantRegistry(NS + '.Seller')
                })
                .then(function(sellerRegistry) {                  
                    return sellerRegistry.update(coffee.seller);
                });          
    }
    order.state = 'DELIVERED';
    
    return getAssetRegistry(NS + '.Order')
        .then(function (assetRegistry) {
            
            // emit a notification that a order has occurred
            var orderNotification = getFactory().newEvent(NS, 'OrderNotification');
            orderNotification.order = order;
            emit(orderNotification);

            return assetRegistry.update(order);
        })
        .then(function() {
            return getAssetRegistry(NS + '.Coffee')
        })
        .then(function(assetCoffeeRegistry) {
            return assetCoffeeRegistry.update(coffee);
        });
        
}

/**
 * Remove all high volume commodities
 * @param {org.acme.mynetwork.RemoveDeliveredCoffeeOrder} remove - the remove to be processed
 * @transaction
 */
function RemoveDeliveredCoffeeOrder(remove) {
    var NS = 'org.acme.mynetwork';
        return getAssetRegistry(NS + '.Order')
            .then(function (assetRegistry) {
                return query('selectCoffeeOrderListWithDelivered')
                        .then(function (results) {
    
                            var promises = [];
    
                            for (var n = 0; n < results.length; n++) {
                                var order = results[n];
    
                                // emit a notification that a trade was removed
                                var removeNotification = getFactory().newEvent(NS, 'RemoveOrderNotification');
                                removeNotification.coffeeOrder = order;
                                emit(removeNotification);
    
                                // remove the coffeeOrderlist
                                promises.push(assetRegistry.remove(order));
                            }
    
                            // we have to return all the promises
                            return Promise.all(promises);
                        });
            });
    }