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
                    require: 'test/setup.js',
                    clearRequireCache: true,
                    reporter: 'dot'
                },
                src: ['test/**/*.spec.js']
            }
        }
    });

    grunt.registerTask('default', ['jshint', 'mochaTest']);
};
