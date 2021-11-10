import React, { Component } from 'react'
import { StyleSheet, Text, View, Button, Modal, TextInput } from 'react-native'
import { ApolloClient, HttpLink, InMemoryCache } from 'apollo-boost'
import { ApolloProvider, graphql, Mutation } from 'react-apollo'
import gql from 'graphql-tag'

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'http://192.168.101.11:3000/graphql',
  }),
  cache: new InMemoryCache(),
})

const customerQuery = gql`
  query {
    customerList {
        id name phone timestamp
      }
  }
`

const addCustomer = gql`
  mutation customerAdd($customer: CustomerInputs!) {
      customerAdd(customer: $customer) {
        id
      }
    }
`



export class AddCustomer extends Component {
  state = {
    name:'',
    phone:'',
  }
  


  render() {
    return (
      <ApolloProvider client={client}>
        <View style={styles.container}>
          <Mutation mutation={addCustomer} refetchQueries={[{ query: customerQuery }]}>
            {(addCustomerMutation, { data }) => (
              <View>
                <Text style={styles.welcome}>Customer data:</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={(text) => this.setState({ name: text })}
                  value={this.state.name}
                  placeholder="name"
                />
                <TextInput
                  style={styles.input}
                  onChangeText={(text) => this.setState({ phone: text })}
                  value={this.state.phone}
                  placeholder="phone"
                />
				<Text style={styles.welcome}></Text>
                <Button
                  onPress={() => {
					const customer = {
						name: this.state.name, phone: this.state.phone,
					}
                    addCustomerMutation({
                      variables: {
                        customer:customer
                      },
                    })
                      .then((res) => res)
                      .catch((err) => <Text>{err}</Text>)
                    this.setState({ name: '', phone: '' })
                  }}
                  title="Add Customer"
                />
              </View>
            )}
          </Mutation>
        </View>
      </ApolloProvider>
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
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  input: {
    height: 30,
    width: 150,
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 5,
    padding: 1,
  },
})