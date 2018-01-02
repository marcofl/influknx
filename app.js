const Knx = require('knx');
const YAML = require("js-yaml");
const Fs = require("fs");
const Influx = require('influx');

var config = YAML.load(Fs.readFileSync("config.yml"));
var datapoints = config.datapoints
var sources = config.sources

function convert_value(value, dest) {
  switch (datapoints[dest].type) {
    case '4Byte':
      var buf = new ArrayBuffer(4);
      var view = new DataView(buf);
      value.forEach(function (b, i) {
        view.setUint8(i, b);
      });
      return view.getFloat32(0);
      break;
    case '4ByteUint':
      var buf = new ArrayBuffer(4);
      var view = new DataView(buf);
      value.forEach(function (b, i) {
        view.setUint8(i, b);
      });
      return view.getUint32(0);
      break;
  }
}

const influx = new Influx.InfluxDB({
  host: config.influxdb.host,
  database: config.influxdb.database,
  username: config.influxdb.username,
  password: config.influxdb.password,
})

var connection = Knx.Connection({
  ipAddr: config.knx.gateway_ip, ipPort: config.knx.gateway_port,
  handlers: {
    connected: function() {
      console.log('KNX connected!');
    },
    event: function (evt, src, dest, value) {
      if (dest in datapoints) { // filter to only react on the dataponts we want
        var description = datapoints[dest].description
        var source_desc = sources[src]
        if (datapoints[dest].name) {
          var short_name = datapoints[dest].name
        } else {
          // remove common special chars to create a more machine readable tag
          var short_name = datapoints[dest].description.replace(/([(,)])/g, '').replace(/([ ])/g, '_').replace(/[^\x00-\x7F]/g, '');
        }
        console.log("%s **** KNX EVENT: %j, src: %j (%j), dest: %j (%j), value: %j (%j), description: %j",
        new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
        evt, src, source_desc, dest, short_name, convert_value(value, dest), value, description);

        influx.writePoints([
          {
            measurement: datapoints[dest].measurement,
            tags: { group_addr: dest, short_name: short_name },
            fields: { value: convert_value(value, dest) },
          }
        ])
      }
    }
  }
});
