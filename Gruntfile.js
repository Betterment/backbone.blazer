module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        jshint: {
            all: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: ['trailblazer.js']
            }
        },

        mochaTest: {
            test: {
                options: {
                    clearRequireCache: true,
                    reporter: 'spec'
                },
                src: ['trailblazer.spec.js']
            }
        }
    });

    grunt.registerTask('default', ['jshint', 'mochaTest']);
};
