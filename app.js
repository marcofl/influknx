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

function handler(group_addr, datapoint) {
  dp = new Knx.Datapoint({ga: group_addr, dpt: datapoint.type}, connection);
  dp.on('change',  function(oldvalue, newvalue) {
    if (datapoint.name) {
      var short_name = datapoint.name
    } else {
      // remove common special chars to create a more machine readable tag
      var short_name = datapoint.description.replace(/([(,)])/g, '').replace(/([ ])/g, '_').replace(/[^\x00-\x7F]/g, '');
    }
    console.log("%s **** METRIC catched: GA: %j (%j, %j), value: %j",
      new Date().toISOString(),
      group_addr, datapoint.type, datapoint.description, newvalue);

    influx.writePoints([
      {
        measurement: datapoint.measurement,
        tags: { group_addr: group_addr, short_name: short_name },
        fields: { value: newvalue },
      }
    ])
  });
}

var dp = new Object;
var connection = Knx.Connection({
  ipAddr: config.knx.gateway_ip, ipPort: config.knx.gateway_port,
  handlers: {
    connected: function() {
      for(var group_addr in datapoints) {
        handler(group_addr, datapoints[group_addr])
      }
    },
    event: function (evt, src, dest, value) {
      console.log("%s **** EVENT %j: src: %j, dest: %j, value: %j",
        new Date().toISOString(),
        evt, src, dest, value);
    }
  }
});
