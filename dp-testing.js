const Knx = require('knx');
const YAML = require("js-yaml");
const Fs = require("fs");

var config = YAML.load(Fs.readFileSync("config.yml"));
var datapoints = config.datapoints
var sources = config.sources

function handler(group_addr, datapoint) {
  dp = new Knx.Datapoint({ga: group_addr, dpt: datapoint.type}, connection);
  dp.on('change',  function(oldvalue, newvalue) {
    if (datapoint.name) {
      var short_name = datapoint.name
    } else {
      // remove common special chars to create a more machine readable tag
      var short_name = datapoint.description.replace(/([(,)])/g, '').replace(/([ ])/g, '_').replace(/[^\x00-\x7F]/g, '');
    }
    console.log("%s **** METRIC: GA: %j (%j, %j), value: %j",
      new Date().toISOString(),
      group_addr, datapoint.type, datapoint.description, newvalue);
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
  }
});
