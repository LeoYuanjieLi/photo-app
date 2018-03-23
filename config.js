'use strict';
// I don't understand this part... how do we know where the data is stored?
exports.DATABASE_URL = process.env.DATABASE_URL	|| 'mongodb://localhost/photo-app';
exports.PORT = process.env.PORT || 8080;