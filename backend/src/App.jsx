const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');

function jsonDateReviver(key, value) {
  if (dateRegex.test(value)) return new Date(value);
  return value;
}

class DisplayHomepage extends React.Component {
  render() {
    return (
      <div className="homepage">This is the homepage of the waiting system.</div>
    );
  }
}

function CustomerRow(props) {
  const customer = props.customer;
  return (
    <tr>
        <td>{customer.id}</td>
        <td>{customer.name}</td>
        <td>{customer.phone}</td>
        <td>{customer.timestamp.toDateString()}</td>
    </tr>
  );
}

function CustomerTable(props) {
  const customerRows = props.customers.map(customer =>
    <CustomerRow key={customer.id} customer={customer} />
  );

  return (
    <table className="bordered-table">
        <thead>
          <tr>
            <th>Serial No.</th>
            <th>Name</th>
            <th>Phone number</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {customerRows}
        </tbody>
    </table>
  );
}



class CustomerAdd extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const form = document.forms.customerAdd;
    const customer = {
      name: form.name.value, phone: form.phone.value,
    }
    this.props.createCustomer(customer);
    form.name.value = ""; form.phone.value = "";
  }

  render() {
    return (
      <form name="customerAdd" onSubmit={this.handleSubmit}>
        <input type="text" name="name" placeholder="Name" />&emsp;  
        <input type="text" name="phone" placeholder="Phone Number" />&emsp;
        <button>Add</button>
      </form>
    );
  }
}

class CustomerDelete extends React.Component {

  constructor() {
  super();
    this.handleDelete = this.handleDelete.bind(this);
  }

  handleDelete(e) {
    e.preventDefault();
    const form = document.forms.customerDelete;
    const customer = {
      name: form.name.value, phone: form.phone.value,
    }
    this.props.deleteCustomer(customer);
    form.name.value = "";form.phone.value = "";

    
}

render() {
  return (
    <form name="customerDelete" onSubmit={this.handleDelete}>
      <input type="text" name="name" placeholder="Name" />&emsp;
      <input type="text" name="phone" placeholder="Phone Number" />&emsp;
      <button>Delete</button>
    </form>
  );
}
}

async function graphQLFetch(query, variables = {}) {
  try {
    const response = await fetch('/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({ query, variables })
    });
    const body = await response.text();
    const result = JSON.parse(body, jsonDateReviver);

    if (result.errors) {
      const error = result.errors[0];
      if (error.extensions.code == 'BAD_USER_INPUT') {
        const details = error.extensions.exception.errors.join('\n ');
        alert(`${error.message}:\n ${details}`);
      } else {
        alert(`${error.extensions.code}: ${error.message}`);
      }
    }
    return result.data;
  } catch (e) {
    alert(`Error in sending data to server: ${e.message}`);
  }
}

class CustomerList extends React.Component {
  constructor() {
    super();
    this.state = { customers: [] };
    this.createCustomer = this.createCustomer.bind(this);
    this.deleteCustomer = this.deleteCustomer.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  async loadData() {
    const query = `query {
      customerList {
        id name phone timestamp
      }
    }`;

    const data = await graphQLFetch(query);
    if (data) {
      this.setState({ customers: data.customerList });
    }
  }

  async createCustomer(customer) {
    const query = `mutation customerAdd($customer: CustomerInputs!) {
      customerAdd(customer: $customer) {
        id
      }
    }`;

    const data = await graphQLFetch(query, { customer });
    if (data) {
      this.loadData();
    }
  }

  async deleteCustomer(customer) {
    const query = `mutation customerDelete($customer: CustomerInputs!) {
      customerDelete(customer: $customer) {
        id}
    }`;

    const data = await graphQLFetch(query,{ customer });
    if (data) {
      this.loadData();
    }
  }

  render() {
    return (
      <React.Fragment>
        <h1>Hotel California Waitlist System</h1>
        <DisplayHomepage />
        <hr />
        <CustomerAdd createCustomer={this.createCustomer} />
        <hr />
        <CustomerDelete deleteCustomer={this.deleteCustomer}/>
        <hr />
        <CustomerTable customers={this.state.customers} />
        <br /> 
      </React.Fragment>
    );
  }
}

const element = <CustomerList />;

ReactDOM.render(element, document.getElementById('contents'));