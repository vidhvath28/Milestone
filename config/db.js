const {Sequelize} = require("sequelize");

const sequelize = new Sequelize({
    dialect:"sqlite",
    storage:"./data/test_db.sqlite",
    logging:false
})

// {
//     development:{
//         dialect:"sqlite",
//         storage:"./data/dev-db.sqlite",
//         logging:false
//     },
//     test:{
//         dialect:"sqlite",
//         storage:"./data/test-db.sqlite",
//         logging:false
//     },
//     development:{
//         dialect:"sqlite",
//         storage:"./data/prod-db.sqlite",
//         logging:false
//     }

// }

module.exports = sequelize 