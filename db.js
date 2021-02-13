const mongoose = require('mongoose');
const mongoDBAtlasUri = process.env.MONGODB_ATLAS_URI;
const localMongoDBUri = 'mongodb://localhost:27017/CrudDB';
mongoose.connect(mongoDBAtlasUri, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true
} , (err) => {
    if(!err){
        console.log('MongoDB connection succesfull.');
    }else{
        console.log('Error in DB connection: ' + JSON.stringify(err, undefined, 2));
    }
});

module.exports = mongoose;