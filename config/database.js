if(process.env.NODE_ENV === 'production'){
    module.exports = {mongoURI: 'mongodb://admin:1234@ds047581.mlab.com:47581/photeasy'}
} else {
    module.exports = {mongoURI:  'mongodb://localhost/photo-app'}
}