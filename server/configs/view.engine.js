const path = require('path')
const express = require('express')// commonjs

const configViewEngine = (app, express, path) => {
    // config template engine
    app.set('view engine', 'ejs')
    app.set('views', path.join('./server', 'views'))// thu muc chua file ejs

    //config static file
    app.use(express.static(path.join('./server', 'public')))// thu muc chua file static (css, js, image...)
}

module.exports = configViewEngine