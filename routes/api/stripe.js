const keystone = require('keystone');
const mailgun = require('mailgun-js');
const cbOptions = require('../../options.js');

const DOMAIN = cbOptions.mailgun.domain;
const apiKey = cbOptions.mailgun.apiKey;
const mg = mailgun({ apiKey, domain: DOMAIN });

const User = keystone.list('User');

const mailOptions = {
  from: '"CloseBrace" <contact@closebrace.com>', // sender address
  to: 'billing@closebrace.com', // list of receivers
  subject: 'Stripe Alert: ', // Subject line
  text: '', // plaintext body
};

const sendStripeEmail = (info, text) => {
  const thisEmail = Object.assign({}, mailOptions);
  thisEmail.text = text;
  thisEmail.subject += info;

  // send mail
  mg.messages().send(thisEmail, (error, body) => {
    if (error) { console.log(error); }
  });
};

/**
  Handles Stripe Events (thanks to https://github.com/eddywashere/node-stripe-membership-saas )
 */

const knownEvents = {

  'application_fee.created': (req, res) => {
    sendStripeEmail(req.body.type, 'Application fee was created.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'application_fee.refunded': (req, res) => {
    sendStripeEmail(req.body.type, 'Application fee was refunded.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'account.application.deauthorized': (req, res) => {
    sendStripeEmail(req.body.type, 'An account application was deauthorized.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'account.external_account.created': (req, res) => {
    sendStripeEmail(req.body.type, 'An external account was created.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'account.external_account.deleted': (req, res) => {
    sendStripeEmail(req.body.type, 'An external account was deleted.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'account.external_account.updated': (req, res) => {
    sendStripeEmail(req.body.type, 'An external account was updated');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'account.updated': (req, res) => {
    sendStripeEmail(req.body.type, 'A user account was updated.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'balance.available': (req, res) => {
    sendStripeEmail(req.body.type, 'Balance is available.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'charge.captured': (req, res) => {
    sendStripeEmail(req.body.type, 'A charge was captured.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'charge.dispute.closed': (req, res) => {
    sendStripeEmail(req.body.type, 'A charge dispute was closed.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'charge.dispute.created': (req, res) => {
    sendStripeEmail(req.body.type, 'A charge dispute was created.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'charge.dispute.funds_reinstated': (req, res) => {
    sendStripeEmail(req.body.type, 'Funds were reinstated after a charge dispute.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'charge.dispute.funds_withdrawn': (req, res) => {
    sendStripeEmail(req.body.type, 'Funds were withdrawn after a charge dispute.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'charge.dispute.updated': (req, res) => {
    sendStripeEmail(req.body.type, 'A charge dispute was updated.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'charge.failed': (req, res, next) => {
    try {
      sendStripeEmail(req.body.type, 'A charge failed.');
    }
    catch (error) {
      console.log(`Something went wrong sending an email: ${error} ... proceeding.`);
    }
    console.log(`${req.body.type}: event processed`);

    if (req.body.data && req.body.data.object && req.body.data.object.source.name) {
      // find user by Stripe ID
      User.model.findOne().where('stripeID', req.body.data.object.source.name).exec((err, user) => {
        if (err) return next(err);

        if (!user) {
          // user does not exist, no need to process
          console.log('user not found, no need to email');
          return res.status(200).end();
        }

        // Save the user
        user.stripeAlertCardFail((error) => {
          if (error) return next(error);

          console.log(`user: ${user.email} was emailed about failing card`);
          return res.status(200).end();
        });

        return res.status(200).end();
      });
    }
    else {
      return next(new Error('body.data.object.source.name is undefined'));
    }

    return res.status(200).end();
  },
  'charge.pending': (req, res) => {
    sendStripeEmail(req.body.type, 'A charge is pending.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'charge.refunded': (req, res) => {
    sendStripeEmail(req.body.type, 'A charge was refunded.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'charge.refund.updated': (req, res) => {
    sendStripeEmail(req.body.type, 'A charge refund was updated.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'charge.succeeded': (req, res) => {
    sendStripeEmail(req.body.type, 'A charge succeeded.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'charge.updated': (req, res) => {
    sendStripeEmail(req.body.type, 'A charge was updated.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'coupon.created': (req, res) => {
    sendStripeEmail(req.body.type, 'A coupon was created.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'coupon.deleted': (req, res) => {
    sendStripeEmail(req.body.type, 'A coupon was deleted.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'coupon.updated,': (req, res) => {
    sendStripeEmail(req.body.type, 'A coupon was updated.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'customer.bank_account.deleted': (req, res) => {
    sendStripeEmail(req.body.type, 'A customer bank account was deleted.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'customer.created': (req, res) => {
    sendStripeEmail(req.body.type, 'A customer was created.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'customer.card.created': (req, res) => {
    sendStripeEmail(req.body.type, 'A customer card was created.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'customer.card.deleted': (req, res) => {
    sendStripeEmail(req.body.type, 'A customer card was deleted.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'customer.card.updated': (req, res) => {
    sendStripeEmail(req.body.type, 'A customer card was updated.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'customer.deleted': (req, res) => {
    sendStripeEmail(req.body.type, 'A customer was deleted.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'customer.discount.created': (req, res) => {
    sendStripeEmail(req.body.type, 'A customer discount was created.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'customer.discount.deleted': (req, res) => {
    sendStripeEmail(req.body.type, 'A customer discount was deleted.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'customer.discount.updated': (req, res) => {
    sendStripeEmail(req.body.type, 'A customer discount was updated.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'customer.source.created': (req, res) => {
    sendStripeEmail(req.body.type, 'A customer source was created.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'customer.source.deleted': (req, res) => {
    sendStripeEmail(req.body.type, 'A customer source was deleted');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'customer.source.expiring': (req, res) => {
    sendStripeEmail(req.body.type, 'A customer source is expiring.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'customer.source.updated': (req, res) => {
    sendStripeEmail(req.body.type, 'A customer source was updated.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'customer.subscription.created': (req, res) => {
    sendStripeEmail(req.body.type, 'A customer subscription was created.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'customer.subscription.deleted': (req, res, next) => {
    try {
      sendStripeEmail(req.body.type, 'A customer subscription was deleted.');
    }
    catch (error) {
      console.log(`Something went wrong sending an email: ${error} ... proceeding.`);
    }
    console.log(`${req.body.type}: event processed`);

    if (req.body.data && req.body.data.object && req.body.data.object.customer) {
      // find user by Stripe ID
      User.model.findOne().where('stripeID', req.body.data.object.customer).exec((err, user) => {
        if (err) return next(err);
        if (!user) {
          // user does not exist, no need to process
          console.log('user not found, no subscription deleted');
          return res.status(200).end();
        }
        // Save the user
        user.cancelStripeSubscription('cancel-final', (error) => {
          if (error) return next(error);

          console.log(`user: ${user.email} subscription was successfully canceled.`);
          return res.status(200).end();
        });

        return res.status(200).end();
      });
    }
    else {
      return next(new Error('body.data.object.customer is undefined'));
    }

    return res.status(200).end();
  },
  'customer.subscription.updated': (req, res) => {
    sendStripeEmail(req.body.type, 'A customer subscription was updated.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'customer.subscription.trial_will_end': (req, res) => {
    sendStripeEmail(req.body.type, 'A customer\'s subscription trial is about to end.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'customer.updated': (req, res) => {
    sendStripeEmail(req.body.type, 'A customer was updated.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'file.created': (req, res) => {
    sendStripeEmail(req.body.type, 'A file was created.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'invoice.created': (req, res) => {
    sendStripeEmail(req.body.type, 'An invoice was created.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'invoice.payment_failed': (req, res) => {
    sendStripeEmail(req.body.type, 'An invoice payment failed.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'invoice.payment_succeeded': (req, res) => {
    sendStripeEmail(req.body.type, 'An invoice payment succeeded.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'invoice.sent': (req, res) => {
    sendStripeEmail(req.body.type, 'An invoice was sent.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'invoice.upcoming': (req, res) => {
    sendStripeEmail(req.body.type, 'An invoice is upcoming.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'invoice.updated': (req, res) => {
    sendStripeEmail(req.body.type, 'An invoice was updated.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'invoiceitem.created': (req, res) => {
    sendStripeEmail(req.body.type, 'An invoice item was created.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'invoiceitem.deleted': (req, res) => {
    sendStripeEmail(req.body.type, 'An invoice item was deleted.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'invoiceitem.updated': (req, res) => {
    sendStripeEmail(req.body.type, 'An invoice item was updated.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'order.created': (req, res) => {
    sendStripeEmail(req.body.type, 'An order was created.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'order.payment_failed': (req, res) => {
    sendStripeEmail(req.body.type, 'An order payment failed.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'order.payment_succeeded': (req, res) => {
    sendStripeEmail(req.body.type, 'An order payment succeeded.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'order.updated': (req, res) => {
    sendStripeEmail(req.body.type, 'An order was updated.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'order_return.created': (req, res) => {
    sendStripeEmail(req.body.type, 'An order return was created.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'payment_intent.payment_failed': (req, res) => {
    sendStripeEmail(req.body.type, 'A payment intent failed.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'payout.canceled': (req, res) => {
    sendStripeEmail(req.body.type, 'A payout was canceled.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'payout.created': (req, res) => {
    sendStripeEmail(req.body.type, 'A payout was created.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'payout.failed': (req, res) => {
    sendStripeEmail(req.body.type, 'A payout failed.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'payout.paid': (req, res) => {
    sendStripeEmail(req.body.type, 'A payout was paid.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'payout.updated': (req, res) => {
    sendStripeEmail(req.body.type, 'A payout was updated.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'plan.created': (req, res) => {
    sendStripeEmail(req.body.type, 'A new plan was created.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'plan.deleted': (req, res) => {
    sendStripeEmail(req.body.type, 'A plan was deleted.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'plan.updated': (req, res) => {
    sendStripeEmail(req.body.type, 'An existing plan was updated.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'product.created': (req, res) => {
    sendStripeEmail(req.body.type, 'A product was created.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'product.deleted': (req, res) => {
    sendStripeEmail(req.body.type, 'A product was deleted.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'product.updated': (req, res) => {
    sendStripeEmail(req.body.type, 'A Product was updated.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'recipient.created': (req, res) => {
    sendStripeEmail(req.body.type, 'A recipient was created.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'recipient.deleted': (req, res) => {
    sendStripeEmail(req.body.type, 'A recipient was deleted.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'recipient.updated': (req, res) => {
    sendStripeEmail(req.body.type, 'A recipient was updated.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'review.closed': (req, res) => {
    sendStripeEmail(req.body.type, 'A review was closed.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'review.opened': (req, res) => {
    sendStripeEmail(req.body.type, 'A review was opened.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'sigma.scheduled_query_run.created': (req, res) => {
    sendStripeEmail(req.body.type, 'A sigma scheduled query run was created.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'sku.created': (req, res) => {
    sendStripeEmail(req.body.type, 'A SKU was created.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'sku.deleted': (req, res) => {
    sendStripeEmail(req.body.type, 'A SKU was deleted.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'sku.updated': (req, res) => {
    sendStripeEmail(req.body.type, 'A SKU was updated.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'source.canceled': (req, res) => {
    sendStripeEmail(req.body.type, 'A source was canceled.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'source.chargeable': (req, res) => {
    sendStripeEmail(req.body.type, 'A source was chargeable.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'source.failed': (req, res) => {
    sendStripeEmail(req.body.type, 'A source failed.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'source.mandate_notification': (req, res) => {
    sendStripeEmail(req.body.type, 'A source received a mandate notification');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'source.transaction.created': (req, res) => {
    sendStripeEmail(req.body.type, 'A source transaction was created.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'topup.created': (req, res) => {
    sendStripeEmail(req.body.type, 'A top-up was created.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'topup.failed': (req, res) => {
    sendStripeEmail(req.body.type, 'A top-up failed.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'topup.succeeded': (req, res) => {
    sendStripeEmail(req.body.type, 'A top-up succeeded');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'transfer.created': (req, res) => {
    sendStripeEmail(req.body.type, 'A transfer was created.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'transfer.failed': (req, res) => {
    sendStripeEmail(req.body.type, 'A transfer failed.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'transfer.paid': (req, res) => {
    sendStripeEmail(req.body.type, 'A transfer was paid.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'transfer.reversed': (req, res) => {
    sendStripeEmail(req.body.type, 'A transfer was reversed.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  'transfer.updated': (req, res) => {
    sendStripeEmail(req.body.type, 'A transfer was updated.');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
  ping: (req, res) => {
    sendStripeEmail(req.body.type, 'Ping!');
    console.log(`${req.body.type}: event processed`);
    res.status(200).end();
  },
};

exports.stripeEvents = (req, res, next) => {
  if (req.body.type && knownEvents[req.body.type]) {
    return knownEvents[req.body.type](req, res, next);
  }
  return next(new Error('Stripe Event not found'));
};
