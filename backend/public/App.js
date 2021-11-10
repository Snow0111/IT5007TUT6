const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');

function jsonDateReviver(key, value) {
  if (dateRegex.test(value)) return new Date(value);
  return value;
}

class DisplayHomepage extends React.Component {
  render() {
    return /*#__PURE__*/React.createElement("div", {
      className: "homepage"
    }, "This is the homepage of the waiting system.");
  }

}

function CustomerRow(props) {
  const customer = props.customer;
  return /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, customer.id), /*#__PURE__*/React.createElement("td", null, customer.name), /*#__PURE__*/React.createElement("td", null, customer.phone), /*#__PURE__*/React.createElement("td", null, customer.timestamp.toDateString()));
}

function CustomerTable(props) {
  const customerRows = props.customers.map(customer => /*#__PURE__*/React.createElement(CustomerRow, {
    key: customer.id,
    customer: customer
  }));
  return /*#__PURE__*/React.createElement("table", {
    className: "bordered-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Serial No."), /*#__PURE__*/React.createElement("th", null, "Name"), /*#__PURE__*/React.createElement("th", null, "Phone number"), /*#__PURE__*/React.createElement("th", null, "Timestamp"))), /*#__PURE__*/React.createElement("tbody", null, customerRows));
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
      name: form.name.value,
      phone: form.phone.value
    };
    this.props.createCustomer(customer);
    form.name.value = "";
    form.phone.value = "";
  }

  render() {
    return /*#__PURE__*/React.createElement("form", {
      name: "customerAdd",
      onSubmit: this.handleSubmit
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      name: "name",
      placeholder: "Name"
    }), "\u2003", /*#__PURE__*/React.createElement("input", {
      type: "text",
      name: "phone",
      placeholder: "Phone Number"
    }), "\u2003", /*#__PURE__*/React.createElement("button", null, "Add"));
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
      name: form.name.value,
      phone: form.phone.value
    };
    this.props.deleteCustomer(customer);
    form.name.value = "";
    form.phone.value = "";
  }

  render() {
    return /*#__PURE__*/React.createElement("form", {
      name: "customerDelete",
      onSubmit: this.handleDelete
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      name: "name",
      placeholder: "Name"
    }), "\u2003", /*#__PURE__*/React.createElement("input", {
      type: "text",
      name: "phone",
      placeholder: "Phone Number"
    }), "\u2003", /*#__PURE__*/React.createElement("button", null, "Delete"));
  }

}

async function graphQLFetch(query, variables = {}) {
  try {
    const response = await fetch('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        variables
      })
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
    this.state = {
      customers: []
    };
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
      this.setState({
        customers: data.customerList
      });
    }
  }

  async createCustomer(customer) {
    const query = `mutation customerAdd($customer: CustomerInputs!) {
      customerAdd(customer: $customer) {
        id
      }
    }`;
    const data = await graphQLFetch(query, {
      customer
    });

    if (data) {
      this.loadData();
    }
  }

  async deleteCustomer(customer) {
    const query = `mutation customerDelete($customer: CustomerInputs!) {
      customerDelete(customer: $customer) {
        id}
    }`;
    const data = await graphQLFetch(query, {
      customer
    });

    if (data) {
      this.loadData();
    }
  }

  render() {
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h1", null, "Hotel California Waitlist System"), /*#__PURE__*/React.createElement(DisplayHomepage, null), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement(CustomerAdd, {
      createCustomer: this.createCustomer
    }), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement(CustomerDelete, {
      deleteCustomer: this.deleteCustomer
    }), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement(CustomerTable, {
      customers: this.state.customers
    }), /*#__PURE__*/React.createElement("br", null));
  }

}

const element = /*#__PURE__*/React.createElement(CustomerList, null);
ReactDOM.render(element, document.getElementById('contents'));