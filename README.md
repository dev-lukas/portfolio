# lukas-roth.dev

[![Build & Push](https://github.com/dev-lukas/portfolio/actions/workflows/build.yml/badge.svg)](https://github.com/dev-lukas/portfolio/actions/workflows/build.yml)

Personal portfolio website. Built with Astro, Vue 3, Tailwind CSS, and GSAP.

## Stack

- **Framework:** Astro 6 (static output)
- **Components:** Vue 3 islands
- **Styling:** Tailwind CSS v4
- **Animations:** GSAP + ScrollTrigger
- **Deployment:** Docker (nginx-alpine)

## Development

```sh
npm install
npm run dev
```

## Build

```sh
npm run build    # outputs to ./dist/
```

### Docker

```sh
docker build -t portfolio .
docker run -p 8090:80 portfolio
```

## License

All rights reserved.
