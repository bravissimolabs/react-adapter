'use strict';

const Adapter    = require('@frctl/fractal').Adapter;
const React      = require('react');
const ReactDOM   = require('react-dom/server');

const defaultBabelConfig = {
    extensions: ['.jsx'],
    presets: ['react', 'es2015'],
    plugins: ['add-module-exports']
};

class ReactAdapter extends Adapter {

    constructor(source, app, config) {
        super(null, source);
        this._app = app;
        this._config = config;
    }

    render(path, str, context) {
        delete require.cache[path];
        const config    = this._config;
        const component = require(path);
        const element   = React.createElement(component, context);
        const root      = (config.wrapper && config.wrapper.component)
            ? React.createElement(
                config.wrapper.component,
                config.wrapper.props || {},
                element)
            : element;
        const html = ReactDOM.renderToStaticMarkup(root);
        return Promise.resolve(html);
    }

    renderLayout(path, str, context) {
        const Layout = require(path);
        const layout = React.createElement(Layout, context);
        const html = ReactDOM.renderToStaticMarkup(layout);
        return Promise.resolve(html);
    }

}

module.exports = function(config) {

    config = config || {};

    require('babel-register')(config.babel || defaultBabelConfig);

    return {
        register(source, app) {
            return new ReactAdapter(source, app, config);
        }
    }

};
