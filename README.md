# KBC Weather Report: you choose the weather

> Your bank tells you what already happened. KBC Weather Report tells you what's coming.

Built during the Tectonic hackathon for the **KBC challenge**, which asked how a bank could understand, support and guide 2.3 million customers in a personal way.

## The idea

KBC Mobile opens with a **financial weather forecast** for the next 14 days. The forecast is built from each customer's fixed costs, habits, income and life moments. Everyone understands a weather report in two seconds, from students to retirees.

| Weather | Meaning |
|---|---|
| Sun | Plenty of buffer, no big expenses |
| Cloudy | Tight but safe. Kate stays quiet |
| Rain | A planned, large expense |
| Thunder | A spike in impulse spending. No blame |
| Storm | Several costs at once: an overdraft is coming |
| Fog | Uncertain income: Kate works with a range |
| Clearing up | After the rain comes the sunshine: back on track |
| Season | A life moment changes the whole forecast |
| Climate | The long term: retirement, home, future you |

The concept rests on five principles:

1. **You choose the weather.** Customers toggle scenarios, and the forecast updates live.
2. **After the rain comes the sunshine.** After a costly night out, Kate rearranges the week. She doesn't blame.
3. **Kate chooses you.** Kate's advice ignores KBC's margin, even when that costs KBC money.
4. **Ask, don't assume.** Kate asks before she acts on a sensitive life moment. Every insight has a "Why am I seeing this?" link, and customers can correct the model.
5. **Silence is an action too.** Most customers get no message on most days. In care mode, all marketing stops.

## What's in the prototype

The prototype has four personas across 13 phone screens, plus a live engine view.

| # | Persona | Scene | Shows |
|---|---|---|---|
| 1 | Lotte, 23 | Home | The forecast inside the existing "For you" section of KBC Mobile |
| 2 | Lotte | You choose the weather | 14-day forecast, live scenarios, balance projection, savings goal |
| 3 | Lotte | Saturday morning | Push notification |
| 4 | Lotte | After the rain, sunshine | Kate chat that rearranges her week |
| 5 | Lotte | Climate: future you | Long-term projection with life seasons, spoken by her 65-year-old self |
| 6 | Lotte | 2030: your assistant | Permission-scoped KBC Weather API for the customer's own AI agent |
| 7 | Peeters family | Change of season | Kate spots "child leaves home" and asks first |
| 8 | Peeters family | Child leaves home | A household forecast with a shared student budget |
| 9 | Peeters family | Kate chooses you | €412 a year of KBC products the family doesn't need |
| 10 | Yasmina, 34 | Fog | Uncertain freelance income shown as a range |
| 11 | Yasmina | Code orange | Early help from a human contact |
| 12 | Jos, 74 | Shelter | Care mode after a bereavement |
| 13 | Jos | Code red | Scam payment held, with the Guardian Angel and Kate's voice |
| 14 | — | The engine | Live simulation on synthetic customers |

## How to run

There's no build, no install and no backend.

1. Open `kbc-weather-report.html` in Chrome. A Dutch version is in `kbc-weerbericht.html`.
2. Use **→** or **space** for the next scene, **←** for the previous one, and **R** to reset. You can also click anything inside the phone.
3. On scene 14, choose a customer count and click **Run simulation**.

For the best result, run it full screen on a laptop.

## How the engine works

```
Signals → Moment detection → Forecast → Playbooks → Kate (LLM) → Channels
```

- **Detection and forecasting** are cheap arithmetic and rules that run for every customer every night.
- **Playbooks** decide per moment what to do, when, on which channel, and when to stay silent.
- **The language model** only writes a message for customers who actually receive one that day.

The engine view runs this pipeline in the browser on synthetic customers generated from a fixed seed. In our test run on a laptop, 100,000 customers took under 0.1 s, which extrapolates to about 1 s for 2.3 million. 92% of customers got no message that day.

## Security and privacy

- **Data:** there is no real customer data. Every person, amount and customer is synthetic.
- **Architecture:** there is no backend, no login, no API keys and no stored secrets. The page's only external request is a Google Fonts stylesheet.
- **Consent:** the 2030 assistant API is designed around consent. Each request uses a token with only the permissions the customer granted, and anything else returns `403`.
- **Correctable insights:** sensitive life moments are only acted on after the customer confirms them, and every insight can be corrected or muted.

## What's simulated or unfinished

- **Kate's messages** are templates. In production they would be written by an LLM. We planned Gemini, which is not wired in yet.
- **Voice** uses the browser's built-in speech. To use ElevenLabs recordings instead, place `future-you.mp3` and `kate-code-red.mp3` next to the HTML file; they play automatically when present.
- **The Weather API and the engine** run entirely in the browser. The detection rules are simplified for the demo.
- **Mobile layout:** the prototype is optimised for a laptop screen and works on mobile in a basic way.

## Tech

It's a single self-contained HTML file written in plain HTML, CSS and JavaScript, with no dependencies. The look follows KBC Mobile's dark mode.

## Disclaimer

This is a concept prototype for a hackathon and not an official KBC product. KBC, KBC Mobile and Kate are trademarks of KBC Group. No KBC logos are used.
