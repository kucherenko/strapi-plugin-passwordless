import pluginPkg from '../../package.json';
import pluginId from './utils/pluginId';
import {prefixPluginTranslations} from '@strapi/helper-plugin';
import pluginPermissions from './permissions';
import getTrad from "./utils/getTrad";

const pluginDescription = pluginPkg.strapi.description || pluginPkg.description;
const name = pluginPkg.strapi.name;

export default {
  register(app) {
    const plugin = {
      description: pluginDescription,
      id: pluginId,
      enabled: true,
      name,
    };

    app.createSettingSection(
      {
        id: pluginId,
        intlLabel: {
          id: getTrad('Header.Settings'),
          defaultMessage: 'Passwordless Login',
        },
      },
      [
        {
          intlLabel: {
            id: getTrad('Form.title.Settings'),
            defaultMessage: 'Settings',
          },
          id: 'passwordless-settings',
          to: `/settings/${pluginId}`,
          Component: async () => {
            return await import(
              /* webpackChunkName: "password-settings-page" */ './pages/Settings'
              );
          },
          permissions: pluginPermissions.readSettings,
        },
      ]
    );
    app.registerPlugin(plugin);
  },
  bootstrap(app) {
  },
  async registerTrads({locales}) {
    const importedTrads = await Promise.all(
      locales.map((locale) => {
        return import(
          /* webpackChunkName: "passwordless-[request]" */ `./translations/${locale}.json`
          )
          .then(({default: data}) => {
            return {
              data: prefixPluginTranslations(data, pluginId),
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      }),
    );
    return Promise.resolve(importedTrads);
  }
};
