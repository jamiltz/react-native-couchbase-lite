/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  ListView,
  TouchableHighlight
} = React;

var ReactCBLite = require('react-native').NativeModules.ReactCBLite;
ReactCBLite.init(5984, 'admin', 'password', (e) => {
});

var {manager} = require('react-native-couchbase-lite');
var database = new manager('http://admin:password@localhost:5984/', 'myapp');

var ReactNativeCouchbaseLiteExample = React.createClass({
  render: function () {
    return (
      <Home></Home>
    );
  }
});

var Home = React.createClass({
  getInitialState() {
    return {
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      })
    }
  },
  componentDidMount() {
    database.getInfo()
      .then(res => {
        if (res.status == 404) { // database doesn't exist
          return database.createDatabase();
        }
      })
      .then(res => {
        return database.createDesignDocument('main', {
          'views': {
            'docs': {
              'map': 'function (doc) {if (doc.test_doc) {emit(doc._id, doc._rev);}}'
            }
          }
        })
      })
      .then(res => {
        database.replicate('http://localhost:4984/myapp', 'myapp', true);
        database.replicate('myapp', 'http://localhost:4984/myapp', true);
      });
  },
  _onPressCreate() {
    database.updateDocument({test_doc: true}, 123)
      .then(res => {
        console.log(res);
        console.log('Doc with ID ' + res._id + ' created');
      })
  },
  _onPressUpdate() {
    database.getDocument('123')
      .then(res => {
        res.time = new Date();
        database.updateDocument(res, 123, res._rev)
          .then(res => {
            console.log(res);
          })
      })
  },
  _onPressRefresh() {
    database.queryView('main', 'docs')
      .then(res => {
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(res.rows)
        });
      });
  },
  _onPressDelete() {
    database.deleteDatabase()
      .then(res => {
        if (res.ok) {
          alert('db deleted');
        }
      });
  },
  render() {
    return (
      <View>
        <TouchableHighlight onPress={this._onPressDelete}>
          <Text>Delete database</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={this._onPressCreate}>
          <Text>Create doc with ID 123</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={this._onPressUpdate}>
          <Text>Update doc with ID 123</Text>
        </TouchableHighlight>
        <TouchableHighlight onPress={this._onPressRefresh}>
          <Text>Refresh</Text>
        </TouchableHighlight>
        <ListView   dataSource={this.state.dataSource} 
                    renderRow={this.renderRow} />
      </View>
    )
  },
  renderRow(row) {
    return (
      <View>
        <Text>ID: {row.key}, Rev: {row.value}</Text>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  rightContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  year: {
    textAlign: 'center',
  },
  thumbnail: {
    width: 53,
    height: 81,
  },
  listView: {
    backgroundColor: '#F5FCFF',
  },
  seqTextLabel: {
    textAlign: 'center',
    margin: 5
  }
});

AppRegistry.registerComponent('ReactNativeCouchbaseLiteExample', () => ReactNativeCouchbaseLiteExample);