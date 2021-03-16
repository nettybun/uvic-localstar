# Localstar Preact

This is the single page application that provides the UI for Localstar and the Starboard Notebook. This web application is made using [Preact](https://preactjs.com/), a lightweight alternative to React. This application is hosted by Localstar Deno.

## Links

- [Technologies](#technologies)
- [Install](#install)
- [Development](#development)
- [Build](#build)

## Screenshot
![Screenshot of Localstar](https://imgur.com/p0MbIbR.png "Screenshot of Localstar")

## Technologies

All the technologies in this application are based on two principles. Performance, and bundle size. In order to entertain a pleasant user experience, the application needs to be performant. To make the projects concept viable, it needs to remain as small as possible when built.

### [Preact](https://preactjs.com/)

Although React is a much larger and widely used library, React can be quite bloated, increasing bundle size more than is prefereable. Preact is a lightweight alternative to React that uses the same API as a React application. That allows it to be compatible with all the same tools, plugins, and components a React application would, while mainting a much smaller size. 

### [Redux](https://redux.js.org/)

Redux is the defacto state managment tool for web applications. It simplifies application state to a single store, accessible application wide, which helps reduce complexity of larger applications. We also chose it as it is quite a small library.

### [TailwindCSS](https://tailwindcss.com/)

TailwindCSS gives us a great range of CSS utilities/classes while also boasting tooling to purge all unused CSS at buildtime. This simplifies the development process, and reduces the clutter that can be caused using custom CSS.

### [iframe-resizer-react](https://github.com/davidjbradshaw/iframe-resizer-react) 

In order to run the Starboard editor provided by the Starboad-Notebook project, an Iframe is required. This library provides a simple wrapper around an Iframe that allows it to be used in React compatible applications such as this one.


This project uses [NPM](https://www.npmjs.com/) for its dependency maangement. This needs to be installed before running any of the following commands.
## Install
To install dependencies:
```bash
npm install
 ```

## Development
To run the development server:
```bash
npm run dev
```

## Build
To create build files:
```bash
npm run build
```

To server build files:
```bash
npm run serve
```

## Usage

This application is currently not meant to be used on its own and is intended to be packaged with the Localstar Deno server. If you are building Localstar and trying to produce a binary, simply run the [Install](#install) and [Build](#build) commands in this directory to ready the frontend to be compiled into the executable.
