module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        jshint: {
            all: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: ['backbone.blazer.js']
            }
        },

        mochaTest: {
            test: {
                options: {
                    clearRequireCache: true,
                    reporter: 'spec'
                },
                src: ['test/**/*.spec.js']
            }
        }
    });

    grunt.registerTask('default', ['jshint', 'mochaTest']);
};
