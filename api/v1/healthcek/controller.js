'use strict';

const sequelize = require('../../../config/db').Sequelize;
const logger = require('../../../config/logger');
const errMsg = require('../../../error/resError');
const rsMsg = require('../../../response/rs');
let health = { serverOk: false, dbOk: false };
const mqtt = require('mqtt');

exports.healtyCheck = async function (req, res) {
    health.serverOk = true;
    let asynccc = await updateHealthResponse();
    if (asynccc == 200) {
        return res.status(200).json(rsMsg());
    } else {
        return res.status(500).json(errMsg('01000'));
    }
}

async function checkMySql() {
    await sequelize.authenticate()
        .then(() => { health.dbOk = true })
        .catch(err => { health.dbOk = false });
}

async function updateHealthResponse() {
    await checkMySql();
    const isReady = health.serverOk && health.dbOk;

    if (isReady) {
        logger.debug('MSPOSYANDU_READINESS_SUCCESS] - Ready to serve traffic');
        return 200;
    } else {
        logger.error('[MSPOSYANDU_READINESS_ERROR] - Unable to serve traffic');
        return 500
    }
}

exports.mqtt = async function () {
    try {
        const topic = 'server-001'
        const qos = 0
        const clientId = 'emqx_nodejs_' + Math.random().toString(16).substring(2, 8)

        const client = mqtt.connect(process.env.HOST_MQTT, {
            ca: [process.env.CA_CERT_MQTT.replace(/\\n/gm, '\n')],
            username: process.env.USR_MQTT,
            password: process.env.PASS_MQTT,
            clientId: clientId
        })

        client.on("connect", function (connack) {
            console.log("client connected", connack);

            client.subscribe(topic, { qos }, (error) => {
                if (error) {
                    console.log('subscribe error:', error)
                    return
                }
                console.log(`Subscribe to topic '${topic}'`)
            })
        })

        client.on("error", function (err) {
            console.log("Error: " + err)
            if (err.code == "ENOTFOUND") {
                console.log("Network error, make sure you have an active internet connection")
            }
        })

        client.on("close", function () {
            console.log("Connection closed by client")
        })

        client.on("reconnect", function () {
            console.log("Client trying a reconnection")
        })

        client.on("offline", function () {
            console.log("Client is currently offline")
        })

        client.on('message', function(topic, message, packet) {
            console.log('message received', packet.payload.toString());
        })
        client.on("packetsend", function(packet) {
            console.log(packet, 'packetsend');
        }) 
    } catch (e) {
        logger.error('Internal server error - error mqtt', e.toString())
    }
}