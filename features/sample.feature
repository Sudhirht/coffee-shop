#
# Licensed under the Apache License, Version 2   (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2  
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
Feature: CoffeeShop
    Background:
        Given I have deployed the business network definition ..
        And I have added the following participants of type org.acme.mynetwork.Customer
            | balance  | email                    | firstName  | lastName         |
            | 10000000 | anucha.21681@hotmail.com | Anucha     | Prapphrom        |
        And I have added the following participants of type org.acme.mynetwork.Seller
            | balance         | email                | firstName | lastName |
            | 200000          | john_snow@gmail.com  | John      | Snow     |
        And I have added the following assets of type org.acme.mynetwork.Coffee
            | coffeeName        | price           | quantity      | seller              |
            | Mocha             | 100             | 1000          | john_snow@gmail.com |
            | Cappuccino        | 80              | 1200          | john_snow@gmail.com |
        And I have added the following assets of type org.acme.mynetwork.CoffeeOrderlist
            | listingId        | state           | coffee      | 
            | id:0001          | ORDER           | Mocha       |
        And I have issued the participant org.acme.mynetwork.Customer#anucha.21681@hotmail.com with the identity anucha
        And I have issued the participant org.acme.mynetwork.Seller#john_snow@gmail.com with the identity john
    Scenario: Anucha can read all of the assets
        When I use the identity anucha
        Then I should have the following assets of type org.acme.mynetwork.Coffee
            | coffeeName        | price           | quantity      | seller              |
            | Mocha             | 100             | 1000          | john_snow@gmail.com |
            | Cappuccino        | 80              | 1200          | john_snow@gmail.com |
    Scenario: John can read all of the assets
        When I use the identity john
        Then I should have the following assets of type org.acme.mynetwork.Coffee
            | coffeeName        | price           | quantity      | seller              |
            | Mocha             | 100             | 1000          | john_snow@gmail.com |
            | Cappuccino        | 80              | 1200          | john_snow@gmail.com |
    Scenario: John can add assets that she owns
        When I use the identity john
        And I add the following asset of type org.acme.mynetwork.Coffee
            | coffeeName        | price           | quantity      | seller              |
            | Coco              | 60              | 1500          | john_snow@gmail.com |
        Then I should have the following assets of type org.acme.mynetwork.Coffee
            | coffeeName        | price           | quantity      | seller              |
            | Coco              | 60              | 1500          | john_snow@gmail.com |
    Scenario: John can update he assets
        When I use the identity john
        And I update the following asset of type org.acme.mynetwork.Coffee
            | coffeeName        | price           | quantity      | seller              |
            | Cappuccino        | 80              | 1400          | john_snow@gmail.com |
        Then I should have the following assets of type org.acme.mynetwork.Coffee
            | coffeeName        | price           | quantity      | seller              |
            | Cappuccino        | 80              | 1400          | john_snow@gmail.com |
    Scenario: John can remove her assets
        When I use the identity john
        And I remove the following asset of type org.acme.mynetwork.Coffee
            | coffeeName        |
            | Cappuccino        | 
        Then I should not have the following assets of type org.acme.mynetwork.Coffee
            | coffeeName       |
            | Cappuccino             |
    Scenario: Anucha can submit a transaction for her assets
        When I use the identity anucha
        And I submit the following transaction of type org.acme.mynetwork.Order
            | quantity | coffeeOrderlist      | customer                   |
            | 10       | id:0001                 | anucha.21681@hotmail.com   |
        Then I should have the following assets of type org.acme.mynetwork.Coffee
            | coffeeName        | price           | quantity      | seller              |
            | Mocha             | 100             | 1000          | john_snow@gmail.com |
            | Cappuccino        | 80              | 1200          | john_snow@gmail.com |
    Scenario: John can submit a transaction for his assets
        When I use the identity john
        And I submit the following transaction of type org.acme.mynetwork.Delivery
            | coffeeOrderlist |
            | id:0001            |
        Then I should have the following assets of type org.acme.mynetwork.Coffee
            | coffeeName        | price           | quantity      | seller              |
            | Mocha             | 100             | 1000           | john_snow@gmail.com |
            | Cappuccino        | 80              | 1200          | john_snow@gmail.com |
