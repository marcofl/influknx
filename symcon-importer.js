var csv = require('csv-parser')

const YAML = require("js-yaml");
const Fs = require("fs");
const Influx = require('influx');

var config = YAML.load(Fs.readFileSync("config.yml"));
const influx = new Influx.InfluxDB({
  host: 'localhost',
  database: config.influxdb.database,
  precision: 's'
})

var args = process.argv.slice(2)
var csvFilePath = args[2]
console.log("Input: %j", csvFilePath)
var name = args[0]
console.log("short_name: %j", name)
var measurement = args[1]
console.log("measurement: %j", measurement)


Fs.createReadStream(csvFilePath)
  .pipe(csv({headers: ['time', 'value']}))
  .on('data', function (data) {
    var date = new Date(data.time * 1000)
    console.log("time: %j / %j, value: %j", data.time, date, Math.round(data.value))
    influx.writePoints([
      {
        measurement: measurement,
        timestamp: date,
        tags: { short_name: name },
        fields: { value: Math.round(data.value) },
      }
    ])
  })
