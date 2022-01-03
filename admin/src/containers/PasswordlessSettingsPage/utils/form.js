import {getTrad} from '../../../utils';
import React from "react";

const form = [
  {
    description: getTrad('Settings.enabled.description'),
    label: getTrad('Settings.enabled.label'),
    name: 'enabled',
    type: 'bool',
    size: {xs: 6},
  },
  {
    description: getTrad('Settings.createUser.description'),
    label: getTrad('Settings.createUser.label'),
    name: 'createUserIfNotExists',
    type: 'bool',
    size: {xs: 6},
  },
  {
    description: getTrad('Settings.expire_period.description'),
    label: getTrad('Settings.expire_period.label'),
    name: 'expire_period',
    type: 'number',
    size: {xs: 12},
  },
  {
    autoFocus: true,
    label: getTrad('Email.options.from.name.label'),
    name: 'from_name',
    type: 'text',
    placeholder: getTrad('Email.options.from.name.placeholder'),
    size: {xs: 6},
    validations: {
      required: true,
    },
  },
  {
    autoFocus: false,
    label: getTrad('Email.options.from.email.label'),
    name: 'from_email',
    type: 'email',
    placeholder: getTrad('Email.options.from.email.placeholder'),
    size: {xs: 6},
    validations: {
      required: true,
    },
  },
  {
    autoFocus: false,
    label: getTrad('Email.options.response_email.label'),
    name: 'response_email',
    type: 'email',
    placeholder: getTrad('Email.options.response_email.placeholder'),
    size: {xs: 6},
    validations: {
      required: true,
    },
  },
  {
    autoFocus: true,
    label: getTrad('Email.options.object.label'),
    name: 'object',
    type: 'text',
    placeholder: getTrad('Email.options.object.placeholder'),
    size: {xs: 6},
    validations: {
      required: true,
    },
  },
  {
    autoFocus: false,
    label: getTrad('Email.options.message_text.label'),
    name: 'message_text',
    type: 'textarea',
    style: {height: '15.6rem'},
    size: {xs: 12},
    validations: {
      required: true,
    },
  },
  {
    autoFocus: false,
    label: getTrad('Email.options.message_html.label'),
    name: 'message_html',
    type: 'textarea',
    style: {height: '15.6rem'},
    size: {xs: 12},
    validations: {
      required: true,
    },
  },
];

export default form;
