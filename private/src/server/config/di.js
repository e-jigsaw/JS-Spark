/**
 * Created by syzer on 5/15/2014.
 */
'use strict';
var ROOT_PATH = __dirname + '/../';
var DATA_PATH = ROOT_PATH + '../../data/';
var PROD_SETTINGS = 'production';

var services = {
    _: function addService(di) {
        return require('lodash');
    },
    app: function addService(di) {
        var express = di.get('express');
        var app = express();
        app.use(di.get('bodyParser'));
        app.use(di.get('methodOverride'));

        var allowCrossDomain = function(req, res, next) {
            res.setHeader('Access-Control-Allow-Origin', '*'); //http://example.com ////config.allowedDomains
            res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'x-xsrf-token, X-Requested-With, X-HTTP-Method-Override, Authorization, Origin, Content-Type, Accept');
            res.header('Access-Control-Allow-Credentials', 'true'); //for basic auth

            next();
        };
        app.use(allowCrossDomain);

        return app;
    },
    bodyParser: function addService() {
        return require('body-parser').urlencoded({
            extended: true
        })
    },
    cookieParser: require('cookie-parser')(),
    compression: require('compression')(),
    connect: require('connect'),
    config: function addService(di) {
        var config = require(ROOT_PATH + 'config/config')(ROOT_PATH, DATA_PATH);
        // use adapter
        if (process.env.NODE_ENV === PROD_SETTINGS) {
            console.log('Running in production\n');
            return require(ROOT_PATH + 'config/prodConfig')(config);
        }
        return config;
    },
    'controller.index': function addService(di) {
        return require(ROOT_PATH + 'service/index')(ROOT_PATH);
    },
    defer: function addService(di) {
        return require(ROOT_PATH + 'service/defer')(
            di.get('promise')
        );
    },
    exec: require('child_process').exec,
    express: require('express'),
    events: require('events'),
    http: require('http'),
    io: require('socket.io'),
    'io.server': function addService(di) {
        var server = di.get('server');

        return di.get('io').listen(server);
    },
    port: (process.env.PORT || 9000),
    promise: require('bluebird'),
    log: function addService(di) {
        return require(ROOT_PATH + 'service/logging')(
            di.get('config'),
            di.get('winston')
        ).createLog();
    },
    'server': function addService(di) {
        var app = di.get('app');
        // can easily switch here for https
        return di.get('http').createServer(app);
    },
    'service.dispatcher': function addService(di) {
        return require(ROOT_PATH + 'service/dispatcher')(
            di.get('log'),
            di.get('io.server'),
            di.get('service.serializer'),
            di.get('_'),
            di.get('service.workers')
        );
    },
    'service.jsSpark': function addService(di) {
        return require(ROOT_PATH + 'service/jsSpark')(
            di.get('service.taskManager'),
            di.get('defer')
        );
    },
    'service.taskManager': function addService(di) {
        var taskManager = require(ROOT_PATH + 'service/taskManager')(
            di.get('config'),
            di.get('log'),
            di.get('service.dispatcher'),
            di.get('service.workers')
        );
        taskManager.init();
        return taskManager;
    },
    'service.workers': function addService(di) {
        return require(ROOT_PATH + 'service/workers')(
            di.get('log'),
            di.get('_')
        );
    },
    // Lets you use HTTP verbs such as PUT or DELETE in places you normally can't.
    methodOverride: require('method-override')(),
    'service.serializer': function addService(di) {
        return require(ROOT_PATH + 'service/serializer')(
            JSON
        );
    },
    session: function addService(di) {
        return require('express-session')({
            secret: 'shhhhhhhhh!'
        });
    },
    util: require('util'),
    winston: require('winston')
};
module.exports.services = services;
