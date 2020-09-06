const mongoose = require('mongoose');
const mongoDBAtlasUri = "mongodb+srv://admin:admin@cluster0.oxcmc.mongodb.net/ccubeDB?retryWrites=true&w=majority";
const localMongoDBUri = 'mongodb://localhost:27017/CrudDB';
mongoose.connect(mongoDBAtlasUri, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false
} , (err) => {
    if(!err){
        console.log('MongoDB connection succesfull.');
    }else{
        console.log('Error in DB connection: ' + JSON.stringify(err, undefined, 2));
    }
});

module.exports = mongoose;