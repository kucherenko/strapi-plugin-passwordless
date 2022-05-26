import React, {useMemo} from 'react';
import {useMutation, useQuery, useQueryClient} from 'react-query';
import {useIntl} from 'react-intl';
import {Formik} from 'formik';
import {
  CheckPagePermissions,
  Form,
  GenericInput,
  LoadingIndicatorPage,
  SettingsPageTitle,
  useFocusWhenNavigate,
  useNotification,
  useOverlayBlocker,
  useRBAC,
} from '@strapi/helper-plugin';
import {useNotifyAT} from '@strapi/design-system/LiveRegions';
import {Main} from '@strapi/design-system/Main';
import {ContentLayout, HeaderLayout} from '@strapi/design-system/Layout';
import {Button} from '@strapi/design-system/Button';
import {Box} from '@strapi/design-system/Box';
import {Stack} from '@strapi/design-system/Stack';
import {Typography} from '@strapi/design-system/Typography';
import {Grid, GridItem} from '@strapi/design-system/Grid';
import Check from '@strapi/icons/Check';
import pluginPermissions from '../../permissions';
import {getTrad} from '../../utils';
import layout from './utils/layout';
import schema from './utils/schema';
import {fetchData, saveSettings} from './utils/api';

const ProtectedSettingsPage = () => (
  <CheckPagePermissions permissions={pluginPermissions.readSettings}>
    <SettingsPage />
  </CheckPagePermissions>
);

const SettingsPage = () => {
  const { formatMessage } = useIntl();
  const toggleNotification = useNotification();
  const { lockApp, unlockApp } = useOverlayBlocker();
  const { notifyStatus } = useNotifyAT();
  const queryClient = useQueryClient();
  useFocusWhenNavigate();

  const updatePermissions = useMemo(
    () => ({ update: pluginPermissions.updateSettings }),
    []
  );
  const {
    isLoading: isLoadingForPermissions,
    allowedActions: { canUpdate },
  } = useRBAC(updatePermissions);

  const { status: isLoadingData, data } = useQuery('advanced', () => fetchData(), {
    onSuccess: () => {
      notifyStatus(
        formatMessage({
          id: getTrad('Form.advancedSettings.data.loaded'),
          defaultMessage: 'The settings data has been loaded',
        })
      );
    },
    onError: () => {
      toggleNotification({
        type: 'warning',
        message: { id: getTrad('notification.error'), defaultMessage: 'An error occurred' },
      });
    },
  });

  const isLoading = isLoadingForPermissions || isLoadingData !== 'success';

  const submitMutation = useMutation(body => saveSettings(body), {
    onSuccess: async () => {
      await queryClient.invalidateQueries('settings');
      toggleNotification({
        type: 'success',
        message: { id: getTrad('notification.success.saved'), defaultMessage: 'Saved' },
      });

      unlockApp();
    },
    onError: () => {
      toggleNotification({
        type: 'warning',
        message: { id: getTrad('notification.error'), defaultMessage: 'An error occured' },
      });
      unlockApp();
    },
    refetchActive: true,
  });

  const { isLoading: isSubmittingForm } = submitMutation;

  const handleSubmit = async body => {
    lockApp();
    await submitMutation.mutateAsync(body);
  };

  if (isLoading) {
    return (
      <Main aria-busy="true">
        <SettingsPageTitle
          name={formatMessage({
            id: getTrad('Header.Settings'),
            defaultMessage: 'Passwordless Plugin',
          })}
        />
        <HeaderLayout
          title={formatMessage({
            id: getTrad('Header.Settings'),
            defaultMessage: 'Passwordless Plugin',
          })}
        />
        <ContentLayout>
          <LoadingIndicatorPage />
        </ContentLayout>
      </Main>
    );
  }
  return (
    <Main aria-busy={isSubmittingForm}>
      <SettingsPageTitle
        name={formatMessage({
          id: getTrad('Form.title.Settings'),
          defaultMessage: 'Configuration',
        })}
      />
      <HeaderLayout
        id="title"
        title={formatMessage({
          id: getTrad('Form.title.Settings'),
          defaultMessage: 'Configuration',
        })}
        subtitle={formatMessage({
          id: getTrad('Settings.enabled.description'),
          defaultMessage: 'Enables a secure and seamless emailed link authentication.',
        })}
      />
      <Formik
        onSubmit={handleSubmit}
        initialValues={data}
        validateOnChange={false}
        validationSchema={schema}
        enableReinitialize
      >
        {({ errors, values, handleChange, isSubmitting }) => {
          return (
            <Form>
              <HeaderLayout
                title={formatMessage({
                  id: getTrad('Form.title.Settings'),
                  defaultMessage: 'Passwordless Settings',
                })}
                primaryAction={
                  <Button
                    loading={isSubmitting}
                    type="submit"
                    disabled={!canUpdate}
                    startIcon={<Check />}
                    size="L"
                  >
                    {formatMessage({ id: getTrad('Form.save'), defaultMessage: 'Save' })}
                  </Button>
                }
              />
              <ContentLayout>
                <Box
                  background="neutral0"
                  hasRadius
                  shadow="filterShadow"
                  paddingTop={6}
                  paddingBottom={6}
                  paddingLeft={7}
                  paddingRight={7}
                >
                  <Stack size={4}>
                    <Typography variant="delta" as="h2">
                      {formatMessage({
                        id: getTrad('Form.title.advancedSettings'),
                        defaultMessage: 'Settings',
                      })}
                    </Typography>
                    <Grid gap={6}>
                      {layout.map(input => {
                        let value = values[input.name];

                        if (!value) {
                          value = input.type === 'bool' ? false : '';
                        }

                        return (
                          <GridItem key={input.name} {...input.size}>
                            <GenericInput
                              {...input}
                              value={value}
                              error={errors[input.name]}
                              disabled={
                                input.name === 'email_confirmation_redirection' &&
                                values.email_confirmation === false
                              }
                              onChange={handleChange}
                            />
                          </GridItem>
                        );
                      })}
                    </Grid>
                  </Stack>
                </Box>
              </ContentLayout>
            </Form>
          );
        }}
      </Formik>
    </Main>
  );
};

export default ProtectedSettingsPage;