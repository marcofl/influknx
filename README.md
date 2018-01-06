# InfluKNX
A KNX to InfluxDB metrics logger written in NodeJS.
* Listens for configured KNX group addresses and sends the metrics to InfluxDB.
* Decodes RAW values seen on the KNX bus to usable values using datapoint definitions with https://bitbucket.org/ekarak/knx.js
* Use with NodeJS 8

## Installation
```
npm install
```

### Getting full stack up and running in docker
Get full stack with InfluxDB and Grafana up and running
* clone to some local directory
* adapt `docker-compose.yml` to your needs
* make sure `config.yml` is okay
* `sudo docker-compose up`
* chown the influxdb volume to uid `65001` (this should be done automatically somehow, not sure how yet)
* create database `influknx` in InfluxDB, for simple setup, no GRANT needed (as service is contained in docker network and isn't exposed, this should be fine)
* verify by watching the logs `sudo docker-compose logs -f --tail=1`
* login to grafana `http://<ip>:3000` and create the InfluxDB datasource, name it `influknx`to make sample dashboard work
* A sample dashboard can be importer from `grafana-examples/sample-dashboard.json`


## app.js
The actual application that listens to configured datapoints on the bus, decodes values and sends them to InfluxDB.
* Values are logged on change only (change compared to last value, done by ekarak/knx)
* configured via config.yml

### config.yaml example
See https://bitbucket.org/ekarak/knx.js/src/master/README-datapoints.md for supported data types. The datatype must match the data type of the group address in KNX ETS.
```
---
knx:
  gateway_ip: 10.10.0.105 # IP of your KNX gateway
  gateway_port: 3671
influxdb:
  host: influxdb
  # username: influknx
  # password: influknx
  database: influknx

datapoints:
  '7/0/0':                        # KNX group address where the
    description: 'House (Power)'  # used to generate the influxdb tag, should be unique
    type: 'DPT14'                 # important to select carefully, otherwise you'll get garbage values only!
    measurement: power            # name of the measurement in influxdb, group similar things together
  '7/0/1':
    description: 'Somethingelse2 (Power)'
    type: 'DPT14'
    measurement: power
    name: Somethingelse_Power     # overwrite the tag generated from `description` if you change description
  '7/0/21':
    description: 'Haus (Wirkenergie, T2)'
    type: 'DPT12'
    measurement: energy
```

## dp-testing.js
Test script to make sure you selected the correct DPT (data point type) before actually sending anything to InfluxDB any might messing up your data.
* uses the same config.yml config file

## csv-importer.js
A simple csv to InfluxDB importer. Can work with 2 column CSV without headers, in the format of `<unixtimestamp>,<value>` to import existing historical data 

### Example
```
node csv-importer.js Haus_Wirkleistung power 38779.hour.csv
# node csv-importer.js <tag> <measurement> <csv file path>
```

## Special Credit
* https://bitbucket.org/ekarak/knx.js which is "KNX made easy" imho
