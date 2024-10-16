1. [ ] Replace manual recordings for sales & sales person payout
2. [ ] User Management
   1. [ ] Have user login to each dashboard
   2. [ ] Have 2 user roles:
      1. [ ] Admin
         1. [ ] Basic fields: Name, Username, Password
         2. [ ] Able to view and manage users
         3. [ ] Able to view and manage campaign
         4. [ ] Able to view and mangage order
      2. [ ] Sales Person
         1. [ ] Basic fields: Name, Username, Password
         2. [ ] Commission Rate
         3. [ ] View payout
            1. [ ] View payout by month
            2. [ ] View payout by campaign
3. [ ] Campaign Management
   1. [ ] 1 campaign = 1 post by 1 sales person
   2. [ ] Campaign fields:
      1. [ ] Title of campaign
      2. [ ] Social Media (Choose 1: Facebook / Instagram)
      3. [ ] Type (Choose 1: Post / Event / Live Post)
      4. [ ] URL (URL point to the post/event/live post)
      5. [ ] *Sales Person (Sales Person handle the campaign) *Cannot change
   3. [ ] Campaign can be deleted
      1. [ ] Commission deducted from sales person
   4. [ ] Campaign can have zero or many sales orders
4. [ ] Orders Management
   1. [ ] 1 order under 1 campaign
      1. [ ] Order ID
      2. [ ] Created Date
      3. [ ] Updated Date
      4. [ ] Order Status (Processing / Completed)
         1. [ ] Products (1 / M)
            1. [ ] Name
            2. [ ] Quantity
            3. [ ] Base Price
            4. [ ] Total Price (Calculated from Quantity x Base Price)
         2. [ ] *Campaign (Campaign that close the sales order) *Cannot change
   2. [ ] Product can key in on demands
   3. [ ] Calculate sales commission
      1. [ ] Commission rate is calculated based on the commission rate set by the time
         1. [ ] Order RM100, Commission Rate 10%, Commission Earned RM10; If later CR change to 15%, CE for that order no changed.
   4. [ ] Products Update
      1. [ ] Change quantity
      2. [ ] Change name
      3. [ ] Add new product
      4. [ ] Delete product
      5. [ ] Recalculate commission amount
   5. [ ] Delete order, Order can be deleted
      1. [ ] Commission deducted from sales person
5. [ ] Commission Payout
   1. [ ] Sales person can view sales commission
      1. [ ] filter by month and year
      2. [ ] Filter by campaign
