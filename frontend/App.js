import React, { Component } from 'react'
import { StyleSheet, View, ScrollView } from 'react-native'
import { AddCustomer } from './AddCustomer'

export default class App extends Component {
  render() {
    return (
      
        <View style={styles.container}>
          <AddCustomer />
		</View>
      
    )
  }
}

const styles = StyleSheet.create({
  
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
})