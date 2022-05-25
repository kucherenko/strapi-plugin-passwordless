import * as yup from 'yup';

const schema = yup.object().shape({
  token_length: yup
    .number()
    .min(6)
    .required(),
});

export default schema;