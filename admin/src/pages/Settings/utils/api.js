import {
  request,
} from '@strapi/helper-plugin';

import {getRequestURL} from '../../../utils';

const fetchData = async () => {
  const {settings} = await request(getRequestURL('settings'), {method: 'GET'});
  return settings;
};

const saveSettings = body => {
  return request(getRequestURL('settings'), {method: 'PUT', body});
};

export {fetchData, saveSettings};