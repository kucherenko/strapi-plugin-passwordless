> # 🇺🇦 UKRAINE NEEDS YOUR HELP NOW!
>
> I'm the creator of this project and I'm Ukrainian.
>
> **My country, Ukraine, [is being invaded by the Russian Federation, right now](https://www.bbc.com/news/world-europe-60504334)**. I've fled Kyiv and now I'm safe with my family in the western part of Ukraine. At least for now.
> Russia is hitting target all over my country by ballistic missiles.
>
> **Please, save me and help to save my country!**
>
> Ukrainian National Bank opened [an account to Raise Funds for Ukraine’s Armed Forces](https://bank.gov.ua/en/news/all/natsionalniy-bank-vidkriv-spetsrahunok-dlya-zboru-koshtiv-na-potrebi-armiyi):
>
> ```
> SWIFT Code NBU: NBUA UA UX
> JP MORGAN CHASE BANK, New York
> SWIFT Code: CHASUS33
> Account: 400807238
> 383 Madison Avenue, New York, NY 10179, USA
> IBAN: UA843000010000000047330992708
> ```
>
> You can also donate to [charity supporting Ukrainian army](https://savelife.in.ua/en/donate/).
>
> **THANK YOU!**

<p>
  <img width="80" src="https://github.com/kucherenko/strapi-plugin-passwordless/blob/main/logo.png?raw=true">
</p>

# Strapi PasswordLess Plugin
A plugin for [Strapi Headless CMS](https://github.com/strapi/strapi) that provides ability to sign-in/sign-up to an application by link had sent to email. 
A plugin works together with [Strapi User Permissions Plugin](https://github.com/strapi/strapi/tree/master/packages/plugins/users-permissions) and extends it functionality. 
For working with emails a plugin use [Strapi Email Plugin](https://docs.strapi.io/developer-docs/latest/plugins/email.html).

![Screenshot](https://github.com/kucherenko/strapi-plugin-passwordless/raw/main/screenshot-v4.png?raw=true)

## ⏳ Installation

Install Strapi with this **Quickstart** command to create a Strapi project instantly:

- (Use **yarn** to install the Strapi project (recommended). [Install yarn with these docs](https://yarnpkg.com/lang/en/docs/install/).)

```bash
# with yarn
yarn create strapi-app my-project --quickstart

# with npm/npx
npx create-strapi-app my-project --quickstart
```


- Configure the `Strapi email` plugin ( [official documentation](https://docs.strapi.io/developer-docs/latest/plugins/email.html) )

- Add the `strapi-plugin-passwordless` plugin

```bash
yarn add strapi-plugin-passwordless@latest

# or

npm i -S strapi-plugin-passwordless@latest
```

- After successful installation you've to build a fresh package that includes plugin UI. To archive that simply use:

```bash
yarn build && yarn develop

# or

npm run build && npm run develop
```

- or just run Strapi in the development mode with `--watch-admin` option:

```bash
yarn develop --watch-admin

#or

npm run develop --watch-admin
```

The **Passwordless** plugin should appear in the **Plugins** section of Strapi sidebar after you run app again.

## 🔌 Usage

### REST API
#### Email user with login link
```
POST /api/passwordless/send-link
{
  "email": "user@email.com"
  "username": "John Bull" // username for new user
  "context": { 
    // context of authentification, optional parameter e.g. "currentUrl": "...my page..."
    ...
  }  
}
```

Send mail to user by username
```
POST /api/passwordless/send-link 
{
  "username": "John Bull"
}
```

#### Login with token
```
GET /api/passwordless/login?loginToken={tokenFromEmail}
```
Response:
```
{
  "jwt":  "...jwt auth token..."
  "user": {
    ...strapi user...
  },
  "context": {
    ... context, provided to sendlink, e.g. currentPage, sessionId etc.
  }
}
```

### GraphQL API

WIP

## 🙌 Versions 

- `strapi-plugin-passwordless@4.x` - version for strapi v4
- `strapi-plugin-passwordless@3.x` - version for strapi v3 ([dev branch](https://github.com/kucherenko/strapi-plugin-passwordless/tree/v3)) 


## 🤝 Contributing

Feel free to fork and make a Pull Request to this plugin project. All the input is warmly welcome!

## ⭐️ Show your support

Give a star if this project helped you.

## License

[MIT License](LICENSE) Copyright (c) [Andrey Kucherenko](https://github.com/kucherenko).
