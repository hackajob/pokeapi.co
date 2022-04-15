import hashSum from 'hash-sum';
import marked from 'marked';
import path from 'path';
import slugify from 'slugify';

const BASE_URL = 'https://challenges.hackajob.co/pokeapi/api';

export default {
    basePath: 'pokeapi',

    dist: 'dist/pokeapi',

    plugins: [
        'react-static-plugin-react-router',
        ['react-static-plugin-google-tag-manager', {id: ''}],
    ],
    minLoadTime: 200,

    getSiteData: () => {
        let alerts = require('./alerts.json');
        if (!Array.isArray(alerts)) {
            console.error(
                '/alerts.json must contain an array of alert objects'
            );
            alerts = [];
        }

        return {
            alerts: alerts
                .filter(alert => alert.active !== false)
                .map(alert => ({
                    htmlMessage: marked(alert.message),
                    level: alert.level || 'info',
                    id: hashSum(alert),
                })),
        };
    },

    getRoutes: async () => {
        return [
            {
                path: '404',
                template: 'src/pages/404.js',
            },
            {
                path: '/',
                template: 'src/pages/index.js',
            },
            {
                path: '/about',
                template: 'src/pages/about.js',
            },
            {
                path: '/docs/',
                template: 'src/pages/docs.js',
                redirect: '/docs/v2',
            },
            {
                path: '/docs/v1',
                template: 'src/pages/docs/v1.js',
            },
            {
                path: '/docs/v2',
                template: 'src/pages/docs/v2.js',
                getData: async () => {
                    let docs = require('./src/docs/index.js').default;
                    return {
                        docs: processDocs(docs),
                    };
                },
            },
            {
                path: '/docs/graphql',
                template: 'src/pages/docs/graphql.js',
            }
        ];
    },
};

function processDocs(docs) {
    return docs.map(doc => ({
        name: doc.name,
        id: slugify(doc.name, {lower: true}) + '-section',
        htmlDescription: doc.description ? marked(doc.description) : null,
        resources: doc.resources?.map(resource => ({
            name: resource.name,
            id: slugify(resource.name, {lower: true}),
            htmlDescription: resource.description
                ? marked(resource.description)
                : null,
            exampleRequest: resource.exampleRequest ? BASE_URL + resource.exampleRequest : null,
            exampleResponse: resource.exampleResponse
                ? JSON.parse(
                      JSON.stringify(resource.exampleResponse, null, 2).replace(
                          /\$BASE_URL/g,
                          BASE_URL
                      )
                  )
                : null,
            responseModels: resource.responseModels.map(model => ({
                name: model.name,
                id: slugify(model.name, {lower: true}),
                fields: model.fields.map(field => ({
                    name: field.name,
                    htmlDescription: marked(field.description),
                    type: field.type,
                })),
            })),
        })),
        endOfSection: doc.endOfSection,
    }));
}
