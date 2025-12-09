# Asyntai AI Chatbot For DatoCMS

Create and launch AI assistant/chatbot for your DatoCMS website in minutes. It talks to your visitors, helps, explains, never misses a chat and can increase conversion rates! All while knowing your DatoCMS website, customized just for you. Your DatoCMS website can now talk.

This plugin embeds the Asyntai chatbot on your site and provides a simple admin interface to connect your site to Asyntai.

## Why choose Asyntai?

- **Increase conversions**: Instant, human like replies keep shoppers engaged and buying.

- **Never miss a chat**: The AI replies day and night, even when your team is offline.

- **Knows your website**: Customized just for you; it follows your instructions.

- **Works in all languages**: Automatically detects and answers in the visitor's language.

- **Fast responses (1-3s)**: Keeps customers from bouncing.


## Installation

1. Go to your DatoCMS project dashboard
2. Navigate to **Settings** (gear icon) > **Plugins**
3. Click **"Add a new private plugin"**
4. Enter:
   - **Plugin name**: `Asyntai AI Chatbot`
   - **Entry point URL**: `https://unpkg.com/datocms-plugin-asyntai-chatbot/dist/index.html`
5. Click **"Save settings"**

Note: Alternatively, if you don't want to use a plugin, you can also get a JavaScript snippet at [asyntai.com/dashboard](https://asyntai.com/dashboard) and manually insert it into your web pages.

## Configuration

After installation:

1. Go to **Settings** > **Integrations** > **Asyntai AI Chatbot**
2. Click **"Get started"** to connect your Asyntai account
3. Sign in or create a free account
4. The plugin will automatically save your connection
5. Copy the JavaScript snippet and add it to your frontend (see below)
6. Set up your chatbot, review chat logs and more at: [asyntai.com/dashboard](https://asyntai.com/dashboard)

Don't have an account yet? Create a free Asyntai account at [asyntai.com/auth](https://asyntai.com/auth)

## Adding the Chatbot to Your Frontend

Since DatoCMS is a headless CMS, you need to add the JavaScript snippet to your frontend application:

### Next.js (App Router)
Add to your `app/layout.tsx`:
```tsx
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Script
          src="https://asyntai.com/static/js/chat-widget.js"
          data-asyntai-id="YOUR_SITE_ID"
          async
        />
      </body>
    </html>
  )
}
```

### Next.js (Pages Router)
Add to your `pages/_app.tsx`:
```tsx
import Script from 'next/script'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Script
        src="https://asyntai.com/static/js/chat-widget.js"
        data-asyntai-id="YOUR_SITE_ID"
        async
      />
    </>
  )
}
```

### Gatsby
Add to your `gatsby-browser.js`:
```js
export const onClientEntry = () => {
  const script = document.createElement('script')
  script.src = 'https://asyntai.com/static/js/chat-widget.js'
  script.setAttribute('data-asyntai-id', 'YOUR_SITE_ID')
  script.async = true
  document.body.appendChild(script)
}
```

### Nuxt.js
Add to your `nuxt.config.js`:
```js
export default {
  head: {
    script: [
      {
        src: 'https://asyntai.com/static/js/chat-widget.js',
        'data-asyntai-id': 'YOUR_SITE_ID',
        async: true
      }
    ]
  }
}
```

### Plain HTML
Add before the closing `</body>` tag:
```html
<script src="https://asyntai.com/static/js/chat-widget.js" data-asyntai-id="YOUR_SITE_ID" async></script>
```

## Managing Your Chatbot

Once connected, you can manage your chatbot settings, review chat logs, and customize AI responses at:
[asyntai.com/dashboard](https://asyntai.com/dashboard)


## Requirements

- DatoCMS account (any plan)
- Modern browser (Chrome, Firefox, Edge)
- A frontend application to display the chatbot


## Have a question?
Email us at hello@asyntai.com or try our chatbot directly at [asyntai.com/](https://asyntai.com/)



![Asyntai AI chatbot 1](https://asyntai.com/static/images/ai-chatbot-for-websites-1.png)

![Asyntai AI chatbot 2](https://asyntai.com/static/images/ai-chatbot-for-websites-2.png)

![Asyntai AI chatbot 3](https://asyntai.com/static/images/ai-chatbot-for-websites-3.png)

![Asyntai AI chatbot 4](https://asyntai.com/static/images/ai-chatbot-for-websites-4.png)

![Asyntai AI chatbot 5](https://asyntai.com/static/images/ai-chatbot-for-websites-5.png)
