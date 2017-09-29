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

'use strict';

const AdminConnection = require('composer-admin').AdminConnection;
const BrowserFS = require('browserfs/dist/node/index');
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const BusinessNetworkDefinition = require('composer-common').BusinessNetworkDefinition;
const path = require('path');

require('chai').should();

const bfs_fs = BrowserFS.BFSRequire('fs');
const NS = 'org.acme.mynetwork';

describe('Coffee Shop', () => {

    // let adminConnection;
    let businessNetworkConnection;

    before(() => {
        BrowserFS.initialize(new BrowserFS.FileSystem.InMemory());
        const adminConnection = new AdminConnection({ fs: bfs_fs });
        return adminConnection.createProfile('defaultProfile', {
            type: 'embedded'
        })
            .then(() => {
                return adminConnection.connect('defaultProfile', 'admin', 'adminpw');
            })
            .then(() => {
                return BusinessNetworkDefinition.fromDirectory(path.resolve(__dirname, '..'));
            })
            .then((businessNetworkDefinition) => {
                return adminConnection.deploy(businessNetworkDefinition);
            })
            .then(() => {
                businessNetworkConnection = new BusinessNetworkConnection({ fs: bfs_fs });
                return businessNetworkConnection.connect('defaultProfile', 'coffee-shop', 'admin', 'adminpw');
            });
    });

    describe('#offerCoffee', () => {

        it('should be able to trade a coffee', () => {
            const factory = businessNetworkConnection.getBusinessNetwork().getFactory();

            // create the participant
            const customer = factory.newResource(NS, 'Customer', 'anucha.21681@hotmail.com');
            customer.balance = 1000000;
            customer.firstName = 'Anucha';
            customer.lastName = 'Prapphrom';

            const seller = factory.newResource(NS, 'Seller', 'john_snow@gmail.com');
            seller.balance = 10000;
            seller.firstName = 'John';
            seller.lastName = 'Snow';

            // create the asset
            const coffee = factory.newResource(NS, 'Coffee', 'Mocha');
            coffee.price = 100;
            coffee.quantity = 1000;
            coffee.seller = factory.newRelationship(NS, 'Seller', seller.$identifier);

            const coffeeOrderlist = factory.newResource(NS, 'CoffeeOrderlist', 'listingId:0001');
            coffeeOrderlist.state = 'ORDER';
            coffeeOrderlist.coffee = factory.newRelationship(NS, 'Coffee', coffee.$identifier);

            // create the trade transaction
            const order = factory.newTransaction(NS, 'Order');
            order.quantity = 1000;
            order.coffeeOrderlist = factory.newRelationship(NS, 'CoffeeOrderlist', coffeeOrderlist.$identifier);
            order.customer = factory.newRelationship(NS, 'Customer', customer.$identifier);

            // Get the asset registry.
            let coffeeOrderlistRegistry;
            return businessNetworkConnection.getAssetRegistry(NS + '.CoffeeOrderlist')
                .then((assetRegistry) => {
                    coffeeOrderlistRegistry = assetRegistry;
                    // add the coffeeOrderlist to the asset registry.
                    return coffeeOrderlistRegistry.add(coffeeOrderlist);
                })
                .then(() => {
                    // submit the transaction
                    return businessNetworkConnection.submitTransaction(order);
                })
                .then(() => {
                    // re-get the coffeeOrderlist
                    return coffeeOrderlistRegistry.get(coffeeOrderlist.$identifier);
                })
                .then((newOrderList) => {
                    // the order of the coffeeOrderlist should now be anucha
                    newOrderList.orders[0].$identifier.should.equal(order.$identifier);
                });
        });
    });
});