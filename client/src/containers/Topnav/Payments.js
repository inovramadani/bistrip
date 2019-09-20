import React, { Component } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import { connect } from 'react-redux';
import * as actions from '../../actions';
import './Payments.css'

class Payments extends Component {
  render() {
    return (
      <StripeCheckout
        name="Flowngin"
        description="$5 for 5 flow credits"
        amount={500}
        token={token => this.props.handleToken(token)}
        stripeKey={process.env.REACT_APP_STRIPE_KEY}
      >
      <span className="btn btn-add-credits">Add credits</span>
      </StripeCheckout>
    );
  }
}

export default connect(null, actions) (Payments);
